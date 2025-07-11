const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// auth routes
app.use("/api/auth", authRoutes);

// MongoDB connection
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
    throw new Error("Cannot connect to mongoDB: " + err.message);
});
app.listen(PORT, () => {
  console.log(`Server is on ${PORT}`);
});






