const SmartContract = require('../models/smartContract'); // Assuming a model will be created

// Create a new smart contract
exports.createSmartContract = async (req, res) => {
  const { title, totalAmount } = req.body;

  if (!title || !totalAmount) {
    return res.status(400).json({ message: 'Title and total amount are required.' });
  }

  try {
    const newContract = new SmartContract({
      title,
      totalAmount,
      createdAt: new Date(),
    });

    await newContract.save();

    res.status(201).json({ message: 'Smart contract created successfully.', contract: newContract });
  } catch (error) {
    console.error('Error creating smart contract:', error);
    res.status(500).json({ message: 'Failed to create smart contract.' });
  }
};
