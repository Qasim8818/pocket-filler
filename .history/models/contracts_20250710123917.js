const mongoose = require('mongoose');

const associateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const contractSchema = new mongoose.Schema({
  contractName: {
    type: String,
    required: true,
  },
  contractType: {
    type: String,
    required: true,
  },
  contractFile: {
    type: String, // path to uploaded contract file
  },
  signatureFile: {
    type: String, // path to uploaded signature file
  },
  associates: [associateSchema],
}, {
  timestamps: true,
});

const Contract = mongoose.model('Contract', contractSchema);
module.exports = Contract;
