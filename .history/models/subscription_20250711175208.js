const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  planType: { type: String, enum: ['Free', 'Pro', 'Ultimate'], required: true },
  billingCycle: { type: String, enum: ['Monthly', 'Yearly'], default: 'Monthly' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['Active', 'Cancelled', 'Expired'], default: 'Active' },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  paymentAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Card' },
  createdAt: { type: Date, default: Date.now },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
