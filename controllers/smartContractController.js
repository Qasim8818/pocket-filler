const SmartContract = require('../models/smartContract'); // Assuming a model will be created

// Create a new smart contract
exports.createSmartContract = async (req, res) => {
  const { title, totalAmount } = req.body;

  if (!title || !totalAmount) {
    return res.status(400).json({ message: 'Title and total amount are required.' });
  }

  try {
    const mongoose = require('mongoose');
    const Associate = require('../models/associates');
    
    // Generate sequential smartContractId
    const lastContract = await SmartContract.findOne().sort({ _id: -1 });
    const smartContractId = lastContract ? (lastContract.smartContractId || 0) + 1 : 1;
    
    // Generate sequential associateSequentialId
    const lastAssociate = await Associate.findOne().sort({ associateId: -1 });
    const associateSequentialId = lastAssociate ? (lastAssociate.associateId || 0) + 1 : 1;
    
    // Generate sequential IDs for tracking
    const projectManagerSequentialId = smartContractId; // Use same as contract for simplicity
    const contractSequentialId = smartContractId; // Use same as contract for simplicity
    
    // Create valid ObjectIds for required fields
    const defaultObjectId = new mongoose.Types.ObjectId();
    
    const newContract = new SmartContract({
      smartContractId,
      title,
      totalAmount,
      status: 'In-Progress', // Valid enum value
      createdBy: defaultObjectId, // Valid ObjectId
      updatedBy: defaultObjectId, // Valid ObjectId
      currency: 'USD', // Required field
      contractType: 'employment', // Valid enum value
      description: req.body.description || 'Contract description', // Required field
      startDate: req.body.startDate || new Date(), // Required field
      endDate: req.body.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Required field
      budget: req.body.budget || totalAmount, // Required field
      organization: req.body.organization || 'Default Organization', // Required field
      associateId: defaultObjectId, // Valid ObjectId for required field
      projectManagerId: defaultObjectId, // Valid ObjectId for required field
      associateSequentialId, // Sequential associate ID for tracking
      projectManagerSequentialId, // Sequential project manager ID for tracking
      projectType: 'Internal', // Required field with valid enum
      projectStatus: 'Active', // Required field with valid enum
      priority: req.body.priority || 'Medium', // Default priority
      tags: req.body.tags || [], // Optional tags
      milestones: req.body.milestones || [], // Optional milestones
      budgetDetails: {
        initialBudget: totalAmount,
        currentBudget: totalAmount,
        spentAmount: 0,
        remainingBudget: totalAmount,
      },
      progress: 0, // Default progress
      files: [], // Initialize with no files
      comments: [], // Initialize with no comments
      activities: [], // Initialize with no activities
      chatMessages: [], // Initialize with no chat messages
      createdAt: new Date(),
      updatedAt: new Date(),
      contractId: defaultObjectId, // Valid ObjectId for required field
      contractSequentialId, // Sequential contract ID for tracking
      avatarUrl: req.body.avatarUrl || '', // Optional avatar URL
      type: req.body.type || 'Standard', // Default type
      documents: [], // Initialize with no documents
      clients: [], // Initialize with no clients
    });

    await newContract.save();
    console.log("Smart contract has been created", newContract);
    // Respond with the created contract

    res.status(201).json({ 
      smartContractId,
      associateSequentialId,
      projectManagerSequentialId,
      contractSequentialId,
      message: 'Smart contract created successfully.', 
      contract: newContract 
    });
  } catch (error) {
    console.error('Error creating smart contract:', error);
    res.status(500).json({ message: 'Failed to create smart contract.' });
    console.log(error)
  }
};
