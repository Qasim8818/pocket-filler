const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Auth = require('../models/auth');
require('dotenv').config();

async function checkPassword(email, plainPassword) {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await Auth.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log(`Password match for ${email}:`, isMatch);
  } catch (error) {
    console.error('Error checking password:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Replace with actual email and password to test
const testEmail = 'user2233323@example.com';
const testPassword = '12345678';

checkPassword(testEmail, testPassword);
