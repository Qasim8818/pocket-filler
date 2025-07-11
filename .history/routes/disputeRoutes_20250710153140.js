const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');

router.post('/submit', disputeController.submitDispute);
router.get('/details/:disputeId', disputeController.getDisputeDetails);
router.post('/addMessage/:disputeId', disputeController.addMessage);
router.post('/uploadDocuments/:disputeId', disputeController.uploadDocuments);
router.post('/withdraw/:disputeId', disputeController.withdrawDispute);

module.exports = router;
