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
    }
}, {
    timestamps: true,
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
