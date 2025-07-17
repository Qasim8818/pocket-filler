const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ["associate", "client"], required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
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
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auth" }],
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Associate" }],
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
    associateId: { type: mongoose.Schema.Types.ObjectId, ref: "Associate" },
    projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "Associate" },
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
    progress: { type: Number, default: 0, min: 0, max: 100 },
    activities: [activitySchema],
    documents: [documentSchema],
    clients: [clientSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
