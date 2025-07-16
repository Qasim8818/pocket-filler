const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ["associate", "client"], required: true }, // Role of the user performing the activity
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  action: { type: String, required: true },

  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatarUrl: { type: String },
});

const chatMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ["text", "call"], default: "text" },
  timestamp: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    projectId: { type: Number, unique: true },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    organization: { type: String, required: true },
    status: {
      type: String,
      enum: ["Completed", "In-Progress"],
      required: true,
    },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auth" }],
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Associate" }],
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    associateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    projectManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
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
    files: [documentSchema],
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
    chatMessages: [chatMessageSchema],
    activities: [activitySchema],

    type: { type: String, required: true },
    activities: [activitySchema],
    documents: [documentSchema],
    clients: [clientSchema],
    chatMessages: [chatMessageSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    archivedAt: { type: Date },
    deletedAt: { type: Date },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    isActive: { type: Boolean, default: true },
    archivedByRole: {
      type: String,
      enum: ["associate", "client"],
      required: true,
    }, // Role of the user who archived the project
    deletedByRole: {
      type: String,
      enum: ["associate", "client"],
      required: true,
    }, // Role of the user who deleted the project
    archivedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    }, // ID of the user who archived the project
    deletedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    }, // ID of the user who deleted the project
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
