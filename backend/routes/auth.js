const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/auth');
const {
    signup,
    login,
    refresh,
    logout,
    me,
    signupValidation,
    loginValidation
} = require('../controllers/auth');

// Rate limiter for auth endpoints — max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { msg: 'TOO MANY ATTEMPTS. WAIT 15 MINUTES.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/signup', authLimiter, signupValidation, signup);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
