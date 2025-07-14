
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
      paymentAmount: 0, 
      paymentMethod: 'Card',
    });
    await subscription.save();
    console.log("subscription has been created", subscription)
    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
};
exports.createSubscription = async (req, res) => {
  const { userId, planType, billingCycle } = req.body;

  if (!userId || !planType) {
    return res.status(400).json({ message: 'User ID and plan type are required' });
  }

  // Define pricing logic
  const pricing = {
    Basic: { Monthly: 10, Yearly: 100 },
    Standard: { Monthly: 20, Yearly: 200 },
    Premium: { Monthly: 30, Yearly: 300 },
  };

  const cycle = billingCycle || 'Monthly';

  // Validate planType and billingCycle
  if (!pricing[planType] || !pricing[planType][cycle]) {
    return res.status(400).json({ message: 'Invalid planType or billingCycle' });
  }

  const paymentAmount = pricing[planType][cycle];

  try {
    // Check for existing active subscription
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
      paymentStatus: 'Unpaid',
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
