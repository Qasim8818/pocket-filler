const express = require('express');
const router = express.Router(); 
const projectsController = require('../controllers/projectsController');

router.get('/', projectsController.listProjects);
router.get('/:projectId', projectsController.getProjectDetails);
router.post('/updateDocuments/:projectId', projectsController.updateProjectDocuments);
router.post('/addActivity/:projectId', projectsController.addProjectActivity);
router.post('/removeClient', projectsController.removeClient);
router.post('/requestPayment', projectsController.requestPayment);
router.post('/sendChatMessage/:projectId', projectsController.sendChatMessage);
router.get('/getChatMessages/:projectId', projectsController.getChatMessages);

module.exports = router;
