
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, VerificationToken } from '@prisma/client';
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


// // Generate two-factor token
// export const generateTwoFactorToken = async (userId: string, email: string): Promise<TwoFactorToken> => {
//     const token = generateTokens(userId);
//     const expires = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes

//     const existingToken = await prisma.twoFactorToken.findFirst({ where: { email } });

//     if (existingToken) {
//         await prisma.twoFactorToken.delete({ where: { id: existingToken.id } });
//     }

//     return prisma.twoFactorToken.create({
//         data: { email, token, expires },
//     });
// };


// // Login function
// export const login = async (email: string, password: string, code?: string): Promise<string | { success?: string; error?: string; twoFactor?: boolean }> => {
//     const user = await getUserByEmail(email);
//     if (!user) throw new Error('Invalid credentials');

//     const isMatch = await bcrypt.compare(password, user.password as string);
//     if (!isMatch) throw new Error('Invalid credentials');

//     // if (!user.emailVerified) {
//     //     const verificationToken = await generateVerificationToken(user.email as string);
//     //     await sendVerificationEmail(user.email as string, user.name ?? '', verificationToken.token);
//     //     return { success: "Verification email sent!" };
//     // }

//     if (user.isTwoFactorEnabled && user.email) {
//         if (code) {
//             const twoFactorToken = await prisma.twoFactorToken.findFirst({ where: { email } });
//             if (!twoFactorToken || twoFactorToken.token !== code) return { error: "Invalid code!" };

//             if (new Date(twoFactorToken.expires) < new Date()) return { error: "Code expired!" };

//             await prisma.twoFactorToken.delete({ where: { id: twoFactorToken.id } });
//         } else {
//             const twoFactorToken = await generateTwoFactorToken(user.id, user.email);
//             await sendTwoFactorTokenEmail(user.email, user.name ?? '', twoFactorToken.token);
//             return { twoFactor: true };
//         }
//     }

//     return generateTokens(user.id);
// };

// Register new user
export const register = async (name: string, email: string, password: string): Promise<string> => {
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

    const folderPath = path.join(process.cwd(), 'public', 'File Manager', email);
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

    await sendOtpEmail(email, otp);
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, name, verificationToken.token);



    // const confirmationToken = generateToken(user.id as string);

    // await userService.setConfirmationToken(user.id, confirmationToken);

    // await sendConfirmationEmail(user.email as string, confirmationToken);


    return "Successfully registered. Verify your email!";
};

// export const login1 = async (email: string, password: string, code: string) => {

//     // Check if user exists
//     const user = await getUserByEmail(email);
//     if (!user) {
//         throw new Error('Invalid credentials');
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password as string);
//     if (!isMatch) {
//         throw new Error('Invalid credentials');
//     }

//     if (!user.emailVerified) {

//         const verificationToken = await generateVerificationToken(user.email as string);
//         await sendVerificationEmail(verificationToken.email, user?.name as string, verificationToken.token);

//         return { success: "Verification email sent!" };
//     }

//     if (user.isTwoFactorEnabled && user.email) {
//         if (code) {
//             const twoFactorToken = await prisma.twoFactorToken.findFirst({
//                 where: { email },
//             });

//             if (!twoFactorToken || twoFactorToken.token !== code) {
//                 return { error: "Invalid code!" };
//             }

//             const hasExpired = new Date(twoFactorToken.expires) < new Date();

//             if (hasExpired) {
//                 return { error: "Code expired!" };
//             }

//             await prisma.twoFactorToken.delete({
//                 where: { id: twoFactorToken.id },
//             });
//             const existingConfirmation = await prisma.twoFactorConfirmation.findUnique({ where: { userId: user.id } });

//             if (existingConfirmation) {
//                 await prisma.twoFactorConfirmation.delete({
//                     where: { id: existingConfirmation.id },
//                 });
//             }

//             await prisma.twoFactorConfirmation.create({
//                 data: {
//                     userId: user.id,
//                 },
//             });
//         } else {
//             const twoFactorToken = await generateTwoFactorToken(user.id, user.email);

//             await sendTwoFactorTokenEmail(twoFactorToken.email, user?.name as string, twoFactorToken.token);

//             return { twoFactor: true };
//         }
//     }
//     // Generate JWT token
//     const token = generateTokens(user.id);
//     return token;

// }




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

// export const sendSharedFileEmail = async (email: string, message: string, shareableLink: string) => {

//     const user = await prisma.user.findUnique({ where: { email }, });
//     if (!user) {
//         throw new Error('User not found')
//     }
//     await sendSharedLinkEmail(email, message, user?.email as string, shareableLink)

//     return { success: true };

// }


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



// export const register1 = async (name: string, email: string, password: string): Promise<string> => {

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const existingUser = await prisma.user.findUnique({ where: { email }, });

//     // console.log(existingUser);

//     if (existingUser) {

//         throw new Error("User email already exists.")
//     }

//     const createdUser = await prisma.user.create({
//         data: {
//             name,
//             email,
//             password: hashedPassword,
//         },
//     });

//     // Create folder in the public directory based on email
//     const folderPath = path.join(process.cwd(), 'public', 'File Manager', email);

//     await fs.mkdir(folderPath, { recursive: true });

//     // Save folder metadata to the database
//     await prisma.folder.create({
//         data: {
//             name: email,
//             userId: createdUser.id
//         },
//     });

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString()
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes

//     await prisma.user.create({
//         data: { isVerified: false, otpToken: otp, otpExpires: otpExpires },
//     });

//     // Send OTP to user's email
//     await sendOtpEmail(email, otp)

//     const verificationToken = await generateVerificationToken(email);

//     await sendVerificationEmail(verificationToken.email, name, verificationToken.token);

//     return "Successfully registered. Verify your email!";
// };



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

// export const confirmEmail = async (token: string) => {
//     const userId = verifyAccessToken(token);
//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user || user.confirmationToken !== token) {
//         throw new Error('Invalid confirmation token');
//     }
//     await prisma.user.update({
//         where: { id: userId },
//         data: { isEmailConfirmed: true, confirmationToken: null },
//     });
// };

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

// export const validateRefreshToken = async (refreshToken: string) => {
//     const userId = verifyAccessToken(refreshToken);
//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user) {
//         throw new Error('Invalid refresh token');
//     }
//     return userId;
// };

