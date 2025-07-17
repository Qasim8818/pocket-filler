const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
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
  filename: { type: String, required: true },
  uploadedByRole: {
    type: String,
    enum: ["associate", "client"],
    required: true,
  },
});

const disputeSchema = new mongoose.Schema(
  {
    disputeId: { type: Number, unique: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
    associateId: { type: mongoose.Schema.Types.ObjectId, ref: "Associate" },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
    title: { type: String, required: true },
    initialMessage: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "Closed", "Withdrawn"],
      default: "Open",
    },
    messages: [messageSchema],
    documents: [documentSchema],
  },
  {
    timestamps: true,
  }
);

const Dispute = mongoose.model("Dispute", disputeSchema);
module.exports = Dispute;
