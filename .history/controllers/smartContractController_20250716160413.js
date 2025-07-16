const SmartContract = require('../models/smartContract'); // Assuming a model will be created

// Create a new smart contract
exports.createSmartContract = async (req, res) => {
  const { title, totalAmount } = req.body;

  if (!title || !totalAmount) {
    return res.status(400).json({ message: 'Title and total amount are required.' });
  }  try {
    const newContract = new SmartContract({
      title,
      totalAmount,
      status: 'Draft', // Default status
      createdBy: req.user._id, // Assuming the user is authenticated and their ID is
      updatedBy: req.user._id, // Assuming the user is authenticated and their ID is available
      currency: 'USD', // Default currency, can be changed as needed
      contractType: 'Standard', // Default contract type, can be changed as needed
      description: req.body.description || '', // Optional description
      startDate: req.body.startDate || new Date(), // Default to current date if not provided
      endDate: req.body.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to one year from now if not provided
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
      associateId: req.body.associateId || null, // Optional associate ID
      contractId: req.body.contractId || null, // Optional contract ID
      avatarUrl: req.body.avatarUrl || '', // Optional avatar URL
      type: req.body.type || 'Standard', // Default type
      documents: [], // Initialize with no documents
      clients: [], // Initialize with no clients
    });

    await newContract.save();
    console.log("Smart contract has been created", newContract);
    // Respond with the created contract

    res.status(201).json({ message: 'Smart contract created successfully.', contract: newContract });
  } catch (error) {
    console.error('Error creating smart contract:', error);
    res.status(500).json({ message: 'Failed to create smart contract.' });
    console.log(error)
  }
};
