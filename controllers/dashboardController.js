const Project = require('../models/project');
const Associate = require('../models/associates');
const Contract = require('../models/contracts');

// Controller to get dashboard summary data
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalClients = await Associate.countDocuments();
    const totalContracts = await Contract.countDocuments();

    // For notifications, assuming a Notification model exists, else empty array
    // const notifications = await Notification.find().sort({ date: -1 }).limit(10);
    const notifications = []; // Placeholder

    res.status(200).json({
      totalProjects,
      totalClients,
      totalContracts,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary.' });
  }
};
