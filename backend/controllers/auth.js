const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/user-model');

// ---------- helpers ----------

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
    });
};

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};

// ---------- validation rules ----------

const signupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least 1 uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least 1 number')
];

const loginValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// ---------- controllers ----------

const signup = async (req, res) => {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ msg: "THAT EMAIL'S TAKEN." });
        }

        // Create user (password auto-hashed by pre-save hook)
        const user = await User.create({ name, email, password });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken();

        // Hash refresh token and store
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
        user.refreshTokens.push(hashedRefreshToken);
        await user.save();

        // Set cookie and respond
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        return res.status(201).json({ accessToken, user });

    } catch (error) {
        console.error('Signup error:', error.message);
        return res.status(500).json({ msg: 'Something went wrong. Try again.' });
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
        // Find user — generic error if not found (don't reveal if email exists)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken();

        // Hash and store — cap at 5 tokens (multi-device support)
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
        if (user.refreshTokens.length >= 5) {
            user.refreshTokens.shift(); // Remove oldest
        }
        user.refreshTokens.push(hashedRefreshToken);
        await user.save();

        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
        return res.status(200).json({ accessToken, user });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ msg: 'Something went wrong. Try again.' });
    }
};

const refresh = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(403).json({ msg: 'No refresh token provided' });
    }

    try {
        // Find the user whose stored hashed token matches
        const users = await User.find({ refreshTokens: { $exists: true, $ne: [] } });

        let matchedUser = null;
        let matchedTokenIndex = -1;

        for (const user of users) {
            for (let i = 0; i < user.refreshTokens.length; i++) {
                const isMatch = await bcrypt.compare(refreshToken, user.refreshTokens[i]);
                if (isMatch) {
                    matchedUser = user;
                    matchedTokenIndex = i;
                    break;
                }
            }
            if (matchedUser) break;
        }

        if (!matchedUser) {
            return res.status(403).json({ msg: 'Invalid refresh token' });
        }

        // Rotate: remove old token, generate new one
        matchedUser.refreshTokens.splice(matchedTokenIndex, 1);

        const newRefreshToken = generateRefreshToken();
        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 12);
        matchedUser.refreshTokens.push(hashedNewRefreshToken);
        await matchedUser.save();

        const accessToken = generateAccessToken(matchedUser._id);

        res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
        return res.status(200).json({ accessToken, user: matchedUser });

    } catch (error) {
        console.error('Refresh error:', error.message);
        return res.status(500).json({ msg: 'Something went wrong. Try again.' });
    }
};

const logout = async (req, res) => {
    const { refreshToken } = req.cookies;

    try {
        if (refreshToken) {
            const user = await User.findById(req.userId);
            if (user) {
                // Find and remove the matching refresh token
                const updatedTokens = [];
                for (const hashedToken of user.refreshTokens) {
                    const isMatch = await bcrypt.compare(refreshToken, hashedToken);
                    if (!isMatch) {
                        updatedTokens.push(hashedToken);
                    }
                }
                user.refreshTokens = updatedTokens;
                await user.save();
            }
        }

        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        return res.status(200).json({ msg: "YOU'RE OUT." });

    } catch (error) {
        console.error('Logout error:', error.message);
        return res.status(500).json({ msg: 'Something went wrong. Try again.' });
    }
};

const me = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Me error:', error.message);
        return res.status(500).json({ msg: 'Something went wrong. Try again.' });
    }
};

module.exports = {
    signup,
    login,
    refresh,
    logout,
    me,
    signupValidation,
    loginValidation
};
