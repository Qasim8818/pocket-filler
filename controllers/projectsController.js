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
 * Add a new project
 */
exports.addProject = async (req, res) => {
  const { title, type, description, createdBy, organization } = req.body;

  if (!title || !type || !description || !createdBy || !organization) {
    return res.status(400).json({ message: 'Project title, type, description, createdBy, and organization are required.' });
  }

  try {
    const mongoose = require('mongoose');
    
    // Generate sequential projectId
    const lastProject = await Project.findOne().sort({ _id: -1 });
    const projectId = lastProject ? (lastProject.projectId || 0) + 1 : 1;
    
    // Create valid ObjectIds for required fields
    const defaultObjectId = new mongoose.Types.ObjectId();
    
    const newProject = new Project({
      projectId,
      title,
      type,
      description,
      date: new Date(),
      status: 'In-Progress',
      budget: 10000, // Default budget
      totalAmount: 10000, // Default total amount
      currency: 'USD', // Default currency
      startDate: new Date(), // Required field
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to one year from now
      contractId: defaultObjectId, // Valid ObjectId for required field
      associateId: defaultObjectId, // Valid ObjectId for required field
      projectManagerId: defaultObjectId, // Valid ObjectId for required field
      contractSequentialId: 1, // Sequential contract ID for tracking
      associateSequentialId: 1, // Sequential associate ID for tracking
      projectManagerSequentialId: 1, // Sequential project manager ID for tracking
      projectType: 'Internal', // Required field with valid enum
      projectStatus: 'Active', // Required field with valid enum
      budgetDetails: {
        initialBudget: 10000,
        currentBudget: 10000,
        spentAmount: 0,
        remainingBudget: 10000
      },
      archivedByRole: 'associate', // Required field
      deletedByRole: 'associate', // Required field
      archivedById: defaultObjectId, // Valid ObjectId
      deletedById: defaultObjectId, // Valid ObjectId
      clients: [],
      activities: [],
      chatMessages: [],
      documents: [],
      createdBy: defaultObjectId, // Valid ObjectId
      organization,
    });

    await newProject.save();

    res.status(201).json({ 
      projectId,
      contractSequentialId: 1,
      associateSequentialId: 1,
      projectManagerSequentialId: 1,
      message: 'Project added successfully.', 
      project: newProject 
    });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Failed to add project.' });
  }
};

/**
 * Get project details by ID
 */
exports.getProjectDetails = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findOne({ projectId: parseInt(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json({ 
      projectId: project.projectId,
      project 
    });
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
    const project = await Project.findOne({ projectId: parseInt(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    documents.forEach(docUrl => {
      project.documents.push({ url: docUrl, uploadedAt: new Date() });
    });
    await project.save();
    console.log("Documents updated", project.documents, project);
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
  const { userId, userName, userRole, action, details } = req.body;
  
  // Validate required fields
  if (!userId || !userName || !userRole || !action) {
    return res.status(400).json({ message: 'userId, userName, userRole, and action are required.' });
  }
  
  try {
    const mongoose = require('mongoose');
    const project = await Project.findOne({ projectId: parseInt(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    // Create valid ObjectId for userId if it's a sequential number
    let userObjectId;
    if (mongoose.isValidObjectId(userId)) {
      userObjectId = userId;
    } else {
      // If userId is a sequential number, create a valid ObjectId or find the user
      userObjectId = new mongoose.Types.ObjectId();
    }
    
    // Add new activity
    const newActivity = {
      userId: userObjectId,
      userName,
      userRole,
      projectId: project._id, // Use the project's MongoDB ObjectId
      action,
      details: details || '',
      timestamp: new Date()
    };
    
    project.activities.push(newActivity);
    await project.save();
    
    console.log("Activity added", newActivity);
    res.status(200).json({ 
      projectId: project.projectId,
      activityId: newActivity._id,
      message: 'Activity added successfully.', 
      project 
    });
  } catch (error) {
    console.error('Error adding project activity:', error);
    res.status(500).json({ message: 'Failed to add project activity.' });
  }
};

/**
 * Add a client to a project
 */
exports.addClient = async (req, res) => {
  const { projectId } = req.params;
  const { name, email, avatarUrl } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Client name and email are required.' });
  }
  
  try {
    const project = await Project.findOne({ projectId: parseInt(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    
    // Check if client already exists in the project
    const clientExists = project.clients.some(client => client.email === email);
    if (clientExists) {
      return res.status(409).json({ message: 'Client already exists in this project.' });
    }
    
    // Add new client
    const newClient = {
      name,
      email,
      avatarUrl: avatarUrl || ''
    };
    
    project.clients.push(newClient);
    await project.save();
    
    console.log("Client added to project", newClient);
    res.status(200).json({ 
      projectId: project.projectId,
      clientId: newClient._id,
      message: 'Client added successfully.', 
      project 
    });
  } catch (error) {
    console.error('Error adding client to project:', error);
    res.status(500).json({ message: 'Failed to add client.' });
  }
};

/**
 * Remove client from project
 */
exports.removeClient = async (req, res) => {
  const { projectId, clientEmail } = req.body;
  try {
    const project = await Project.findOne({ projectId: parseInt(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    project.clients = project.clients.filter(client => client.email !== clientEmail);
    await project.save();
    console.log("Client removed", project);
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
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const project = await Project.findOne({ projectId: parseInt(projectId) });
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
    console.log("Message sent:", project.chatMessages, project);
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
    return res.status(400).json({ message: 'Project ID is required.' });
  }

  try {
    const project = await Project.findOne({ projectId: parseInt(projectId) });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json({ chatMessages: project.chatMessages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages.' });
  }
};
