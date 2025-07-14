
const Subscription = require('../models/subscription');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new subscription
exports.createSubscription = async (req, res) => {
  const { userId, planType, billingCycle } = req.body;

  if (!userId || !planType) {
    return res.status(400).json({ message: 'User ID and plan type are required' });
  }

  // Define your actual pricing
  const pricing = {
    Free: { Monthly: 0, Yearly: 0 },
    Pro: { Monthly: 15, Yearly: 150 },
    Ultimate: { Monthly: 30, Yearly: 300 },
  };

  const cycle = billingCycle || 'Monthly';

  // Validate planType and billingCycle
  if (!pricing[planType] || !pricing[planType][cycle]) {
    return res.status(400).json({ message: 'Invalid planType or billingCycle' });
  }

  const paymentAmount = pricing[planType][cycle];

  try {
    const existingSubscription = await Subscription.findOne({ userId, status: 'Active' });
    if (existingSubscription) {
      return res.status(409).json({ message: 'User already has an active subscription' });
    }

    const subscription = new Subscription({
      userId,
      planType,
      billingCycle: cycle,
      startDate: new Date(),
      status: 'Active',
      paymentStatus: paymentAmount === 0 ? 'Paid' : 'Unpaid', // auto-mark free plan as Paid
      paymentAmount,
      paymentMethod: 'Card',
    });

    await subscription.save();
    console.log("Subscription created:", subscription);
    res.status(201).json({ message: 'Subscription created successfully', subscription });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
};
exports.createPaymentIntent = async (req, res) => {
  const { userId, planType, billingCycle } = req.body;

  const pricing = {
    Free: { Monthly: 0, Yearly: 0 },
    Pro: { Monthly: 15, Yearly: 150 },
    Ultimate: { Monthly: 30, Yearly: 300 },
  };

  const cycle = billingCycle || 'Monthly';

  if (!userId || !planType || !pricing[planType] || !pricing[planType][cycle]) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const amount = pricing[planType][cycle];

  if (amount === 0) {
    return res.status(400).json({ message: 'No payment required for Free plan' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe requires amount in cents
      currency: 'usd',
      metadata: { userId, planType, billingCycle: cycle },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount,
      message: 'Payment intent created successfully',
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
};

exports.paySubscriptionAmount = async (req, res) => {
  const { userId, clientSecret } = req.body;

  if (!userId || !clientSecret) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Fetch payment intent to confirm status
    const paymentIntent = await stripe.paymentIntents.retrieve(clientSecret.split('_secret_')[0]);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({ message: 'Payment not completed yet' });
    }

    // Update subscription as Paid
    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: 'Active' },
      { paymentStatus: 'Paid', status: 'Active' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({
      message: 'Payment successful and subscription updated',
      subscription,
    });

  } catch (error) {
    console.error('Error in paySubscriptionAmount:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
