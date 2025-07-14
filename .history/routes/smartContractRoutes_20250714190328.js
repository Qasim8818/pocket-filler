const express = require('express');
const router = express.Router();
const smartContractController = require('../controllers/smartContractController');

// Route to create a new smart contract
router.post('/create', smartContractController.createSmartContract);

module.exports = router;
