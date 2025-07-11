const Auth = require('../models/auth');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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

    // Send verification email using nodemailer with random from email and your email_user and password
    const verificationLink = `http://yourapp.com/verify-email/${verificationToken}`;

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your email password or app password
      },
    });

    // Generate random from email for sending
    const randomFromEmail = `random${Math.floor(Math.random() * 10000)}@example.com`;

    const mailOptions = {
      from: randomFromEmail,
      to: emailAddress,
      subject: 'Verify your email',
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
      } else {
        console.log('Verification email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'User created successfully. Please verify your email.' });
  } catch (error) {
    console.error('Error in signup:', error);
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
    console.error('Error in verifyEmail:', error);
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
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    // Send reset password email using SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: emailAddress,
      from: process.env.EMAIL_USER,
      subject: 'Reset your password',
      text: `You requested a password reset. Click the link to reset your password: http://yourapp.com/reset-password/${resetToken}`,
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log('Reset password email sent');
      })
      .catch((error) => {
        console.error('Error sending reset password email:', error);
      });

    res.status(200).json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Error in resetPasswordRequest:', error);
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
    console.error('Error in resetPasswordConfirm:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
