"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.createPasswordResetToken = exports.setConfirmationToken = exports.validateUser = exports.createUser = exports.getUserProfile = exports.verifyOtp = exports.getTwoFactorConfirmationByUserId = exports.getTwoFactorTokenByEmail = exports.getPasswordResetTokenByEmail = exports.getPasswordResetTokenByToken = exports.getTwoFactorTokenByToken = exports.getUserById = exports.getVerificationTokenByEmail = exports.register = exports.generateVerificationToken = exports.getVerificationTokenByToken = exports.getUserByEmail = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const email_1 = require("../utils/email");
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findUnique({
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
    return user;
});
exports.getUserByEmail = getUserByEmail;
// Get verification token by token
const getVerificationTokenByToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.verificationToken.findUnique({
        where: { token },
    });
});
exports.getVerificationTokenByToken = getVerificationTokenByToken;
// Generate verification token
const generateVerificationToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, uuid_1.v4)();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // Expires in 1 hour
    const existingToken = yield database_1.default.verificationToken.findFirst({ where: { email } });
    if (existingToken) {
        yield database_1.default.verificationToken.delete({
            where: { id: existingToken.id },
        });
    }
    return database_1.default.verificationToken.create({
        data: {
            email,
            token,
            expires,
        },
    });
});
exports.generateVerificationToken = generateVerificationToken;
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
const register = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield database_1.default.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error("User email already exists.");
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const createdUser = yield database_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    const folderPath = path_1.default.join(process.cwd(), 'public', 'File Manager', email);
    yield fs_1.promises.mkdir(folderPath, { recursive: true });
    yield database_1.default.folder.create({
        data: { name: email, userId: createdUser.id },
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    yield database_1.default.user.update({
        where: { id: createdUser.id },
        data: { otpToken: otp, otpExpires },
    });
    yield (0, email_1.sendOtpEmail)(email, otp);
    const verificationToken = yield (0, exports.generateVerificationToken)(email);
    yield (0, email_1.sendVerificationEmail)(email, name, verificationToken.token);
    // const confirmationToken = generateToken(user.id as string);
    // await userService.setConfirmationToken(user.id, confirmationToken);
    // await sendConfirmationEmail(user.email as string, confirmationToken);
    return "Successfully registered. Verify your email!";
});
exports.register = register;
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
const getVerificationTokenByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verificationToken = yield database_1.default.verificationToken.findFirst({
            where: { email },
        });
        return verificationToken;
    }
    catch (_a) {
        return null;
    }
});
exports.getVerificationTokenByEmail = getVerificationTokenByEmail;
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findUnique({
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
});
exports.getUserById = getUserById;
const getTwoFactorTokenByToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const twoFactorToken = yield database_1.default.twoFactorToken.findUnique({
            where: { token },
        });
        return twoFactorToken;
    }
    catch (_a) {
        return null;
    }
});
exports.getTwoFactorTokenByToken = getTwoFactorTokenByToken;
const getPasswordResetTokenByToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passwordResetToken = yield database_1.default.passwordResetToken.findUnique({
            where: { token },
        });
        return passwordResetToken;
    }
    catch (_a) {
        return null;
    }
});
exports.getPasswordResetTokenByToken = getPasswordResetTokenByToken;
const getPasswordResetTokenByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passwordResetToken = yield database_1.default.passwordResetToken.findFirst({
            where: { email },
        });
        return passwordResetToken;
    }
    catch (_a) {
        return null;
    }
});
exports.getPasswordResetTokenByEmail = getPasswordResetTokenByEmail;
const getTwoFactorTokenByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const twoFactorToken = yield database_1.default.twoFactorToken.findFirst({
            where: { email },
        });
        return twoFactorToken;
    }
    catch (_a) {
        return null;
    }
});
exports.getTwoFactorTokenByEmail = getTwoFactorTokenByEmail;
// export const sendSharedFileEmail = async (email: string, message: string, shareableLink: string) => {
//     const user = await prisma.user.findUnique({ where: { email }, });
//     if (!user) {
//         throw new Error('User not found')
//     }
//     await sendSharedLinkEmail(email, message, user?.email as string, shareableLink)
//     return { success: true };
// }
const getTwoFactorConfirmationByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const twoFactorConfirmation = yield database_1.default.twoFactorConfirmation.findUnique({
            where: { userId },
        });
        return twoFactorConfirmation;
    }
    catch (_a) {
        return null;
    }
});
exports.getTwoFactorConfirmationByUserId = getTwoFactorConfirmationByUserId;
// Verify OTP
const verifyOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('User not found');
    if (user.otpToken !== otp || (user.otpExpires && user.otpExpires < new Date())) {
        throw new Error('Invalid or expired OTP');
    }
    yield database_1.default.user.update({
        where: { id: user.id },
        data: { emailVerified: Date(), otpToken: null, otpExpires: null },
    });
    return 'Email verified successfully';
});
exports.verifyOtp = verifyOtp;
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
const getUserProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findUnique({
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
});
exports.getUserProfile = getUserProfile;
const createUser = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    return database_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
});
exports.createUser = createUser;
const validateUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials or email not confirmed');
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }
    return user;
});
exports.validateUser = validateUser;
const setConfirmationToken = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.user.update({
        where: { id: userId },
        data: { confirmationToken: token },
    });
});
exports.setConfirmationToken = setConfirmationToken;
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
const createPasswordResetToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }
    const resetToken = (0, uuid_1.v4)();
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    yield database_1.default.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpires },
    });
    return resetToken;
});
exports.createPasswordResetToken = createPasswordResetToken;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: new Date() },
        },
    });
    if (!user) {
        throw new Error('Invalid or expired reset token');
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    yield database_1.default.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });
});
exports.resetPassword = resetPassword;
// export const validateRefreshToken = async (refreshToken: string) => {
//     const userId = verifyAccessToken(refreshToken);
//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user) {
//         throw new Error('Invalid refresh token');
//     }
//     return userId;
// };
