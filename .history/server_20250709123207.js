const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
})

.catch((err) => {
    throw new Error("Failed to connect to MongoDB: " + err.message);
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Server setup


