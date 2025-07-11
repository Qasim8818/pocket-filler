const Project = require('../models/project');

/**
 * List projects with pagination, search, and filter
 */
exports.listProjects = async (req, res) => {
  const { page = 1, limit = 10, search = '', year } = req.query;
  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (year) {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);
    query.date = { $gte: start, $lte: end };
  }

  try {
    const projects = await Project.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Project.countDocuments(query);

    res.status(200).json({
      projects,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ message: 'Failed to list projects.' });
  }
};

/**
 * Get project details by ID
 */
exports.getProjectDetails = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(409).json({ message: 'Project not found.' });
    }
    res.status(200).json({ project });
  } catch (error) {
    console.error('Error getting project details:', error);
    res.status(500).json({ message: 'Failed to get project details.' });
  }
};

/**
 * Update project documents
 */
exports.updateProjectDocuments = async (req, res) => {
  const { projectId } = req.params;
  const { documents } = req.body; // array of document URLs
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(402).json({ message: 'Project not found.' });
    }
    documents.forEach(docUrl => {
      project.documents.push({ url: docUrl, uploadedAt: new Date() });
    });
    await project.save();
    console.log("documents updated", project.documents, project )
    res.status(200).json({ message: 'Documents updated successfully.', project });
  } catch (error) {
    console.error('Error updating project documents:', error);
    res.status(500).json({ message: 'Failed to update project documents.' });
  }
};

/**
 * Add project activity
 */
exports.addProjectActivity = async (req, res) => {
  const { projectId } = req.params;
  const { userId, userName, action, details } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    project.activities.push({ userId, userName, action, details, timestamp: new Date() });
    await project.save();
    console.log("activity added", project.activities, project)
    res.status(200).json({ message: 'Activity added successfully.', project });
  } catch (error) {
    console.error('Error adding project activity:', error);
    res.status(500).json({ message: 'Failed to add project activity.' });
  }
};

/**
 * Remove client from project
 */
exports.removeClient = async (req, res) => {
  const { projectId, clientEmail } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    project.clients = project.clients.filter(client => client.email !== clientEmail);
    await project.save();
    console.log("client removed", project)
    res.status(200).json({ message: 'Client removed successfully.', project });
  } catch (error) {
    console.error('Error removing client:', error);
    res.status(500).json({ message: 'Failed to remove client.' });
  }
};

/**
 * Request payment (stub)
 */
exports.requestPayment = async (req, res) => {
  // This is a stub implementation
  res.status(200).json({ message: 'Payment request sent successfully.' });
};

/**
 * Send chat message in project
 */
exports.sendChatMessage = async (req, res) => {
  const { projectId } = req.params;
  const { senderId, senderName, message, messageType } = req.body;

  if (!projectId || !senderId || !senderName || !message) {
    return res.status(402).json({ message: 'Missing required fields.' });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    project.chatMessages.push({
      senderId,
      senderName,
      message,
      messageType: messageType || 'text',
      timestamp: new Date(),
    });

    await project.save();
    console.log("message:", project.chatMessages, project)
    res.status(200).json({ message: 'Chat message sent successfully.', chatMessages: project.chatMessages });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: 'Failed to send chat message.' });
  }
};

/**
 * Get chat messages for a project
 */
exports.getChatMessages = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(401).json({ message: 'Project ID is required.' });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json({ chatMessages: project.chatMessages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages.' });
  }
};
