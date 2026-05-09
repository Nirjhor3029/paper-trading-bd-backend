const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword, validateChangePassword } = require('../middlewares/validationMiddleware');
const { protect } = require('../middlewares/authMiddleware');

router.post('/auth/register', validateRegister, authController.register);
router.post('/auth/login', validateLogin, authController.login);
router.get('/auth/me', protect, authController.getProfile);
router.post('/auth/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/auth/reset-password', validateResetPassword, authController.resetPassword);
router.post('/auth/change-password', protect, validateChangePassword, authController.changePassword);

module.exports = router;
