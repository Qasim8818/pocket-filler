const express = require('express');
const router = express.Router();
const contractsController = require('../controllers/contractsController');

// Route to add a new contract
router.post('/addContracts', contractsController.addContracts);

// Route to upload a contract file
router.post('/uploadContracts', contractsController.uploadContracts);

// Route to preview a contract by ID
router.get('/previewContract/:contractId', contractsController.previewContract);

// Route to upload a signature file for a contract
router.post('/uploadSignature', contractsController.uploadSignature);

// Route to save contract details
router.post('/saveContract', contractsController.saveContract);

// Route to share a contract with an associate
router.post('/shareContract', contractsController.shareContract);

module.exports = router;
