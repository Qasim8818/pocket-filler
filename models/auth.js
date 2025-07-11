const mongoose = require('mongoose');


const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    contactNumber: {
        type: String,
    },
    password: {
        type: String,
    },
    roles: {
        type: [String],
        default: ['user'],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        default: null,
    },
    verificationCodeExpires: {
        type: Date,
        default: null,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPassword: {
        type: Boolean,
        default: false,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
