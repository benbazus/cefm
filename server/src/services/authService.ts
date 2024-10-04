
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { generateVerificationToken, getUserByEmail, getVerificationTokenByToken } from './userService';
import { sendTwoFactorTokenEmail, sendVerificationEmail } from '../utils/email';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateOtp } from '../utils/helpers';
import { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';



const OTP_EXPIRATION_MINUTES = 10;
const SALT_ROUNDS = 10;

export const refreshToken = async (refreshToken: string) => {
    try {
        const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
        const accessToken = generateAccessToken(decoded.id);

        return accessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
    }
};

export const login = async (email: string, password: string, code?: string): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> } | { success: string } | { error: string } | { twoFactor: boolean }> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) throw new Error('Invalid credentials');

    if (!user.emailVerified) {
        const verificationToken = await generateVerificationToken(user.email as string);
        await sendVerificationEmail(user.email as string, user.name ?? '', verificationToken.token);
        return { success: "Verification email sent!" };
    }

    if (user.isTwoFactorEnabled && user.email) {
        if (code) {

            const twoFactorToken = await prisma.twoFactorToken.findFirst({ where: { email } });

            if (!twoFactorToken || twoFactorToken.token !== code) return { error: "Invalid code!" };
            if (new Date(twoFactorToken.expires) < new Date()) return { error: "Code expired!" };


            await prisma.twoFactorToken.delete({ where: { id: twoFactorToken?.id } });
        } else {

            const { otp, otpExpires } = generateOtp();

            await prisma.user.update({
                where: { id: user.id },
                data: { lastActive: new Date(), otpToken: otp, otpExpires },
            });

            const existingToken = await prisma.twoFactorToken.findFirst({ where: { email } });

            if (existingToken) {
                await prisma.twoFactorToken.delete({ where: { id: existingToken.id } });
            }

            const token = otp as string;
            const expires = otpExpires as Date;


            await prisma.twoFactorToken.create({
                data: { email, token, expires },
            });

            await sendTwoFactorTokenEmail(email, user.name as string, otp);
            return { twoFactor: true };
        }
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
    });

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    return {
        ...accessToken, refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
    };
};



// Determine storage path based on environment
const getStoragePath = (email: string) => {
    if (process.env.NODE_ENV === 'production') {
        return path.join('/var/www/cefmdrive/storage', email);
    } else {
        return path.join(__dirname, 'public', 'storage', email); // Development path
    }
};

// Register new user
export const register = async (name: string, email: string, password: string): Promise<string> => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User email already exists.");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });


    // Create folder for user files
    const folderPath = getStoragePath(email);
    await fs.mkdir(folderPath, { recursive: true });
    await fs.chmod(folderPath, 0o700);

    // Create a folder record in the database (if you have a folder model)
    await prisma.folder.create({
        data: { name: email, userId: createdUser.id },
    });

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Update user with OTP token and expiry
    await prisma.user.update({
        where: { id: createdUser.id },
        data: { otpToken: otp, otpExpires },
    });

    // Generate and send verification token and email
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, name, verificationToken.token);

    return "Successfully registered. Verify your email!";
};


// Register new user
export const register1 = async (name: string, email: string, password: string): Promise<string> => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User email already exists.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const folderPath = path.join(__dirname, 'Storage', 'File Manager', email);
    await fs.mkdir(folderPath, { recursive: true });

    await prisma.folder.create({
        data: { name: email, userId: createdUser.id },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
        where: { id: createdUser.id },
        data: { otpToken: otp, otpExpires },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, name, verificationToken.token);


    return "Successfully registered. Verify your email!";
};



// Register new user
export const signIn = async (name: string, email: string, password: string): Promise<string> => {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error('User email already exists.');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user in the database
        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Create user folder for file storage
        const folderPath = path.join(process.cwd(), 'public', 'File Manager', email);
        await fs.mkdir(folderPath, { recursive: true });

        // Create root folder in the database for the user
        await prisma.folder.create({
            data: {
                name: email,
                userId: createdUser.id,
            },
        });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000); // 10-minute expiry

        // Save OTP to the user
        await prisma.user.update({
            where: { id: createdUser.id },
            data: { otpToken: otp, otpExpires },
        });

        // Generate verification token
        const verificationToken = await generateVerificationToken(email);

        // Send verification email
        await sendVerificationEmail(email, name, verificationToken.token);

        return 'Successfully registered. Verify your email!';
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle known Prisma errors, e.g., unique constraint violations
            throw new Error('An error occurred while interacting with the database.');
        } else {
            throw new Error(`Error: ${error}`);
        }
    }
};

export const newVerification = async (token: string) => {

    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "User not registered!" };
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            lastActive: new Date(),
            email: existingToken.email,
        },
    });

    await prisma.verificationToken.delete({
        where: { id: existingToken.id },
    });

    return "Account verified!";
};


export const createUser = async (name: string, email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
};



export const getUserProfile = async (userId: string) => {

    console.log(" ++++ getUserProfile +++++++  ")
    console.log(userId)
    console.log(" ++++ getUserProfile +++++++  ")

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

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};



export const confirmEmail = async (token: string) => {
    const userId = await verifyRefreshToken(token);

    if (!userId) {
        throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.confirmationToken !== token) {
        throw new Error('Invalid confirmation token');
    }
    await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: Date(), confirmationToken: null },
    });
};

const generateResetToken = async () => {
    return crypto.randomBytes(32).toString('hex');
};

export const createPasswordResetToken = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = await generateResetToken();

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

export const validateRefreshToken = async (refreshToken: string) => {
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
        throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User not found');
    }

    return userId;
};