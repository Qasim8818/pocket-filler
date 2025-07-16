
const Subscription = require('../models/subscription');
const mongoose = require('mongoose');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new subscription
exports.createSubscription = async (req, res) => {
  const { userId, planType, billingCycle } = req.body;
  if (!planType) {
    return res.status(400).json({ message: 'Plan type is required' });
  }
  if (!billingCycle) {
    return res.status(400).json({ message: 'Billing cycle is required' });
  }
  // Validate userId and planType
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  // Validate planType
  const validPlanTypes = ['Free', 'Pro', 'Ultimate'];
  if (!validPlanTypes.includes(planType)) {
    return res.status(400).json({ message: 'Invalid plan type' });
  }
  // Validate billingCycle
  const validBillingCycles = ['Monthly', 'Yearly'];
  if (!validBillingCycles.includes(billingCycle)) {
    return res.status(400).json({ message: 'Invalid billing cycle' });
  }
  // Define your actual pricing
  const pricing = {
    Free: { Monthly: 0, Yearly: 0 },
    Pro: { Monthly: 15, Yearly: 150 },
    Ultimate: { Monthly: 30, Yearly: 300 },
  };
  // Default to Monthly if billingCycle is not provided
  const cycle = billingCycle || 'Monthly';
  // Check if the planType and cycle are valid
  if (!pricing[planType] || !pricing[planType][cycle]) {
    return res.status(400).json({ message: 'Invalid planType or billingCycle' });
  }
  // Find the Auth user by sequential userId
  const Auth = require('../models/auth');
  const authUser = await Auth.findOne({ userId: parseInt(userId) });
  if (!authUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if the user already has an active subscription
  const existingSubscription = await Subscription.findOne({ userId: authUser._id, status: 'Active' });
  if (existingSubscription) {
    return res.status(409).json({ message: 'User already has an active subscription' });
  }
  // Create a new subscription
  const subscription = new Subscription({
    subscriptionId: new mongoose.Types.ObjectId(),
    userId: authUser._id,
    planType,
    billingCycle: cycle,
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + (cycle === 'Yearly' ? 1 : 0))),
    status: 'Active',
    trialPeriod: false, // Assuming no trial period for simplicity
    trialEndDate: null,
    cancellationDate: null,
    cancellationReason: '',
    lastPaymentDate: null,
    nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + (cycle === 'Monthly' ? 1 : 12))),
    autoRenew: true,
    isActive: true,
    isTrialActive: false,
    isCancelled: false,
    isPaused: false,
    pauseStartDate: null,
    pauseEndDate: null,
    pauseReason: '',
    pauseDuration: 0,
    discountCode: '',
    paymentIntentId: '',
    paymentMethod: 'Card',
    paymentStatus: 'Unpaid',
    paymentAmount: pricing[planType][cycle],
    paymentCurrency: 'USD',
    paymentDetails: '',
    createdBy: authUser._id, // Use the authenticated user's ObjectId
    updatedBy: authUser._id, // Use the authenticated user's ObjectId
    updatedByRole: 'associate', // Default role
    updatedById: authUser._id, // ID of the user who last updated the subscription
    createdById: authUser._id, // Required field
    createdByRole: 'associate', // Required field
    expiredById: authUser._id, // Required field (placeholder)
    cancelledById: authUser._id, // Required field (placeholder)
    resumedById: authUser._id, // Required field (placeholder)
    pausedById: authUser._id, // Required field (placeholder)
    expiredByRole: 'associate', // Required field (placeholder)
    cancelledByRole: 'associate', // Required field (placeholder)
    resumedByRole: 'associate', // Required field (placeholder)
    pausedByRole: 'associate', // Required field (placeholder)
    createdAt: new Date(),
    updatedAt: new Date()
  });
  try {
    await subscription.save();
    console.log("Subscription has been created", subscription);
    res.status(201).json({ 
      subscriptionId: subscription.subscriptionId,
      userId: subscription.userId,
      message: 'Subscription created successfully.', 
      subscription 
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription.' });
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
  const { userId, clientSecret, cardNumber, expMonth, expYear, cvc } = req.body;

  if (!userId || !clientSecret || !cardNumber || !expMonth || !expYear || !cvc) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Step 1: Create a payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
    });

    // Step 2: Confirm the existing payment intent with the client secret
    const paymentIntent = await stripe.paymentIntents.retrieve(
      clientSecret.split('_secret')[0] // Extract PaymentIntent ID from clientSecret
    );

    if (!paymentIntent) {
      return res.status(404).json({ message: 'PaymentIntent not found' });
    }

    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethod.id,
    });

    if (confirmedIntent.status !== 'succeeded') {
      return res.status(402).json({ message: 'Payment failed', status: confirmedIntent.status });
    }

    // Step 3: Mark the subscription as Paid
    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: 'Active', paymentStatus: 'Unpaid' },
      { paymentStatus: 'Paid', status: 'Active' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found or already paid' });
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
