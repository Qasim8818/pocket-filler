const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: Number, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  description: { type: String, default: "" },
  type: { type: String, enum: ["pdf", "image", "doc"], default: "pdf" },
  size: { type: Number, required: true },
  Filename: { type: String, required: true },
  uploadedByRole: {
    type: String,
    enum: ["associate", "client"],
    required: true,
  },
  uploadedById: { type: Number, unique: true },
});

const disputeSchema = new mongoose.Schema(
  {
    disputeId: { type: Number, unique: true },
    projectId: { type: Number, unique: true },
    userId: { type: Number, unique: true },
    associateId: { type: Number, unique: true },
    contractId: { type: Number, unique: true },
    title: { type: String, required: true },
    initialMessage: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "Closed", "Withdrawn"],
      default: "Open",
    },
    messages: [messageSchema],
    documents: [documentSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Dispute = mongoose.model("Dispute", disputeSchema);
module.exports = Dispute;
