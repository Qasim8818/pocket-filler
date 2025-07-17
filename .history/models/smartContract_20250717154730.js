const mongoose = require("mongoose");

const smartContractSchema = new mongoose.Schema(
  {
    smartContractId: {
      type: Number,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    contractType: {
      type: String,
      enum: ["employment", "service", "partnership"],
      required: true,
    },
    contractValue: {
      type: Number,
      default: 0,
    },
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
    contractDetails: {
      type: String,
      default: "",
    },
    contractFile: {
      type: String,
    },
    contractSignature: {
      type: String,
    },
    contractSigned: {
      type: Boolean,
      default: false,
    },
    contractSignedDate: {
      type: Date,
    },
    contractReviewed: {
      type: Boolean,
      default: false,
    },
    contractReviewedDate: {
      type: Date,
    },
    contractReviewedStatus: {
      type: String,
      enum: ["approved", "rejected"],
      default: "approved",
    },
    contractStartDate: {
      type: Date,
    },
    contractEndDate: {
      type: Date,
    },
    associates: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        sharedBy: { type: String },
      },
    ],
    organization: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SmartContract = mongoose.model("SmartContract", smartContractSchema);
module.exports = SmartContract;
