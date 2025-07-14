const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.post('/create', subscriptionController.createSubscription);
router.get('/:userId', subscriptionController.getSubscription);
router.post('/createPaymentIntent', subscriptionController.createPaymentIntent);
router.post('/paySubscriptionAmount', subscriptionController.paySubscriptionAmount);


module.exports = router;
