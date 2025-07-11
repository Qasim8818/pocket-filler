const mongoose = require('mongoose');

const associateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  sharedBy: { type: String }, // who shared the contract with this associate
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
  createdBy: { type: String }, // who created the contract
  associates: [associateSchema],
}, {
  timestamps: true,
});

const Contract = mongoose.model('Contract', contractSchema);
module.exports = Contract;
