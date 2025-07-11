const mongoose = require('mongoose');

/**
 * User authentication schema
 * Defines the structure of user authentication documents in MongoDB
 */
const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
        description: 'Full name of the user',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        description: 'User email address, must be unique and valid',
    },
    password: {
        type: String,
        required: true,
        description: 'Hashed user password',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        description: 'Flag indicating if user email is verified',
    },
    verificationToken: {
        type: String,
        default: null,
        description: 'Token used for email verification',
    },
    resetPasswordToken: {
        type: String,
        default: null,
        description: 'Token used for resetting password',
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
        description: 'Expiration date for reset password token',
    }
}, {
    timestamps: true,
});  

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
