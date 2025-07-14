const express = require('express');
const router = express.Router();
const smartContractController = require('../controllers/smartContractController');

router.post('/create', smartContractController.createSmartContract);

module.exports = router;
