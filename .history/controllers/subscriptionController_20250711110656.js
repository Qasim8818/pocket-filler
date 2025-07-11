
const Subscription = require('../models/subscription');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new subscription
exports.createSubscription = async (req, res) => {
  const { userId, planType, billingCycle } = req.body;
  if (!userId || !planType) {
    return res.status(400).json({ message: 'User ID and plan type are required' });
  }
  try {
    const existingSubscription = await Subscription.findOne({ userId, status: 'Active' });
    if (existingSubscription) {
      return res.status(409).json({ message: 'User already has active subscription' });
    }
    const subscription = new Subscription({
      userId,
      planType,
      billingCycle: billingCycle || 'Monthly',
      startDate: new Date(),
      status: 'Active',
    });
    await subscription.save();
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
};

// Get subscription details for a user
exports.getSubscription = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const subscription = await Subscription.findOne({ userId, status: 'Active' });
    if (!subscription) {
      return res.status(404).json({ message: 'Active subscription not found' });
    }
    res.status(200).json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
};

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd', cardNumber, expMonth, expYear, cvc } = req.body;
  if (!amount || !cardNumber || !expMonth || !expYear || !cvc) {
    return res.status(400).json({ message: 'Amount and complete card details are required' });
  }
  try {
    // Create payment method with card details
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
    });

    // Create payment intent with payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency,
      payment_method: paymentMethod.id,
      confirm: true,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret, paymentIntentStatus: paymentIntent.status });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
};
