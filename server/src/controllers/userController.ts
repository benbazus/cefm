
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { sendPasswordResetEmail } from '../utils/email';
import prisma from '../config/database';
import { User } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';




export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        const { name, email, password } = req.body as { name: string; email: string; password: string };
        // const user = await userService.createUser(name, email, password);
        await userService.register(name, email, password);

        // if (!user) {
        //     res.status(400).json({ error: 'User registration failed' });
        // }


        //   const confirmationToken = generateToken(user.id as string );

        // await userService.setConfirmationToken(user.id, confirmationToken);

        //  await sendConfirmationEmail(user.email as string, confirmationToken);

        res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
    } catch (error) {
        next(error);
    }
};


export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.user as { userId: string };
        const user = await userService.getUserProfile(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};


export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body as { email: string };
        const resetToken = await userService.createPasswordResetToken(email);

        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'Password reset email sent.' });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.params as { token: string };
        const { password } = req.body as { password: string };

        await userService.resetPassword(token, password);

        res.json({ message: 'Password reset successfully.' });
    } catch (error) {
        next(error);
    }
};



export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<User | null> => {
    try {
        const authHeader = req.headers.authorization;

        console.log(" +++++++++ getCurrentUser +++++++++++++++ ");
        console.log(authHeader);
        console.log(" +++++++++ getCurrentUser +++++++++++++++ ");

        if (!authHeader) return null;

        const token = authHeader.split(' ')[1];

        if (!token) return null;

        //const userId: string | null = verifyAccessToken(token);
        const userId = verifyAccessToken(token);

        if (userId === null || userId === undefined) {
            throw new Error('Invalid access token');
        }

        const user = await prisma.user.findUnique({ where: { id: "userId" } });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

