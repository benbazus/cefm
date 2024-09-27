import express from 'express';
import * as userController from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

//router.get('/profile', auth, userController.getProfile);
router.post('/register', userController.register);
//router.post('/login', userController.login);
//router.get('/confirm-email/:token', userController.confirmEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
//router.post('/refresh-token', userController.refreshToken);

export { router as userRouter };