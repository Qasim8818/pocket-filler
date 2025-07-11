const Auth = require('../models/auth');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}


exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = new Auth({
      fullName,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken,
    });

    await user.save();

    const verificationLink = `http://yourapp.com/verify-email/${verificationToken}`;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email address',
      text: `Welcome! Please verify your email by clicking the following link: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
      } else {
        console.log('Verification email sent:', info.response);
      }
    });

    res.status(201).json({
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'An error occurred during signup.' });
  }
};

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

    res.status(200).json({ message: 'Email verified successfully. You may now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'An error occurred during email verification.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!process.env.SECRETKEY) {
      console.error('JWT secret key missing in environment variables.');
      return res.status(500).json({ message: 'Server error: JWT secret not configured.' });
    }

    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, roles: user.roles },
      process.env.SECRETKEY,
      { expiresIn: '1h' }
    );

    console.log(`User ${user.email} logged in with roles: ${user.roles.join(', ')}`);

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      token,
      verificationToken: user.verificationToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

exports.resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this email.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = Date.now() + 3600000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    user.resetPassword = true;
    await user.save();

    const resetLink = `http://yourapp.com/reset-password/${resetToken}`;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending reset password email:', error);
      } else {
        console.log('Reset password email sent:', info.response);
      }
    });

    res.status(200).json({
      message: 'Password reset link sent to your email.',
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    console.error('Reset password request error:', error);
    res.status(500).json({ message: 'An error occurred during password reset request.' });
  }
};

exports.resetPasswordConfirm = async (req, res) => {
  try {
    const { resetToken } = req.params;

    const user = await Auth.findOne({
      resetPasswordToken: resetToken,
      // resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user.' });
    }
    user.resetPasswordToken = null;
    // user.resetPasswordExpires = null;
    user.resetPassword = false;
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully.',
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    console.error('Reset password confirmation error:', error);
    res.status(500).json({ message: 'An error occurred during password reset confirmation.' });
  }

  exports.newPassword = async (req, res) => {
    try {
      const { newPassword, email } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: 'New password is required.' });
      }

      const user = await Auth.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.resetPassword = false;
      await user.save();

      res.status(200).json({
        message: 'Password updated successfully.',
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      });
    } catch (error) {
      console.error('New password error:', error);
      res.status(500).json({ message: 'An error occurred while updating the password.' });
    }
  }
};
