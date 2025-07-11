const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const authRoutes = require("./routes/authRoutes");
const contractsRoutes = require("./routes/contractsRoutes");
const associatesRoutes = require("./routes/associatesRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractsRoutes);
app.use("/api/associates", associatesRoutes);

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






