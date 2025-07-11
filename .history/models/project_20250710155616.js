const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: { type: String },
});

const chatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'call'], default: 'text' },
  timestamp: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  title: { type: String, required: true },
  organization: { type: String, required: true },
  status: { type: String, enum: ['Completed', 'In-Progress'], required: true },
  type: { type: String, required: true },
  activities: [activitySchema],
  documents: [documentSchema],
  clients: [clientSchema],
  chatMessages: [chatMessageSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
