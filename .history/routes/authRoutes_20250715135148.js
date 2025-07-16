const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup); 
router.post('/verify-signup-code', authController.verifySignupCode);
router.post('/login', authController.login); 
router.post('/reset-password-request', authController.resetPasswordRequest); 
router.post('/reset-password-confirm/:resetToken', authController.resetPasswordConfirm); 
router.post('/update-profile', authController.updateProfile);

// Organization account routes
router.post('/organization-signup', authController.organizationSignup);
router.post('/organization-login', authController.organizationLogin);
router.get('/profile', authController.getProfile);
router.get('/organization-profile', authMiddleware, authController.getOrganizationProfile);

module.exports = router;
