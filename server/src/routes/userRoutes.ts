

import express from 'express';
import { adminMiddleware, authMiddleware } from '../middleware/auth-middle-ware';
import * as userController from '../controllers/userController';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, userController.getUsers);
router.post('/', authMiddleware, adminMiddleware, userController.createUser);
router.put('/:id', authMiddleware, adminMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);
router.post('/me', authMiddleware, userController.getMe);

export { router as userRouter };

