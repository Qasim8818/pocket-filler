const Associate = require('../models/associates');
const crypto = require('crypto');

// Add user and send invitation link
exports.addUser = async (req, res) => {
  const { name, email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const existingAssociate = await Associate.findOne({ email });
    if (existingAssociate) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const invitationToken = crypto.randomBytes(20).toString('hex');
    const invitationLink = `http://Pocketfiller/invite/${invitationToken}`;
    const associate = new Associate({ name, email, invitationLink, status: 'pending' });
    await associate.save();
    // Here you can add email sending logic with invitationLink
    res.status(201).json({ message: 'Invitation sent successfully.', associate });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Failed to add user.' });
  }
};

// Add manually by email address
exports.addManually = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const existingAssociate = await Associate.findOne({ email });
    if (existingAssociate) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const associate = new Associate({ email, status: 'pending' });
    await associate.save();
    res.status(201).json({ message: 'Associate added manually.', associate });
  } catch (error) {
    console.error('Error adding associate manually:', error);
    res.status(500).json({ message: 'Failed to add associate manually.' });
  }
};

// Get list of associates
exports.getAssociates = async (req, res) => {
  try {
    const associates = await Associate.find();
    res.status(200).json({ associates });
  } catch (error) {
    console.error('Error fetching associates:', error);
    res.status(500).json({ message: 'Failed to fetch associates.' });
  }
};

// Remove associate by ID
exports.removeAssociate = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(400).json({ message: 'Associate ID is required.' });
  }
  try {
    const associate = await Associate.findByIdAndDelete(associateId);
    if (!associate) {
      return res.status(404).json({ message: 'Associate not found.' });
    }
    res.status(200).json({ message: 'Associate removed successfully.' });
  } catch (error) {
    console.error('Error removing associate:', error);
    res.status(500).json({ message: 'Failed to remove associate.' });
  }
};

// Get status of client request
exports.getStatus = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(400).json({ message: 'Associate ID is required.' });
  }
  try {
    const associate = await Associate.findById(associateId);
    if (!associate) {
      return res.status(404).json({ message: 'Associate not found.' });
    }
    res.status(200).json({ status: associate.status });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ message: 'Failed to fetch status.' });
  }
};

// Accept associate request
exports.acceptAssociate = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(400).json({ message: 'Associate ID is required.' });
  }
  try {
    const associate = await Associate.findById(associateId);
    if (!associate) {
      return res.status(404).json({ message: 'Associate not found.' });
    }
    associate.status = 'accepted';
    await associate.save();
    res.status(200).json({ message: 'Associate request accepted.', associate });
  } catch (error) {
    console.error('Error accepting associate:', error);
    res.status(500).json({ message: 'Failed to accept associate.' });
  }
};

// Reject associate request
exports.rejectAssociate = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(400).json({ message: 'Associate ID is required.' });
  }
  try {
    const associate = await Associate.findById(associateId);
    if (!associate) {
      return res.status(404).json({ message: 'Associate not found.' });
    }
    associate.status = 'rejected';
    await associate.save();
    res.status(200).json({ message: 'Associate request rejected.', associate });
  } catch (error) {
    console.error('Error rejecting associate:', error);
    res.status(500).json({ message: 'Failed to reject associate.' });
  }
};
