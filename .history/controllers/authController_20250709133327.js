const Auth = require('../models/auth');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Signup controller;

exports.signup = async (req, res) => {
  try {
    const { fullName, emailAddress, password } = req.body;

    if (!fullName || !emailAddress || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await Auth.findOne({ email: emailAddress });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = new Auth({
      fullName,
      email: emailAddress,
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken,
    });

    await user.save();

    // Simulate sending verification email
    const verificationLink = `http://yourapp.com/verify-email/${verificationToken}`;
    console.log(`Verification email sent to ${emailAddress}: ${verificationLink}`);

    res.status(201).json({ message: 'User created successfully. Please verify your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Email verification controller
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await Auth.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await Auth.findOne({ email: emailAddress });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // For simplicity, just return success message
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password request controller
exports.resetPasswordRequest = async (req, res) => {
  try {
    const { emailAddress } = req.body;

    if (!emailAddress) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await Auth.findOne({ email: emailAddress });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    user.markAsRead = false; // markAsRead flag for reset link
    await user.save();

    // Simulate sending email with reset link
    // In real app, use nodemailer or other service
    const resetLink = `http://yourapp.com/reset-password/${resetToken}`;

    console.log(`Reset link (send this via email): ${resetLink}`);

    res.status(200).json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password confirmation controller
exports.resetPasswordConfirm = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'Please provide new password' });
    }

    const user = await Auth.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.markAsRead = true; // mark the reset link as read
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
