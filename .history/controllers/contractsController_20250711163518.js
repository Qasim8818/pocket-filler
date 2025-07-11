const Contract = require('../models/contracts');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const contractStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/contracts';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const signatureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/signatures';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const uploadContract = multer({ storage: contractStorage });
const uploadSignature = multer({ storage: signatureStorage });

exports.addContracts = async (req, res) => {
  const { contractName, contractType } = req.body;
  if (!contractName || !contractType) {
    return res.status(404).json({ message: 'Contract name and type are required.' });
  }
  try {
    const contract = new Contract({ contractName, contractType });
    await contract.save();
    res.status(201).json({ message: 'Contract created successfully.', contractId: contract._id });
    console.log("contract has been added", contract)
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Failed to create contract.' });
  }
};

exports.uploadContracts = [
  uploadContract.single('contractFile'),
  async (req, res) => {
    const { contractId } = req.body;
    if (!req.file) {
      return res.status(409).json({ message: 'Contract file is required.' });
    }
    if (!contractId) {
      return res.status(404).json({ message: 'Contract ID is required.' });
    }
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return res.status(400).json({ message: 'Contract not found.' });
      }
      contract.contractFile = req.file.path;
      await contract.save();
      res.status(200).json({ message: 'Contract file uploaded successfully.', contract });
      console.log("contract uploaded", contract)
    } catch (error) {
      console.error('Error uploading contract file:', error);
      res.status(500).json({ message: 'Failed to upload contract file.' });
    }
  }

];

exports.previewContract = async (req, res) => {
  const { contractId } = req.params;
  try {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    res.status(200).json({ contract });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ message: 'Failed to fetch contract.' });
  }
};

exports.uploadSignature = [
  uploadSignature.single('signatureFile'),
  async (req, res) => {
    const { contractId } = req.body;
    if (!req.file) {
      return res.status(404).json({ message: 'Signature file is required.' });
    }
    if (!contractId) {
      return res.status(404).json({ message: 'Contract ID is required.' });
    }
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found.' });
      }
      contract.signatureFile = req.file.path;
      await contract.save();
      res.status(200).json({ message: 'Signature uploaded successfully.', contract });
      console.log("signature uploaded", contract);
    } catch (error) {
      console.error('Error uploading signature:', error);
      res.status(500).json({ message: 'Failed to upload signature.' });
    }
  }
];

exports.saveContract = async (req, res) => {
  const { contractId } = req.body;
  if (!contractId) {
    return res.status(409).json({ message: 'Contract ID is required.' });
  }
  try {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    res.status(200).json({ message: 'Contract saved successfully.', contract });
  } catch (error) {
    console.error('Error saving contract:', error);
    res.status(500).json({ message: 'Failed to save contract.' });
  }
};

exports.shareContract = async (req, res) => {
  const { contractId, associateEmail, sharedBy } = req.body;
  if (!contractId || !associateEmail || !sharedBy) {
    return res.status(404).json({ message: 'Contract ID, email, and sharedBy are required.' });
  }
  try {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    const exists = contract.associates.some(a => a.email === associateEmail);
    if (!exists) {
      contract.associates.push({ name: associateName, email: associateEmail, sharedBy });
      await contract.save();
    }
    res.status(200).json({ message: 'Contract shared successfully.', contract });
    console.log("contract save", contract)
  } catch (error) {
    console.error('Error sharing contract:', error);
    res.status(500).json({ message: 'Failed to share contract.' });
  }
};
