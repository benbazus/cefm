import express from 'express';
import * as authController from '../controllers/authController'
import { auth } from '../middleware/auth';


const router = express.Router();

router.post('/logout', auth, authController.logout);
router.get('/profile', auth, authController.getProfile);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/email-verification/:token', authController.emailVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
//router.post('/refresh-token', authController.refreshToken);
router.post('/resend-otp', authController.resendOtp);
router.post('/verify-otp', authController.verifyOtp);
export { router as authRouter };

