const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const disputeSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  initialMessage: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Closed', 'Withdrawn'], default: 'Open' },
  messages: [messageSchema],
  documents: [documentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Dispute = mongoose.model('Dispute', disputeSchema);
module.exports = Dispute;
