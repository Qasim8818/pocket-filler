const Associate = require("../models/associates");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { createTransporter, sendMail } = require("./authController");

async function sendInvitationEmail(email, name, invitationLink) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Invitation to join Pocketfiller",
      text: `Hello ${
        name || ""
      },\n\nYou have been invited to join Pocketfiller. Please use the following link to accept the invitation:\n\n${invitationLink}\n\nBest regards,\nPocketfiller Team`,
    };

    const info = await sendMail(mailOptions);
    console.log(`Invitation email sent to ${email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return false;
  }
}

exports.addUser = async (req, res) => {
  const { name, email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {
    const existingAssociate = await Associate.findOne({ email });
    if (existingAssociate) {
      return res.status(409).json({ message: "User already exists." });
    }

    const invitationToken = crypto.randomBytes(20).toString("hex");
    const invitationLink = `http://Pocketfiller/invite/${invitationToken}`;

    // Generate sequential associateId
    const lastAssociate = await Associate.findOne({
      associateId: { $exists: true },
    }).sort({ associateId: -1 });
    const associateId =
      lastAssociate && lastAssociate.associateId
        ? lastAssociate.associateId + 1
        : 1;

    const associate = new Associate({
      associateId,
      name,
      email,
      invitationLink,
      status: "pending",
      associateId,
      invitationCode: invitationToken,
    });
    // Save the associate to the database
    associate.id = associate.associateId;
    associate.invitationLink = invitationLink;
    associate.status = "pending";
    associate.role = "user"; // Default role can be set here
    associate.profilePicture = "default-profile.png"; // Default profile picture
    associate.lastActive = Date.now();
    associate.lastLogin = Date.now();
    associate.isActive = true;
    associate.createdAt = Date.now();
    associate.updatedAt = Date.now();
    associate.contractType = "fixed"; // Default contract type
    associate.hourlyRate = 0; // Default hourly rate
    associate.fixedPrice = 0; // Default fixed price
    associate.contractStartDate = null; // No contract start date initially
    associate.contractEndDate = null; // No contract end date initially
    associate.contractStatus = "active"; // Default contract status
    associate.contractDetails = ""; // No contract details initially
    associate.contractFile = ""; // No contract file initially
    associate.contractSignature = ""; // No contract signature initially
    associate.contractSigned = false; // Contract not signed initially
    associate.contractSignedDate = null; // No contract signed date initially
    associate.contractReviewed = false; // Contract not reviewed initially
    associate.contractReviewedDate = null; // No contract reviewed date initially
    associate.contractReviewedStatus = "approved"; // Default contract reviewed status
    associate.contractReviewedByAdmin = null; // No admin reviewed initially
    associate.contractReviewedByAssociate = null; // No associate reviewed initially
    associate.contractReviewedByClient = null; // No client reviewed initially
    // Save the associate to the database
    await sendInvitationEmail(email, name, invitationLink);
    await associate.save();
    // Log the invitation
    console.log("Invitation sent:", associate);
    res.status(200).json({
      message: "Invitation sent successfully.",
      associate: {
        associateId: associate.associateId,
        name: associate.name,
        email: associate.email,
        profilePicture: associate.profilePicture,
        status: associate.status,
        clientRequestStatus: associate.clientRequestStatus,
        invitationStatus: associate.invitationStatus,
        invitationLink: associate.invitationLink,
        role: associate.role,
        userRole: associate.userRole,
        isVerified: associate.isVerified,
        verificationStatus: associate.verificationStatus,
        contractStatus: associate.contractStatus,
        contractDuration: associate.contractDuration,
        contractValue: associate.contractValue,
        isActive: associate.isActive,
        contractType: associate.contractType,
        hourlyRate: associate.hourlyRate,
        fixedPrice: associate.fixedPrice,
        contractSigned: associate.contractSigned,
        contractReviewed: associate.contractReviewed,
        contractReviewedStatus: associate.contractReviewedStatus,
        invitationAccepted: associate.invitationAccepted,
        invitationRejected: associate.invitationRejected,
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Failed to add user." });
  }
};

exports.addManually = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(404).json({ message: "Email is required." });
  }
  try {
    const existingAssociate = await Associate.findOne({ email });
    if (existingAssociate) {
      return res.status(409).json({ message: "User already exists." });
    }
    // Create a new associate with default values
    const invitationToken = crypto.randomBytes(20).toString("hex");
    const invitationLink = `http://Pocketfiller/invite/${invitationToken}`;

    // Generate sequential associateId
    const lastAssociate = await Associate.findOne({
      associateId: { $exists: true },
    }).sort({ associateId: -1 });
    const associateId =
      lastAssociate && lastAssociate.associateId
        ? lastAssociate.associateId + 1
        : 1;


    // Create a new associate with default values
    const associate = new Associate({ email, status: "pending" });
    associate.id = associate.associateId;
    associate.invitationLink = invitationLink;
    associate.status = "pending";
    associate.role = "user"; // Default role can be set here
    associate.profilePicture = "default-profile.png"; // Default profile picture
    associate.lastActive = Date.now();
    associate.lastLogin = Date.now();
    associate.isActive = true;
    associate.createdAt = Date.now();
    associate.updatedAt = Date.now();
    associate.contractType = "fixed"; // Default contract type
    associate.hourlyRate = 0; // Default hourly rate
    associate.fixedPrice = 0; // Default fixed price
    associate.contractStartDate = null; // No contract start date initially
    associate.contractEndDate = null; // No contract end date initially
    associate.contractStatus = "active"; // Default contract status
    associate.contractDetails = ""; // No contract details initially
    associate.contractFile = ""; // No contract file initially
    associate.contractSignature = ""; // No contract signature initially
    associate.contractSigned = false; // Contract not signed initially
    associate.contractSignedDate = null; // No contract signed date initially
    associate.contractReviewed = false; // Contract not reviewed initially
    associate.contractReviewedDate = null; // No contract reviewed date initially
    associate.contractReviewedStatus = "approved"; // Default contract reviewed status
    associate.contractReviewedByAdmin = null; // No admin reviewed initially
    associate.contractReviewedByAssociate = null; // No associate reviewed initially
    associate.contractReviewedByClient = null; // No client reviewed initially
    // Send invitation email
    const emailSent = await sendInvitationEmail(email, null, invitationLink);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send invitation email." });
    }
    // Set the invitation link
    associate.invitationLink = invitationLink;
    associate.status = "pending"; // Set status to pending
    associate.invitationCode = invitationToken; // Set the invitation code
    associate.invitationDate = Date.now(); // Set the invitation date
    associate.invitationAccepted = false; // Initially not accepted
    associate.invitationRejected = false; // Initially not rejected
    // Save the associate to the database
    await associate.save();
    console.log("associate added manually", associate);
    res.status(200).json({ 
      associateId: associate.associateId,
      message: "Associate added manually.", 
      associate 
    });
  } catch (error) {
    console.error("Error adding associate manually:", error);
    res.status(500).json({ message: "Failed to add associate manually." });
  }
};

/**
 * Add clients API - similar to addUser and addManually
 */
exports.addClients = async (req, res) => {
  const { name, email } = req.body;
  if (!email) {
    return res.status(404).json({ message: "Email is required." });
  }
  try {
    const existingClient = await Associate.findOne({ email });
    if (existingClient) {
      return res.status(409).json({ message: "Client already exists." });
    }
    const invitationToken = crypto.randomBytes(20).toString("hex");
    const invitationLink = `http://Pocketfiller/invite/${invitationToken}`;

    const lastClient = await Associate.findOne({
      clientId: { $exists: true },
    }).sort({ associateId: -1 });
    const clientId =
      lastClient && lastAssociate.associateId
        ? lastAssociate.associateId + 1
        : 1;

    const client = new Associate({
      clientId,
      name,
      email,
      invitationLink,
      status: "pending",
    });
    client.invitationLink = invitationLink;
    client.status = "pending";
    client.role = "client"; // Default role for clients

    await client.save();

    // Send invitation email
    await sendInvitationEmail(email, name, invitationLink);

    console.log("client invitation sent:", client);
    res
      .status(200)
      .json({ message: "Client invitation sent successfully.", client });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ message: "Failed to add client." });
  }
};

/**
 * Get client requests API - shows clients with status reject or accept
 */
exports.getClientRequests = async (req, res) => {
  try {
    const clients = await Associate.find({
      status: { $in: ["accepted", "rejected", "pending"] },
    });
    res.status(200).json({ clients });
  } catch (error) {
    console.error("Error fetching client requests:", error);
    res.status(500).json({ message: "Failed to fetch client requests." });
  }
};

/**
 * Accept client API
 */
exports.acceptClient = async (req, res) => {
  const { clientId } = req.params;
  if (!clientId) {
    return res.status(404).json({ message: "Client ID is required." });
  }
  try {
    const client = await Associate.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
    client.status = "accepted";

    await client.save();
    console.log("client accepted", client);
    res.status(200).json({ 
      clientId: client._id,
      message: "Client request accepted.", 
      client 
    });
  } catch (error) {
    console.error("Error accepting client:", error);
    res.status(500).json({ message: "Failed to accept client." });
  }
};

/**
 * Reject client API
 */
exports.rejectClient = async (req, res) => {
  const { clientId } = req.params;
  if (!clientId) {
    return res.status(404).json({ message: "Client ID is required." });
  }
  try {
    const client = await Associate.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
    client.status = "rejected";
    await client.save();
    console.log("client rejected", client);
    res.status(200).json({ message: "Client request rejected.", client });
  } catch (error) {
    console.error("Error rejecting client:", error);
    res.status(500).json({ message: "Failed to reject client." });
  }
};

/**
 * Get all clients API - shows all clients with their status
 */
exports.getClients = async (req, res) => {
  try {
    const clients = await Associate.find();
    res.status(200).json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Failed to fetch clients." });
  }
};

/**
 * Remove client API
 */
exports.removeClient = async (req, res) => {
  const { clientId } = req.params;
  if (!clientId) {
    return res.status(404).json({ message: "Client ID is required." });
  }
  try {
    const client = await Associate.findByIdAndDelete(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
    res.status(200).json({ message: "Client removed successfully." });
  } catch (error) {
    console.error("Error removing client:", error);
    res.status(500).json({ message: "Failed to remove client." });
  }
};

exports.getAssociates = async (req, res) => {
  try {
    const associates = await Associate.find();
    res.status(200).json({ associates });
  } catch (error) {
    console.error("Error fetching associates:", error);
    res.status(500).json({ message: "Failed to fetch associates." });
  }
};

exports.removeAssociate = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(409).json({ message: "Associate ID is required." });
  }
  try {
    const associate = await Associate.findByIdAndDelete(associateId);
    if (!associate) {
      return res.status(404).json({ message: "Associate not found." });
    }
    res.status(200).json({ message: "Associate removed successfully." });
  } catch (error) {
    console.error("Error removing associate:", error);
    res.status(500).json({ message: "Failed to remove associate." });
  }
};

exports.getStatus = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(409).json({ message: "Associate ID is required." });
  }

  try {
    const associate = await Associate.findOne({
      associateId: parseInt(associateId),
    });
    if (!associate) {
      return res.status(404).json({ message: "Associate not found." });
    }
    res.status(200).json({ 
      associateId: associate.associateId,
      status: associate.status 
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ message: "Failed to fetch status." });
  }
};

exports.acceptAssociate = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(404).json({ message: "Associate ID is required." });
  }

  try {
    const associate = await Associate.findOne({
      associateId: parseInt(associateId),
    });
    if (!associate) {
      return res.status(404).json({ message: "Associate not found." });
    }
    associate.status = "accepted";
    await associate.save();
    console.log("associate has been accepted", associate);
    res.status(200).json({ 
      associateId: associate.associateId,
      message: "Associate request accepted.", 
      associate 
    });
  } catch (error) {
    console.error("Error accepting associate:", error);
    res.status(500).json({ message: "Failed to accept associate." });
  }
};

exports.rejectAssociate = async (req, res) => {
  const { associateId } = req.params;
  if (!associateId) {
    return res.status(404).json({ message: "Associate ID is required." });
  }
  try {
    const associate = await Associate.findOne({ associateId: parseInt(associateId) });
    if (!associate) {
      return res.status(404).json({ message: "Associate not found." });
    }
    associate.status = "rejected";
    await associate.save();
    console.log("associate has been rejected", associate);
    res.status(200).json({ message: "Associate request rejected.", associate });
  } catch (error) {
    console.error("Error rejecting associate:", error);
    res.status(500).json({ message: "Failed to reject associate." });
  }
};
