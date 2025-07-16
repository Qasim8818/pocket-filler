const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');

// Route to list projects with optional pagination, search, and filter
router.get('/', projectsController.listProjects);

// Route to get details of a specific project by ID
router.get('/:projectId', projectsController.getProjectDetails);

// Route to add a new project
router.post('/addProject', projectsController.addProject);

// Route to update documents for a project by project ID
router.post('/updateDocuments/:projectId', projectsController.updateProjectDocuments);

// Route to add an activity to a project by project ID
router.post('/addActivity/:projectId', projectsController.addProjectActivity);

// Route to add a client to a project
router.post('/addClient/:projectId', projectsController.addClient);

// Route to remove a client from a project
router.post('/removeClient', projectsController.removeClient);

// Route to request payment (stub)
router.post('/requestPayment', projectsController.requestPayment);

// Route to send a chat message in a project by project ID
router.post('/sendChatMessage/:projectId', projectsController.sendChatMessage);

// Route to get chat messages for a project by project ID
router.get('/getChatMessages/:projectId', projectsController.getChatMessages);

module.exports = router;
