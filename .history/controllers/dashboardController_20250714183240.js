const Project = require('../models/project');
const Associate = require('../models/associates');
const Contract = require('../models/contracts');

// Controller to fetch dashboard summary data
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalClients = await Associate.countDocuments();
    const totalContracts = await Contract.countDocuments();

    // Placeholder for notifications; replace with actual Notification model if available
    const notifications = [];

    res.status(200).json({
      totalProjects,
      totalClients,
      totalContracts,
      notifications,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary.' });
  }
};
