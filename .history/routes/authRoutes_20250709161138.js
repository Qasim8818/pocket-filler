const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Authentication routes
// Handles user registration, login, and password reset flows
router.post('/signup', authController.signup); // Register new user
router.post('/login', authController.login); // User login
router.post('/reset-password-request', authController.resetPasswordRequest); // Request password reset
router.post('/reset-password-confirm/:resetToken', authMiddleware, authController.resetPasswordConfirm); // Confirm password reset

module.exports = router;
