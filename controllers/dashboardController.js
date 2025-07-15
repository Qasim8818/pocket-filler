const Project = require('../models/project');
const Associate = require('../models/associates');
const Contract = require('../models/contracts');

// Controller to fetch dashboard summary data
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalClients = await Associate.countDocuments();
    const totalContracts = await Contract.countDocuments();
    const totalAssociates = await Associate.countDocuments({ role: 'associate' });
    const totalClientsWithContracts = await Associate.countDocuments({
      role: 'client',
      contracts: { $exists: true, $ne: [] }
    });
    const totalAssociatesWithContracts = await Associate.countDocuments({
      role: 'associate',
      contracts: { $exists: true, $ne: [] }
    });
    const totalContractsWithProjects = await Contract.countDocuments({
      projects: { $exists: true, $ne: [] }
    });
    const totalContractsWithDisputes = await Contract.countDocuments({
      disputes: { $exists: true, $ne: [] }
    });
    const totalContractsWithPayments = await Contract.countDocuments({
      payments: { $exists: true, $ne: [] }
    });


    // Placeholder for notifications; replace with actual Notification model if available
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(10);
    // If Notification model is not defined, use an empty array
    if (!notifications) {
      notifications = [];
    }
    // Send the summary data as a response
    res.status(200).json({
      totalProjects,
      totalClients,
      totalContracts,
      notifications,
      totalAssociates,
      totalClientsWithContracts,
      totalAssociatesWithContracts,
      totalContractsWithProjects,
      totalContractsWithDisputes,
      totalContractsWithPayments,
      message: 'Dashboard summary fetched successfully.'
    });
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary.' });
  }
};
