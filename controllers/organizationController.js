const Organization = require("../models/organization");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email transporter setup
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
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
        console.error("Failed to send email:", err);
        reject(err);
      } else {
        console.log("Email successfully sent:", info.response);
        resolve(info);
      }
    });
  });
}

// Organization Signup
const organizationSignup = async (req, res) => {
  const { username, organizationName, email, password, contactNumber } = req.body;

  if (!username || !organizationName || !email || !password) {
    return res.status(400).json({ 
      message: "Username, organization name, email, and password are required." 
    });
  }

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const existingOrg = await Organization.findOne({ email });
    if (existingOrg) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Generate sequential organizationId
    const lastOrg = await Organization.findOne().sort({ organizationId: -1 });
    const organizationId = lastOrg ? lastOrg.organizationId + 1 : 1;

    const organization = new Organization({
      username,
      organizationName,
      email,
      password: hashedPassword,
      organizationId,
      verificationCode,
      verificationCodeExpires,
      contactNumber: contactNumber || null,
    });

    await organization.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your 4-digit verification code",
      text: `Hello ${organizationName},\n\nYour verification code is: ${verificationCode}\nIt expires in 15 minutes.\n\nThank you!`,
    };

    await sendMail(mailOptions);

    res.status(201).json({
      message: "Registration successful. Please check your email for the verification code.",
      organization: {
        organizationId: organization.organizationId,
        username: organization.username,
        organizationName: organization.organizationName,
        email: organization.email,
        isEmailVerified: organization.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error during organization signup:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
};

// Organization Login
const organizationLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (!process.env.SECRETKEY) {
    console.error("JWT secret key missing in environment variables.");
    return res.status(500).json({ message: "Server error: JWT secret not configured." });
  }

  try {
    const organization = await Organization.findOne({ email });
    if (!organization) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, organization.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!organization.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email before logging in.",
      });
    }

    const token = jwt.sign(
      {
        organizationId: organization.organizationId,
        email: organization.email,
        role: organization.role,
      },
      process.env.SECRETKEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      organization: {
        organizationId: organization.organizationId,
        username: organization.username,
        organizationName: organization.organizationName,
        email: organization.email,
        role: organization.role,
        isEmailVerified: organization.isEmailVerified,
        contactNumber: organization.contactNumber,
        profilePicture: organization.profilePicture,
      },
    });
  } catch (error) {
    console.error("Organization login error:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
};

// Get Organization Profile
const getProfile = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID not found in token." });
    }
    
    const organization = await Organization.findOne({ organizationId });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }
    
    res.status(200).json({
      message: "Profile retrieved successfully.",
      organization: {
        organizationId: organization.organizationId,
        username: organization.username,
        organizationName: organization.organizationName,
        email: organization.email,
        role: organization.role,
        isEmailVerified: organization.isEmailVerified,
        contactNumber: organization.contactNumber,
        profilePicture: organization.profilePicture,
      },
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ message: "An error occurred during profile retrieval." });
  }
};

// Verify Signup Code
const verifySignupCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and verification code are required." });
  }

  try {
    const organization = await Organization.findOne({ email, verificationCode: code });
    
    if (!organization) {
      return res.status(400).json({ message: "Invalid verification code or email." });
    }

    if (
      !organization.verificationCodeExpires ||
      organization.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "Verification code has expired." });
    }

    organization.isEmailVerified = true;
    organization.verificationCode = null;
    organization.verificationCodeExpires = null;
    await organization.save();

    res.status(200).json({ message: "Account verified successfully." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "An error occurred during verification." });
  }
};

const organizationController = {
  organizationSignup,
  organizationLogin,
  getProfile,
  verifySignupCode,
};

module.exports = organizationController;
