const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.post('/create', subscriptionController.createSubscription);
router.get('/get/:userId', subscriptionController.getSubscription);

module.exports = router;
