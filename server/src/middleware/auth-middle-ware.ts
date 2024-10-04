
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '@prisma/client';
import prisma from '../config/database';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        userId: string;
        email: string | null;
        role: 'USER' | 'ADMIN';
    };
    token?: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded?.userId },
            select: { id: true, email: true, role: true },
        }) as User | null;

        if (!user) {
            throw new Error();
        }

        (req as AuthRequest).user = {
            id: user.id,
            userId: user.id,
            email: user.email,
            role: user.role as 'USER' | 'ADMIN',
        };

        (req as AuthRequest).token = token;

        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if ((req as AuthRequest).user?.role !== 'ADMIN') {
        return res.status(403).send({ error: 'Access denied. Admin only.' });
    }
    next();
};

