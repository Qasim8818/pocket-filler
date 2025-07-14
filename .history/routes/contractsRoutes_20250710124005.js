const express = require('express');
const router = express.Router();
const contractsController = require('../controllers/contractsController');

// Routes for contracts API
router.post('/addContracts', contractsController.addContracts);
router.post('/uploadContracts', contractsController.uploadContracts);
router.get('/previewContract/:contractId', contractsController.previewContract);
router.post('/uploadSignature', contractsController.uploadSignature);
router.post('/saveContract', contractsController.saveContract);
router.post('/shareContract', contractsController.shareContract);

module.exports = router;
