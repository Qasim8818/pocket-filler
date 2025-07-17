const mongoose = require("mongoose");

const associateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profilePicture: { type: String, default: "default-profile.png" },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["admin", "associate", "client", "user"],
      default: "associate",
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Associate = mongoose.model("Associate", associateSchema);
module.exports = Associate;
