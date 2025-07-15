const express = require('express');
const router = express.Router();
const associatesController = require('../controllers/associatesController');


// Route to add a new user by invitation
router.post('/addUser', associatesController.addUser);

// Route to add an associate manually without invitation
router.post('/addManually', associatesController.addManually);

// Route to add clients similarly to associates
router.post('/addClients', associatesController.addClients);

// Route to fetch client requests with their status
router.get('/getClientRequests', associatesController.getClientRequests);

// Route to accept a client request by client ID
router.post('/acceptClient/:clientId', associatesController.acceptClient);

// Route to reject a client request by client ID
router.post('/rejectClient/:clientId', associatesController.rejectClient);

// Route to get all clients
router.get('/getClients', associatesController.getClients);

// Route to remove a client by client ID
router.delete('/removeClient/:clientId', associatesController.removeClient);

// Route to get all associates
router.get('/getAssociates', associatesController.getAssociates);

// Route to remove an associate by associate ID
router.delete('/removeAssociate/:associateId', associatesController.removeAssociate);

// Route to get status of an associate by ID
router.get('/getStatus/:associateId', associatesController.getStatus);

// Route to accept an associate request by associate ID
router.post('/acceptAssociate/:associateId', associatesController.acceptAssociate);

// Route to reject an associate request by associate ID
router.post('/rejectAssociate/:associateId', associatesController.rejectAssociate);


module.exports = router;
