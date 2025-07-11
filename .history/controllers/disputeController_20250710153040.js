const Dispute = require('../models/dispute');

// Submit a new dispute
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

// Get dispute details by dispute ID
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

// Add a message to a dispute
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

// Upload documents to a dispute
exports.uploadDocuments = async (req, res) => {
  const { disputeId } = req.params;
  const { documents } = req.body; // Expecting array of document URLs
  if (!disputeId || !documents || !Array.isArray(documents)) {
    return res.status(400).json({ message: 'Dispute ID and documents array are required.' });
  }
  try {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }
    documents.forEach(docUrl => {
      dispute.documents.push({ url: docUrl, uploadedAt: new Date() });
    });
    dispute.updatedAt = new Date();
    await dispute.save();
    res.status(200).json({ message: 'Documents uploaded successfully.', dispute });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ message: 'Failed to upload documents.' });
  }
};

// Withdraw a dispute
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
