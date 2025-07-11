const mongoose = require('mongoose');
const { stringify } = require('querystring');

const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: null,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    newPassword: {
        type: String,
        unique: true,
        required: true,
    },
}, {
    timestamps: true,
});  

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;