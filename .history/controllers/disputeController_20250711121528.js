const Dispute = require('../models/dispute');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer upload middleware
const upload = multer({ storage: storage });

exports.upload = upload.array('documents', 10); // max 10 files

exports.submitDispute = async (req, res) => {
  const { projectId, userId, initialMessage } = req.body;
  if (!projectId || !userId || !initialMessage) {
    return res.status(400).json({ message: 'Project ID, User ID, and initial message are required.' });
  }
  try {
    const dispute = new Dispute({
      projectId,
      userId,
      initialMessage,
      status: 'Open',
      messages: [],
      documents: [],
    });
    await dispute.save();
    res.status(201).json({ message: 'Dispute submitted successfully.', dispute });
  } catch (error) {
    console.error('Error submitting dispute:', error);
    res.status(500).json({ message: 'Failed to submit dispute.' });
  }
};

exports.getDisputeDetails = async (req, res) => {
  const { disputeId } = req.params;
  if (!disputeId) {
    return res.status(400).json({ message: 'Dispute ID is required.' });
  }
  try {
    const dispute = await Dispute.findById(disputeId).populate('messages.senderId', 'fullName email');
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }
    res.status(200).json({ dispute });
  } catch (error) {
    console.error('Error fetching dispute details:', error);
    res.status(500).json({ message: 'Failed to fetch dispute details.' });
  }
};

exports.addMessage = async (req, res) => {
  const { disputeId } = req.params;
  const { senderId, message } = req.body;
  if (!disputeId || !senderId || !message) {
    return res.status(400).json({ message: 'Dispute ID, sender ID, and message are required.' });
  }
  try {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }
    dispute.messages.push({ senderId, message, timestamp: new Date() });
    dispute.updatedAt = new Date();
    await dispute.save();
    res.status(200).json({ message: 'Message added successfully.', dispute });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Failed to add message.' });
  }
};

exports.uploadDocuments = async (req, res) => {
  const { disputeId } = req.params;
  if (!disputeId) {
    return res.status(400).json({ message: 'Dispute ID is required.' });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'At least one document file is required.' });
  }
  try {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }
    req.files.forEach(file => {
      const fileUrl = `/uploads/${file.filename}`;
      dispute.documents.push({ url: fileUrl, uploadedAt: new Date() });
    });
    dispute.updatedAt = new Date();
    await dispute.save();
    res.status(200).json({ message: 'Documents uploaded successfully.', dispute });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ message: 'Failed to upload documents.' });
  }
};

exports.withdrawDispute = async (req, res) => {
  const { disputeId } = req.params;
  if (!disputeId) {
    return res.status(400).json({ message: 'Dispute ID is required.' });
  }
  try {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }
    dispute.status = 'Withdrawn';
    dispute.updatedAt = new Date();
    await dispute.save();
    res.status(200).json({ message: 'Dispute withdrawn successfully.', dispute });
  } catch (error) {
    console.error('Error withdrawing dispute:', error);
    res.status(500).json({ message: 'Failed to withdraw dispute.' });
  }
};
