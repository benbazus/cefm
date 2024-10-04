
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, VerificationToken } from '@prisma/client';
import path from 'path';

import { promises as fs } from 'fs';
import { sendOtpEmail, sendSharedLinkEmail, sendTwoFactorTokenEmail, sendVerificationEmail } from '../utils/email';

export const getUserByEmail = async (email: string): Promise<User> => {
    const user = await prisma.user.findUnique({
        where: { email: email },
        select: {
            id: true,
            name: true,
            password: true,
            email: true,
            isTwoFactorEnabled: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user as User;
}


// Get verification token by token
export const getVerificationTokenByToken = async (token: string): Promise<VerificationToken | null> => {
    return prisma.verificationToken.findUnique({
        where: { token },
    });
};


// Generate verification token
export const generateVerificationToken = async (email: string): Promise<VerificationToken> => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // Expires in 1 hour

    const existingToken = await prisma.verificationToken.findFirst({ where: { email } });

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: { id: existingToken.id },
        });
    }

    return prisma.verificationToken.create({
        data: {
            email,
            token,
            expires,
        },
    });
};

export const getUsers = async (): Promise<User[]> => {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } }) as User[];
    return users;
};



export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { email },
        });

        return verificationToken;
    } catch {
        return null;
    }
};


export const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
};



export const getTwoFactorTokenByToken = async (token: string) => {
    try {
        const twoFactorToken = await prisma.twoFactorToken.findUnique({
            where: { token },
        });

        return twoFactorToken;
    } catch {
        return null;
    }
};

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        return passwordResetToken;
    } catch {
        return null;
    }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: { email },
        });

        return passwordResetToken;
    } catch {
        return null;
    }
};


export const getTwoFactorTokenByEmail = async (email: string) => {
    try {
        const twoFactorToken = await prisma.twoFactorToken.findFirst({
            where: { email },
        });

        return twoFactorToken;
    } catch {
        return null;
    }
};



export const getTwoFactorConfirmationByUserId = async (userId: string) => {
    try {
        const twoFactorConfirmation = await prisma.twoFactorConfirmation.findUnique({
            where: { userId },
        });

        return twoFactorConfirmation;
    } catch {
        return null;
    }
};

// Verify OTP
export const verifyOtp = async (email: string, otp: string): Promise<string> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    if (user.otpToken !== otp || (user.otpExpires && user.otpExpires < new Date())) {
        throw new Error('Invalid or expired OTP');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: Date(), otpToken: null, otpExpires: null },
    });

    return 'Email verified successfully';
};



export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
};


export const createUser = async (name: string, email: string, password: string, role: UserRole) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role: role } });


    const folderPath = path.join(__dirname, 'Storage', 'File Manager', email);
    await fs.mkdir(folderPath, { recursive: true });

    await prisma.folder.create({
        data: { name: email, userId: user.id },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
        where: { id: user.id },
        data: { otpToken: otp, otpExpires },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, name, verificationToken.token);
}


export const updateUser = async (id: string, name: string, email: string, role: UserRole) => {
    await prisma.user.update({ where: { id }, data: { name, email, role: role } });
}

export const deleteUser = async (id: string) => {
    await prisma.user.delete({ where: { id } });
}


export const validateUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials or email not confirmed');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }
    return user;
};

export const setConfirmationToken = async (userId: string, token: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: { confirmationToken: token },
    });
};


export const createPasswordResetToken = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }
    const resetToken = uuidv4();
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpires },
    });
    return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: new Date() },
        },
    });
    if (!user) {
        throw new Error('Invalid or expired reset token');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });
};

