const mongoose = require('mongoose');

/**
 * Schema for user authentication details.
 * Includes fields for user info, verification, and password reset.
 */
const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        description: 'User full name',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email) {
                // Basic email format validation
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: props => `${props.value} is not a valid email address.`,
        },
        description: 'Unique user email address',
    },
    password: {
        type: String,
        required: true,
        description: 'Hashed password',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        description: 'Indicates if email has been verified',
    },
    verificationToken: {
        type: String,
        default: null,
        description: 'Token for email verification',
    },
    resetPasswordToken: {
        type: String,
        default: null,
        description: 'Token for password reset',
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
        description: 'Expiry date for reset token',
    }
}, {
    timestamps: true,
    strict: true,
    versionKey: false,
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
