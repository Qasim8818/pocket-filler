const mongoose = require("mongoose");

const smartContractSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: "",
    },
    contractFile: {
      type: String, // path to uploaded contract file
    },
    contractType: {
      type: String,
      enum: ["employment", "service", "partnership"],
      required: true,
    },
    contractValue: {
      type: Number,
      default: 0,
    },
    contractDuration: {
      type: String,
      enum: ["short-term", "long-term"],
      default: "short-term",
    },
    contractStatus: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    contractDetails: {
      type: String,
      default: "",
    },
    contractFilePath: {
      type: String, // path to the contract file
    },
    contractSignaturePath: {
      type: String, // path to the signature file
    },
    contractSigned: {
      type: Boolean,
      default: false,
    },
    contractSignedDate: {
      type: Date,
    },
    contractReviewed: {
      type: Boolean,
      default: false,
    },
    contractReviewedDate: {
      type: Date,
    },
    contractReviewedStatus: {
      type: String,
      enum: ["approved", "rejected"],
      default: "approved",
    },
    contractReviewedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    contractReviewedByAssociate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Associate",
    },
    contractReviewedByClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    contractStartDate: {
      type: Date,
    },
    contractEndDate: {
      type: Date,
    },
    contractSignature: {
      type: String, // path to the contract signature file
    },
    contractCreatedDate: {
      type: Date,
      default: Date.now,
    },
    contractUpdatedDate: {
      type: Date,
      default: Date.now,
    },
    contractId: {
      type: Number,
      unique: true,
    },
    createdBy: {
      type: String, // who created the contract
    },
    associates: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        sharedBy: { type: String }, // who shared the contract with this associate
      },
    ],
    organization: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "In-Progress"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auth" }],
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Associate" }],
    associateId: {
      type: Number,
      unique: true,
    },
    projectManagerId: {
      type: Number,
      unique: true,
    },
    projectType: {
      type: String,
      enum: ["Internal", "External"],
      required: true,
    },
    projectStatus: {
      type: String,
      enum: ["Active", "On Hold", "Completed", "Cancelled"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    tags: [{ type: String }],
    milestones: [{ type: String }],
    budgetDetails: {
      initialBudget: { type: Number, required: true },
      currentBudget: { type: Number, required: true },
      spentAmount: { type: Number, required: true },
      remainingBudget: { type: Number, required: true },
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    files: [
      {
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Auth",
          required: true,
        },
        comment: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    chatMessages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Auth",
          required: true,
        },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        messageType: { type: String, enum: ["text", "call"], default: "text" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    }, // ID of the user who created the contract
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    }, // ID of the user who last updated the contract
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    avatarUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const SmartContract = mongoose.model("SmartContract", smartContractSchema);
module.exports = SmartContract;
