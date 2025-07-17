const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  profilePicture: {
    type: String,
    default:
      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
  },
  organizationId: {
    type: Number,
    unique: true,
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
    default: "organization",
  },
}, {
  timestamps: true,
});

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
