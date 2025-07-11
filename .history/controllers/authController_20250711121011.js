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

async function sendMail(mailOptions) {
  const transporter = createTransporter();
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email sending failed:', err);
        reject(err);
      } else {
        console.log('Email sent:', info.response);
        resolve(info);
      }
    });
  });
};


//  Signup endpoint: creates user and sends 4-digit verification code via email.
 
exports.signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    console.log('Signup - verificationCode:', verificationCode, 'expires at:', verificationCodeExpires);

    const user = new Auth({
      fullName,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your 4-digit verification code',
      text: `Hello ${fullName},\n\nYour verification code is: ${verificationCode}\nIt expires in 15 minutes.\n\nThank you!`,
    };

    await sendMail(mailOptions);

    res.status(201).json({
      message: 'Registration successful. Please check your email for the verification code.',
      user: {
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'An error occurred during signup.' });
  }
};

// Endpoint to verify the 4-digit signup verification code.

exports.verifySignupCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  try {
    const user = await Auth.findOne({ email, verificationCode: code });
    console.log('verifySignupCode - user found:', user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code or email.' });
    }

    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      console.log('verifySignupCode - code expired:', user.verificationCodeExpires);
      return res.status(400).json({ message: 'Verification code has expired.' });
    }

    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.status(200).json({ message: 'Account verified successfully.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'An error occurred during verification.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!process.env.SECRETKEY) {
    console.error('JWT secret key missing in environment variables.');
    return res.status(500).json({ message: 'Server error: JWT secret not configured.' });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Email not verified. Please verify your email before logging in.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, roles: user.roles },
      process.env.SECRETKEY,
      { expiresIn: '1h' }
    );

    console.log(`User ${user.email} logged in with roles: ${user.roles.join(', ')}`);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 3600000; // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    user.resetPassword = true;
    await user.save();

    const resetLink = `http://yourapp.com/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n${resetLink}\nIf you did not request this, please ignore this email.`,
    };

    await sendMail(mailOptions);

    res.status(200).json({
      message: 'Password reset link sent to your email.',
      user: {
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Reset password request error:', error);
    res.status(500).json({ message: 'An error occurred during password reset request.' });
  }
};

exports.resetPasswordConfirm = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword, fullName, email, contactNumber } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required.' });
  }

  try {
    const user = await Auth.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (contactNumber) user.contactNumber = contactNumber;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPassword = false;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully.',
      user: {
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Reset password confirmation error:', error);
    res.status(500).json({ message: 'An error occurred during password reset confirmation.' });
  }
};

/**
 * Update user profile endpoint
 */
exports.updateProfile = async (req, res) => {
  const { userId, fullName, email, contactNumber, password } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (contactNumber) user.contactNumber = contactNumber;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'An error occurred during profile update.' });
  }
};
