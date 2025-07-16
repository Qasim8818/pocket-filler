const Dispute = require('../models/dispute');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure the uploads folder exists, if not, create it
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// Multer middleware to handle multiple file uploads (up to 10)
const upload = multer({ storage });

exports.upload = upload.array('documents', 10); // limit to 10 files

// Submit a new dispute
exports.submitDispute = async (req, res) => {
  const { projectId, userId, initialMessage } = req.body;

  if (!projectId || !userId || !initialMessage) {
    return res.status(409).json({ message: 'Please provide project ID, user ID, and an initial message.' });
  }

  try {
    const newDispute = new Dispute({
      projectId,
      userId,
      initialMessage,
      status: 'Open',
      messages: [],
      documents: [],
      associateId: req.user._id, // Assuming the user is authenticated and their ID is available
      contractId: req.body.contractId, // Assuming contractId is provided in the request body
      title: req.body.title || 'Dispute Title', // Optional title, default if not provided
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // If files are uploaded, handle them
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileUrl = `/uploads/${file.filename}`;
        newDispute.documents.push({
          url: fileUrl,
          uploadedAt: new Date(),
          uploadedBy: userId, // Assuming the user who created the dispute is the uploader
          description: file.originalname, // Optional description
          type: file.mimetype.split('/')[1], // Extracting type from MIME type
          size: file.size, // Size in bytes
          Filename: file.originalname, // Original filename
          uploadedByRole: req.user.role || 'associate', // Assuming role is available in user object
          uploadedById: userId // ID of the user who uploaded the document
        });
      });
      newDispute.updatedAt = new Date();
    }
    await newDispute.save();
    
    console.log("dispute has been submitted", newDispute)
    res.status(201).json({ message: 'Your dispute has been submitted successfully.', dispute: newDispute });
  } catch (err) {
    console.error('Failed to submit dispute:', err);
    res.status(500).json({ message: 'Oops! Something went wrong while submitting your dispute.' });
  }
};

// Retrieve details of a dispute by its ID
exports.getDisputeDetails = async (req, res) => {
  const { disputeId } = req.params;

  if (!disputeId) {
    return res.status(402).json({ message: 'Dispute ID must be provided.' });
  }

  try {
    const dispute = await Dispute.findById(disputeId).populate('messages.senderId', 'fullName email');

    if (!dispute) {
      return res.status(404).json({ message: 'Could not find the dispute you requested.' });
    }

    res.status(200).json({ dispute });
  } catch (err) {
    console.error('Error retrieving dispute details:', err);
    res.status(500).json({ message: 'Failed to get dispute details. Please try again later.' });
  }
};

// Add a message to an existing dispute
exports.addMessage = async (req, res) => {
  const { disputeId } = req.params;
  const { senderId, message } = req.body;

  if (!disputeId || !senderId || !message) {
    return res.status(404).json({ message: 'Dispute ID, sender ID, and message are all required.' });
  }

  try {
    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }

    dispute.messages.push({ senderId, message, timestamp: new Date() });
    // Update the updatedAt field to the current date
    dispute.updatedAt = new Date();
    // Save the updated dispute
    await dispute.save();

    console.log("message has been added to dispute", dispute)
    res.status(200).json({ message: 'Your message has been added.', dispute });
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ message: 'Could not add your message. Please try again.' });
  }
};

// Upload documents for a dispute
exports.uploadDocuments = async (req, res) => {
  const { disputeId } = req.params;

  if (!disputeId) {
    return res.status(409).json({ message: 'Dispute ID is required to upload documents.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(403).json({ message: 'Please upload at least one document.' });
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
    // Update the updatedAt field to the current date


    dispute.updatedAt = new Date();
    await dispute.save();
    console.log("documents uploaded to dispute", dispute)

    res.status(200).json({ message: 'Documents uploaded successfully.', dispute });
  } catch (err) {
    console.error('Error uploading documents:', err);
    res.status(500).json({ message: 'Failed to upload documents. Please try again.' });
  }
};

// Withdraw a dispute
exports.withdrawDispute = async (req, res) => {
  const { disputeId } = req.params;

  if (!disputeId) {
    return res.status(402).json({ message: 'Dispute ID is required to withdraw.' });
  }

  try {
    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }

    dispute.status = 'Withdrawn';

    dispute.updatedAt = new Date();


    await dispute.save();

    console.log("dispute has been withdrawn", dispute)
    res.status(200).json({ message: 'Dispute has been withdrawn.', dispute });
  } catch (err) {
    console.error('Error withdrawing dispute:', err);
    res.status(500).json({ message: 'Could not withdraw dispute. Please try again.' });
  }
  exports.getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().populate('userId', 'fullName email').populate('associateId', 'fullName email').populate('contractId', 'title');

    if (!disputes || disputes.length === 0) {
      return res.status(404).json({ message: 'No disputes found.' });
    }

    res.status(200).json({ disputes });
  } catch (err) {
    console.error('Error retrieving disputes:', err);
    res.status(500).json({ message: 'Failed to retrieve disputes. Please try again later.' });
  }
  }
};
