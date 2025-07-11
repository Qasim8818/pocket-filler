const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * Routes for user authentication and password management.
 */
router.post('/signup', authController.signup); // Register a new user
router.post('/login', authController.login); // User login
router.post('/reset-password-request', authController.resetPasswordRequest); // Request password reset
router.post('/reset-password-confirm/:resetToken', authMiddleware, authController.resetPasswordConfirm); // Confirm password reset with token

module.exports = router;
