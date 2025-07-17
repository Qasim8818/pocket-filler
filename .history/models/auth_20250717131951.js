const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    userId: {
        type: Number,
        unique: true,
    },
    username: {
        type: String,
        required: false,
    },
    profilePicture: {
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    contactNumber: {
        type: String,
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
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    role: {
        type: String,
        enum: ["user", "organization"],
        default: "user",
    },
}, {
    timestamps: true,
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
