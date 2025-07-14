
const Subscription = require('../models/subscription');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new subscription
exports.createSubscription = async (req, res) => {
  const { userId, planType, billingCycle } = req.body;
  if (!userId || !planType) {
    return res.status(404).json({ message: 'User ID and plan type are required' });
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
      paymentStatus: 'Unpaid',
      paymentAmount: 0, // Initial amount can be set to 0 or a default value
      paymentMethod: 'Card', // Default payment method
    });
    await subscription.save();
    console.log("subscription has been created", subscription)
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
};
exports.createPaymentIntent = async (req, res) => {
  const { userId, amount, currency = 'usd', cardNumber, expMonth, expYear, cvc } = req.body;
  if (!userId || !amount || !cardNumber || !expMonth || !expYear || !cvc) {
    return res.status(409).json({ message: 'User ID, amount and complete card details are required' });
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
    // No need to save paymentMethod as it's not a mongoose model
    console.log("paymentMethod:", paymentMethod)
    // Create payment intent with payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency,
      payment_method: paymentMethod.id,
      confirm: true,
    });
    console.log("payment intent", paymentIntent)

    // Update subscription paymentStatus and status after successful payment
    if (paymentIntent.status === 'succeeded') {
      const subscription = await Subscription.findOneAndUpdate(
        { userId, status: { $ne: 'Cancelled' } },
        { paymentStatus: 'Paid', status: 'Active' },
        { new: true }
      );
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found for user' });
      }
      return res.status(200).json({ message: 'Payment successful', subscription });
    } else {
      return res.status(400).json({ message: 'Payment not successful', paymentIntentStatus: paymentIntent.status });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
};

// Get subscription details for a user
exports.getSubscription = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(402).json({ message: 'User ID is required' });
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
