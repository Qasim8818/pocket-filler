const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');

// Route to submit a new dispute
router.post('/submit', disputeController.submitDispute);

// Get details of a specific dispute by ID
router.get('/details/:disputeId', disputeController.getDisputeDetails);

// Add a message to an existing dispute
router.post('/addMessage/:disputeId', disputeController.addMessage);

// Upload documents related to a dispute
router.post('/uploadDocuments/:disputeId', disputeController.upload, disputeController.uploadDocuments);

// Withdraw a dispute by ID
router.post('/withdraw/:disputeId', disputeController.withdrawDispute);

module.exports = router;
