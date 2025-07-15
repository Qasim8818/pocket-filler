const Auth = require("../models/auth");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

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

// Signup: register a new user and send a 4-digit verification code via email
exports.signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ message: "Full name, email, and password are required." });
  }

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    console.log(
      "Signup verification code:",
      verificationCode,
      "Expires at:",
      verificationCodeExpires
    );

    const user = new Auth({
      fullName,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpires,
      roles: ["user"],
      isOrganization: false,
      organizationName: organizationName || null,
      organizationId: organizationId || null,
      organization: organizationId
        ? mongoose.Types.ObjectId(organizationId)
        : null,
      contactNumber: req.body.contactNumber || null,
    });

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your 4-digit verification code",
      text: `Hello ${fullName},\n\nYour verification code is: ${verificationCode}\nIt expires in 15 minutes.\n\nThank you!`,
    };

    await sendMail(mailOptions);

    res.status(201).json({
      message:
        "Registration successful. Please check your email for the verification code.",
      user: {
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
};

// Organization signup endpoint: creates organization user and sends 4-digit verification code via email.

exports.organizationSignup = async (req, res) => {
  const { username, organizationName, email, password } = req.body;

  if (!username || !organizationName || !email || !password) {
    return res.status(404).json({ message: 'Organization name, email, and password are required.' });
  }

  if (!email.includes('@') || !email.includes('.')) {
    return res.status(404).json({ message: 'Invalid email format.' });
  }

  try {
    const existingOrg = await Auth.findOne({ email });
    if (existingOrg) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    console.log('Organization Signup - verificationCode:', verificationCode, 'expires at:', verificationCodeExpires);

    const organization = new Auth({
      username,
      organizationName,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpires,
      isOrganization: true,
      organizationId: organization.id,
      organization: organization
    });

    await organization.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your 4-digit verification code for organization account',
      text: `Hello ${organizationName},\n\nYour verification code is: ${verificationCode}\nIt expires in 15 minutes.\n\nThank you!`,
    };

    await sendMail(mailOptions);

    res.status(201).json({
      message: 'Organization registration successful. Please check your email for the verification code.',
      organization: [{
        username: organization.username,
        organizationName: organization.organizationName,
        email: organization.email,
        isEmailVerified: organization.isEmailVerified,
        organizationRole: organization.organizationRole,
        organizationId: organization.id,
        roles: organization.roles,
        isOrganization: organization.isOrganization,
        contactNumber: organization.contactNumber || null,
      }],
    });
  } catch (error) {
    console.error('Organization signup error:', error);
    res.status(500).json({ message: 'An error occurred during organization signup.' });
  }
};

// Organization login endpoint

exports.organizationLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and password are required." });
  }

  if (!process.env.SECRETKEY) {
    console.error("JWT secret key missing in environment variables.");
    return res
      .status(500)
      .json({ message: "Server error: JWT secret not configured." });
  }

  try {
    console.log("Attempting to find organization with email:", email);
    const organization = await Auth.findOne({ email });
    console.log("Organization found:", organization);
    if (!organization) {
      console.log("No organization found with given email.");
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      organization.password
    );
    console.log("Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      console.log("Password invalid for given email.");
      return res.status(409).json({ message: "Invalid email or password." });
    }

    if (!organization.isEmailVerified) {
      return res
        .status(403)
        .json({
          message:
            "Email not verified. Please verify your email before logging in.",
        });
    }

    const token = jwt.sign(
      {
        userId: organization._id,
        email: organization.email,
        roles: organization.roles,
        isOrganization: true,
      },
      process.env.SECRETKEY,
      { expiresIn: "1h" }
    );

    console.log(
      `Organization ${organization.email} logged in with roles: ${
        organization.roles ? organization.roles.join(", ") : "none"
      }`
    );

    // Ensure roles include 'organization' if isOrganization is true
    let roles = organization.roles || [];
    if (organization.isOrganization && !roles.includes("organization")) {
      roles = [...roles, "organization"];
    }

    res.status(200).json({
      message: "Organization login successful.",
      token,
      organization: {
        organizationName: organization.organizationName,
        email: organization.email,
        userType: "organization",
        isEmailVerified: organization.isEmailVerified,
        organizationId: organization._id,
        organizationRole: organization.organizationRole,
        isOrganization: organization.isOrganization,
        org: organization.organization || null,
        contactNumber: organization.contactNumber || null,
      },
    });
  } catch (error) {
    console.error("Organization login error:", error);
    res
      .status(500)
      .json({ message: "An error occurred during organization login." });
  }
};

// Endpoint to verify the 4-digit signup verification code.

exports.verifySignupCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(404)
      .json({ message: "Email and verification code are required." });
  }

  try {
    const user = await Auth.findOne({ email, verificationCode: code });
    console.log("verifySignupCode - user found:", user);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid verification code or email." });
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      console.log(
        "verifySignupCode - code expired:",
        user.verificationCodeExpires
      );
      return res
        .status(409)
        .json({ message: "Verification code has expired." });
    }

    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.status(200).json({ message: "Account verified successfully." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "An error occurred during verification." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and password are required." });
  }

  if (!process.env.SECRETKEY) {
    console.error("JWT secret key missing in environment variables.");
    return res
      .status(500)
      .json({ message: "Server error: JWT secret not configured." });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(409).json({ message: "Invalid email or password." });
    }

    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({
          message:
            "Email not verified. Please verify your email before logging in.",
        });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, roles: user.roles },
      process.env.SECRETKEY,
      { expiresIn: "1h" }
    );

    console.log(
      `User ${user.email} logged in with roles: ${user.roles.join(", ")}`
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
};

exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(409).json({ message: "Email address is required." });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = Date.now() + 3600000; // 1 hour from now

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    user.resetPassword = true;
    await user.save();

    const resetLink = `http://yourapp.com/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link below to reset your password:\n${resetLink}\nIf you did not request this, please ignore this email.`,
    };

    await sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset link sent to your email.",
      user: {
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Reset password request error:", error);
    res
      .status(500)
      .json({ message: "An error occurred during password reset request." });
  }
};

exports.resetPasswordConfirm = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword, fullName, email, contactNumber } = req.body;

  if (!newPassword) {
    return res.status(401).json({ message: "New password is required." });
  }

  try {
    const user = await Auth.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid or expired reset token." });
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
      message: "Password reset successfully.",
      user: {
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Reset password confirmation error:", error);
    res
      .status(500)
      .json({
        message: "An error occurred during password reset confirmation.",
      });
  }
};

/**
 * Update user profile endpoint
 */
exports.updateProfile = async (req, res) => {
  const {
    userId,
    fullName,
    email,
    contactNumber,
    password,
    profilePicture,
    organizationName,
    organizationId,
  } = req.body;
  if (!userId) {
    return res.status(409).json({ message: "User ID is required." });
  }
  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Update user fields if provided

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (contactNumber) user.contactNumber = contactNumber;
    if (profilePicture) user.profilePicture = profilePicture;
    if (organizationName) user.organizationName = organizationName;
    if (organizationId) user.organizationId = organizationId;

    // If organizationId is provided, set organization and isOrganization fields
    if (organizationId && organizationId !== user.organizationId) {
      user.organization = mongoose.Types.ObjectId(organizationId);
      user.isOrganization = true;
    } else if (!organizationId) {
      user.isOrganization = false;
      user.organization = null;
    }
    // If password is provided, update it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
        profilePicture: user.profilePicture,
        organizationName: user.organizationName,
        organizationId: user.organizationId,
        isOrganization: user.isOrganization,
        userId: user._id,
        roles: user.roles || [],
        isEmailVerified: user.isEmailVerified,
        isUser: user.isUser,
        organizationRole: user.organizationRole || "user",
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res
      .status(500)
      .json({ message: "An error occurred during profile update." });
  }

  exports.getProfile = async (req, res) => {
    const { userId } = req.user.body;
    if (!userId) {
      res.status(409).json({ message: "User ID is required." });
    } else {
      try {
        const user = await Auth.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({
          message: "Profile retrieved successfully.",
          user: {
            fullName: user.fullName,
            email: user.email,
            contactNumber: user.contactNumber,
            profilePicture: user.profilePicture,
            organizationName: user.organizationName,
            organizationId: user.organizationId,
            isOrganization: user.isOrganization,
            userId: user._id,
            roles: user.roles || [],
            isEmailVerified: user.isEmailVerified,
            isUser: user.isUser,
            organizationRole: user.organizationRole || "user",
            organization: user.organization || null,
            userType: user.isOrganization ? "organization" : "user",
            isVerified: user.isVerified || false,
          },
        });
      } catch (error) {
        console.error("Profile retrieval error:", error);
        res
          .status(500)
          .json({ message: "An error occurred during profile retrieval." });
      }
    }
  };
  exports.getOrganizationProfile = async (req, res) => {
    const { organizationId } = req.organization.body;
    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }
    try {
      const organization = await Auth.findById(organizationId);
      if (!organization || !organization.isOrganization) {
        return res.status(404).json({ message: "Organization not found." });
      }
      res.status(200).json({
        message: "Organization profile retrieved successfully.",
        organization: {
          organizationName: organization.organizationName,
          email: organization.email,
          contactNumber: organization.contactNumber,
          profilePicture: organization.profilePicture,
          organizationId: organization._id,
          roles: organization.roles || [],
          isEmailVerified: organization.isEmailVerified,
          isOrganization: organization.isOrganization,
          userType: "organization",
          organizationRole: organization.organizationRole || "organization",
          isVerified: organization.isVerified || false,
          isUser: organization.isUser || false,
        },
      });
    } catch (error) {
      console.error("Error retrieving organization profile:", error);
      res
        .status(500)
        .json({
          message:
            "An error occurred while retrieving the organization profile.",
        });
    }
  };
};

exports.getProfile = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(409).json({ message: "User ID is required." });
  }
  try {
    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      message: "Profile retrieved successfully.",
      user: {
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
        profilePicture: user.profilePicture,
        organizationName: user.organizationName,
        organizationId: user.organizationId,
        isOrganization: user.isOrganization,
        userId: user._id,
        roles: user.roles || [],
        isEmailVerified: user.isEmailVerified,
        isUser: user.isUser,
        organizationRole: user.organizationRole || "user",
        organization: user.organization || null,
        userType: user.isOrganization ? "organization" : "user",
        isVerified: user.isVerified || false,
      },
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res
      .status(500)
      .json({ message: "An error occurred during profile retrieval." });
  }
};

exports.getOrganizationProfile = async (req, res) => {
  const { organizationId } = req.body;
  if (!organizationId) {
    return res.status(400).json({ message: "Organization ID is required." });
  }
  try {
    const organization = await Auth.findById(organizationId);
    if (!organization || !organization.isOrganization) {
      return res.status(404).json({ message: "Organization not found." });
    }
    res.status(200).json({
      message: "Organization profile retrieved successfully.",
      organization: {
        organizationName: organization.organizationName,
        email: organization.email,
        contactNumber: organization.contactNumber,
        profilePicture: organization.profilePicture,
        organizationId: organization._id,
        roles: organization.roles || [],
        isEmailVerified: organization.isEmailVerified,
        isOrganization: organization.isOrganization,
        userType: "organization",
        organizationRole: organization.organizationRole || "organization",
        isVerified: organization.isVerified || false,
        isUser: organization.isUser || false,
      },
    });
  } catch (error) {
    console.error("Error retrieving organization profile:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while retrieving the organization profile.",
      });
  }
};
