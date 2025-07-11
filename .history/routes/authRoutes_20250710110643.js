const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup); 
router.post('/login', authController.login); 
router.post('/reset-password-request', authController.resetPasswordRequest); 
router.post('/reset-password-confirm/:resetToken', authController.resetPasswordConfirm); 

module.exports = router;
