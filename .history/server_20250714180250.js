const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const authRoutes = require("./routes/authRoutes");
const contractsRoutes = require("./routes/contractsRoutes");
const associatesRoutes = require("./routes/associatesRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const projectsRoutes = require("./routes/projectsRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");
const smartContractRoutes = require("./routes/smartContractRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractsRoutes);
app.use("/api/associates", associatesRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/dispute", disputeRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/smart-contract", smartContractRoutes);

// MongoDB connection
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
    throw new Error("Cannot connect to mongoDB: " + err.message);
});

// Export app for testing
module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is on ${PORT}`);
  });
}






