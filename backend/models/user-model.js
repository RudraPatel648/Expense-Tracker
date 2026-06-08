const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Must provide name'],
            trim: true,
            maxLength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Must provide email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Must provide password'],
            minlength: [8, 'Password must be at least 8 characters']
        },
        refreshTokens: {
            type: [String],
            default: []
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

// Pre-save hook — hash password only if modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Strip password and refreshTokens from JSON responses
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshTokens;
    delete user.__v;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
