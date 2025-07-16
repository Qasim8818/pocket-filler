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
  contractDescription: { type: String },
  contractValue: { type: Number, default: 0 },
  contractDuration: { type: String, enum: ['short-term', 'long-term'], default: 'short-term' },
  contractStatus: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  contractDetails: { type: String },
  contractFile: { type: String }, // path to the contract file
  contractSignature: { type: String }, // path to the signature file
  contractSigned: { type: Boolean, default: false },
  contractSignedDate: { type: Date },
  contractReviewed: { type: Boolean, default: false },
  contractReviewedDate: { type: Date },
  contractReviewedStatus: { type: String, enum: ['approved', 'rejected'], default: 'approved' },
  contractReviewedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  contractReviewedByAssociate: { type: mongoose.Schema.Types.ObjectId, ref: 'Associate' },
  contractReviewedByClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  contractStartDate: { type: Date },
  contractEndDate: { type: Date },
  contractSignature: { type: String }, // path to the contract signature file
  contractSigned: { type: Boolean, default: false },
  contractSignedDate: { type: Date },
  contractReviewed: { type: Boolean, default: false },
  contractReviewedDate: { type: Date },
  contractReviewedStatus: { type: String, enum: ['approved', 'rejected'], default: 'approved' },
  contractReviewedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  contractReviewedByAssociate: { type: mongoose.Schema.Types.ObjectId, ref: 'Associate    ' },
  contractReviewedByClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  contractFilePath: { type: String }, // path to the contract file
  contractSignaturePath: { type: String }, // path to the signature file
  contractCreatedDate: { type: Date, default: Date.now },
  contractUpdatedDate: { type: Date, default: Date.now },
  contractId: { type: Number, unique: true },
  createdBy: { type: String }, // who created the contract
  associates: [associateSchema],
}, {
  timestamps: true,
});

const Contract = mongoose.model('Contract', contractSchema);
module.exports = Contract;
