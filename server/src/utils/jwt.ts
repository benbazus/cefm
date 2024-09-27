;
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import crypto from 'crypto';
import { z } from 'zod';


const resetTokenSchema = z.object({
    token: z.string().optional(),
    userId: z.string().uuid(),
});


const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;


const ACCESS_TOKEN_EXPIRY = '30m';
const REFRESH_TOKEN_EXPIRY = '7d';
const RESET_TOKEN_EXPIRY = '7d';

export const generateTokens = async (userId: string) => {

    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });

    return { accessToken, refreshToken };
};


const generateResetToken = async () => {
    return crypto.randomBytes(32).toString('hex');
};

export const generatePasswordResetToken = async (
    token: string,
    userId: string
): Promise<{ resetToken: string } | null> => {
    try {
        // Validate input
        const { error } = resetTokenSchema.safeParse({ token, userId });
        if (error) {
            throw new Error('Invalid input');
        }

        // Generate secure reset token
        const resetToken = await generateResetToken();

        // Validate user ID existence before updating
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        // Update user with reset token
        await prisma.user.update({
            where: { id: userId },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: new Date(Date.now() + parseInt(RESET_TOKEN_EXPIRY, 10) * 1000),
            },
        });

        return { resetToken };
    } catch (error) {
        console.error('Error generating reset token:', error);
        return null;
    }
};


// export const resetToken = async (token: string, userId: string): Promise<{ resetToken: string; } | null> => {
//     try {
//         const resetToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET!, { expiresIn: RESET_TOKEN_EXPIRY });

//         await prisma.user.update({
//             where: { id: userId },
//             data: {
//                 resetPasswordToken: resetToken,
//                 resetPasswordExpires: new Date(Date.now() + 3600000),
//             },
//         });

//         return resetToken;
//     } catch (error) {
//         return null;
//     }
// };

export const verifyAccessToken = (token: string): { userId: string } | null => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET!) as { userId: string };
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = async (token: string): Promise<string | null> => {
    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET!) as { userId: string };
        const storedToken = await prisma.refreshToken.findFirst({
            where: { token, userId: decoded.userId, expiresAt: { gt: new Date() } },
        });

        if (!storedToken) return null;

        return decoded.userId;
    } catch (error) {
        return null;
    }
};

export const invalidateRefreshToken = async (token: string) => {
    await prisma.refreshToken.delete({ where: { token } });
};