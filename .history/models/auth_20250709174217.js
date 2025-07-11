const mongoose = require('mongoose');

// User authentication schema.
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
                // Simple check for email format.
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: props => `${props.value} doesn't look like a valid email.`,
        },
        description: 'Unique user email address',
    },
    password: {
        type: String,
        required: true,
        description: 'Hashed password',
    },
    roles: {
        type: [String],
        default: ['user'],
        description: 'User roles for permissions',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        description: 'Flag for email verification status',
    },
    verificationToken: {
        type: String,
        default: null,
        description: 'Token used to verify email',
    },
    resetPasswordToken: {
        type: String,
        default: null,
        description: 'Token for password reset',
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
        description: 'Expiration time for reset token',
    }
}, {
    timestamps: true,
    strict: true,
    versionKey: false,
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;
