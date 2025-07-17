const mongoose = require("mongoose");

const associateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  sharedBy: { type: String },
});

const contractSchema = new mongoose.Schema(
  {
    contractId: { type: Number, unique: true },
    contractName: { type: String, required: true },
    contractType: { type: String, required: true },
    contractFile: { type: String },
    signatureFile: { type: String },
    contractDescription: { type: String },
    contractValue: { type: Number, default: 0 },
    contractDuration: {
      type: String,
      enum: ["short-term", "long-term"],
      default: "short-term",
    },
    contractStatus: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    contractDetails: { type: String },
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    contractSigned: { type: Boolean, default: false },
    contractSignedDate: { type: Date },
    contractReviewed: { type: Boolean, default: false },
    contractReviewedDate: { type: Date },
    contractReviewedStatus: {
      type: String,
      enum: ["approved", "rejected"],
      default: "approved",
    },
    contractFilePath: { type: String },
    contractSignaturePath: { type: String },
    contractCreatedDate: { type: Date, default: Date.now },
    contractUpdatedDate: { type: Date, default: Date.now },
    createdBy: { type: String },
    associates: [associateSchema],
  },
  {
    timestamps: true,
  }
);

const Contract = mongoose.model("Contract", contractSchema);
module.exports = Contract;
