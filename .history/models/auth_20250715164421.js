const mongoose = require('mongoose');


const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        },
    userRole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userRole",
    },
    userType: {
        type: String,
        enum: ['user', 'organization'],
        default: 'user',
        },
        role: {
        type: String,
        enum: ['user', 'organization'],
        default: 'user',
    },
    username: {
        type: String,
        required: false,
    },
    profilePicture: {
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
    },
    isOrganization: {
        type: Boolean,
        default: false,
    },
    organizationRole: {
        type: String,
        enum: ['user', 'organization'],
        default: "organization",
        },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    },
    organizationName: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isUser: {
        type: Boolean,
        default: true,
        role: 'user',
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    verificationCode: {
        type: String,
        default: null,
    },
    verificationCodeExpiresAt: {
        type: Date,
        default: null,
    },
    contactNumber: {
        type: String,
    },
    password: {
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
