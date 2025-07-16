const mongoose = require("mongoose");

const associateSchema = new mongoose.Schema(
  {
    name: { type: String },
    profilePicture: { type: String, default: "default-profile.png" },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    clientRequestStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    invitationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    invitationDate: { type: Date, default: Date.now },
    invitationAccepted: { type: Boolean, default: false },
    invitationRejected: { type: Boolean, default: false },
    invitationCode: { type: String },
    invitationLink: { type: String },
    role: {
      type: String,
      enum: ["admin", "associate", "client", "user"],
      default: "associate",
    }, // admin: owner, associate: worker, client: client in contract/project
    userRole: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    adminId: { type: Number, unique: true },
    userId: { type: Number, unique: true },
    associateId: { type: Number, unique: true },
    clientId: { type: Number, unique: true },
    clientName: { type: String },
    clientEmail: { type: String },
    contractStatus: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    contractTitle: { type: String },
    contractDescription: { type: String },
    contractDuration: {
      type: String,
      enum: ["short-term", "long-term"],
      default: "short-term",
    },
    contractValue: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    contractId: { type: Number, unique: true },
    contractType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
    hourlyRate: { type: Number, default: 0 },
    fixedPrice: { type: Number, default: 0 },
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    contractDetails: { type: String },
    contractFile: { type: String },
    contractSignature: { type: String },
    contractSigned: { type: Boolean, default: false },
    contractSignedDate: { type: Date },
    contractReviewed: { type: Boolean, default: false },
    contractReviewedDate: { type: Date },
    contractReviewedStatus: {
      type: String,
      enum: ["approved", "rejected"],
      default: "approved",
    },
    contractReviewedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    contractReviewedByAssociate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Associate",
    },
    contractReviewedByClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
  },
  {
    timestamps: true,
  }
);

const Associate = mongoose.model("Associate", associateSchema);
module.exports = Associate;
