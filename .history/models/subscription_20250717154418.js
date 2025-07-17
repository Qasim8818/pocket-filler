const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: Number, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
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
  autoRenew: { type: Boolean, default: true },
  paymentAmount: { type: Number, default: 0 },
  paymentCurrency: { type: String, default: "USD" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
}, {
  timestamps: true,
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
