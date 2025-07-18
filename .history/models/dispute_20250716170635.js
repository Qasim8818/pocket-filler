const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {         type: Number,
        unique: true, },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  description: { type: String, default: '' }, // Optional description for the document
  type: { type: String, enum: ['pdf', 'image', 'doc'], default: 'pdf' }, // Type of document
  size: { type: Number, required: true }, // Size of the document in bytes
  Filename: { type: String, required: true }, // Original filename
  uploadedByRole: { type: String, enum: ['associate', 'client'], required: true }, // Role of the user who uploaded the document
  uploadedById: {         type: Number,
        unique: true, // ID of the user who uploaded the document
  },
});


const disputeSchema = new mongoose.Schema({
  projectId: {         type: Number,
        unique: true, },
  userId: {        type: Number,
        unique: true, },
  associateId: {         type: Number,
        unique: true, },
  contractId: {         type: Number,
        unique: true, },
  title: { type: String, required: true },
  initialMessage: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Closed', 'Withdrawn'], default: 'Open' },
  messages: [messageSchema],
  documents: [documentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const Dispute = mongoose.model('Dispute', disputeSchema);
module.exports = Dispute;
