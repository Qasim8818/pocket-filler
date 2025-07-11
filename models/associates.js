const mongoose = require('mongoose');

const associateSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  invitationLink: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Associate = mongoose.model('Associate', associateSchema);
module.exports = Associate;
