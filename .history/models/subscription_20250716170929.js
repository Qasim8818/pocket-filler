const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  planType: { type: String, enum: ["Free", "Pro", "Ultimate"], required: true },
  billingCycle: {
    type: String,
    enum: ["Monthly", "Yearly"],
    default: "Monthly",
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["Active", "Cancelled", "Expired"],
    default: "Active",
  },
  trialPeriod: { type: Boolean, default: false }, // Indicates if the subscription is in a trial period
  trialEndDate: { type: Date }, // End date of the trial period if applicable
  cancellationDate: { type: Date }, // Date when the subscription was cancelled
  cancellationReason: { type: String, default: "" }, // Reason for cancellation if applicable
  lastPaymentDate: { type: Date }, // Date of the last payment made
  nextBillingDate: { type: Date }, // Date when the next payment is due
  autoRenew: { type: Boolean, default: true }, // Indicates if the subscription will auto-renew
  isActive: { type: Boolean, default: true }, // Indicates if the subscription is currently active
  isTrialActive: { type: Boolean, default: false }, // Indicates if the trial
  isCancelled: { type: Boolean, default: false }, // Indicates if the subscription has
  isPaused: { type: Boolean, default: false }, // Indicates if the subscription is paused
  pauseStartDate: { type: Date }, // Start date of the pause period
  pauseEndDate: { type: Date }, // End date of the pause period
  pauseReason: { type: String, default: "" }, // Reason for pausing the
  pauseDuration: { type: Number, default: 0 }, // Duration of the pause in days
  discountCode: { type: String, default: "" }, // Optional discount code applied to the subscription
  paymentIntentId: { type: String, default: "" }, // ID of the payment intent if using a payment gateway
  paymentMethod: {
    type: String,
    enum: ["Card", "PayPal", "Bank Transfer"],
    default: "Card",
  }, // Payment method used
  paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" }, // Status of the payment
  paymentAmount: { type: Number, default: 0 }, // Amount charged for the subscription
  paymentCurrency: { type: String, default: "USD" }, // Currency of the payment
  paymentDetails: { type: String, default: "" }, // Additional details about the payment
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date }, // Date when the subscription was cancelled
  expiredAt: { type: Date }, // Date when the subscription expired
  pausedAt: { type: Date }, // Date when the subscription was paused
  resumedAt: { type: Date }, // Date when the subscription was resumed
  pausedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" }, // User who paused the subscription
  resumedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" }, // User who cancelled the subscription
  expiredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
  pausedByRole: { type: String, enum: ["associate", "client"], required: true }, // Role of the user who paused the subscription
  resumedByRole: {
    type: String,
    enum: ["associate", "client"],
    required: true,
  }, // Role of the user who resumed the subscription
  cancelledByRole: {
    type: String,
    enum: ["associate", "client"],
    required: true,
  }, // Role of the user who cancelled the subscription
  expiredByRole: {
    type: String,
    enum: ["associate", "client"],
    required: true,
  }, // Role of the user who expired the subscription
  pausedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true, // ID of the user who paused the subscription
  },
  resumedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true, // ID of the user who resumed the subscription
  },
  cancelledById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true, // ID of the user who cancelled the subscription
  },
  expiredById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true, // ID of the user who expired the subscription
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  }, // ID of the user who last updated the subscription
  updatedByRole: {
    type: String,
    enum: ["associate", "client"],
    required: true,
  }, // Role of the user who last updated the subscription
  updatedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  }, // ID of the user who last updated the subscription
  updatedAt: { type: Date, default: Date.now }, // Timestamp of the last
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  }, // User who created the subscription
  createdByRole: {
    type: String,
    enum: ["associate", "client"],
    required: true,
  }, // Role of the user who created the subscription
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true, // ID of the user who created the subscription
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
