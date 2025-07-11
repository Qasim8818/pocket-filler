const Auth = require('../models/auth');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

/**
 * Handles user signup.
 * Creates a new user, hashes the password, generates a verification token,
 * and sends a verification email.
 */ 
exports.signup = async (req, res) => {
  try {
    const { fullName, emailAddress, password } = req.body;

    if (!fullName || !emailAddress || !password) {
      return res.status(400).json({ message: 'Please provide full name, email, and password.' });
    }

    // Check if user already exists
    const existingUser = await Auth.findOne({ email: emailAddress });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a random verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create new user document
    const user = new Auth({
      fullName,
      email: emailAddress,
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken,
    });

    await user.save();
    

    // Prepare verification email
    const verificationLink = `http://yourapp.com/verify-email/${verificationToken}`;

    // Configure nodemailer transporter with your email credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Use a random from email to avoid spam filters
    const randomFromEmail = `no-reply${Math.floor(Math.random() * 10000)}@example.com`;

    const mailOptions = {
      from: randomFromEmail,
      to: emailAddress,
      subject: 'Please verify your email address',
      text: `Welcome! Please verify your email by clicking the link: ${verificationLink}`,
    };

    // Send the verification email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send verification email:', error);
      } else {
        console.log('Verification email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'Signup successful! Please check your email to verify your account.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }
  return user;
};

/**
 * Handles email verification.
 * Verifies the user's email based on the token.
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await Auth.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Internal server error during email verification.' });
  }
};

/**
 * Handles user login.
 * Validates email and password.
 */
exports.login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await Auth.findOne({ email: emailAddress });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // TODO: Generate and return JWT token here for authenticated sessions

    res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

/**
 * Handles password reset request.
 * Generates a reset token and sends reset link via email.
 */
exports.resetPasswordRequest = async (req, res) => {
  try {
    const { emailAddress } = req.body;

    if (!emailAddress) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    const user = await Auth.findOne({ email: emailAddress });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this email.' });
    }

    // Generate reset token and expiry (1 hour)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    user.markAsRead = false;
    await user.save();

    // Prepare reset password email
    const resetLink = `http://yourapp.com/reset-password/${resetToken}`;

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailAddress,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send reset password email:', error);
      } else {
        console.log('Reset password email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Reset password request error:', error);
    res.status(500).json({ message: 'Internal server error during password reset request.' });
  }
};

/**
 * Handles password reset confirmation.
 * Validates reset token and updates password.
 */
exports.resetPasswordConfirm = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'Please provide a new password.' });
    }

    const user = await Auth.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.markAsRead = true;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password confirmation error:', error);
    res.status(500).json({ message: 'Internal server error during password reset confirmation.' });
  }
};
