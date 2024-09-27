"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.resetPassword = exports.forgotPassword = exports.getProfile = exports.register = exports.emailVerification = exports.resendOtp = exports.verifyOtp = exports.logout = exports.refreshToken = exports.login = void 0;
const express_validator_1 = require("express-validator");
const authService = __importStar(require("../services/authService"));
const email_1 = require("../utils/email");
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, code } = req.body;
        const result = yield authService.login(email, password, code);
        if ('success' in result || 'error' in result || 'twoFactor' in result) {
            console.log(" ================================== ");
            console.log(result);
            console.log(" ================================== ");
            return res.json(result);
        }
        const { accessToken, refreshToken, user } = result;
        console.log(" 1111111111111111111111 ");
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        console.log(" 222222222222222222222222 ");
        res.json({
            message: 'Login successful',
            accessToken,
            user,
        });
        console.log(" 33333333333333333333333333 ");
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});
exports.login = login;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not found' });
        }
        const result = yield authService.refreshAccessToken(refreshToken);
        if (!result || !result.accessToken || !result.refreshToken) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        const { accessToken, refreshToken: newRefreshToken } = result;
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({ accessToken });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
exports.refreshToken = refreshToken;
// export const refreshToken1 = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;
//         if (!refreshToken) {
//             return res.status(401).json({ error: 'Refresh token not found' });
//         }
//         const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);
//         res.cookie('refreshToken', newRefreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });
//         res.json({ accessToken });
//     } catch (error) {
//         console.error('Refresh token error:', error);
//         res.status(401).json({ error: 'Invalid refresh token' });
//     }
// };
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'An error occurred during logout' });
    }
});
exports.logout = logout;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const user = yield database_1.default.user.findUnique({
            where: { email },
        });
        if (!user || user.otpToken !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            console.log('+++++++++++++++user++++++++++++++++++++++++ ');
            console.log('Invalid or expired OTP');
            console.log('+++++++++++++user++++++++++++++++++++++++++ ');
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        // Clear OTP and mark email as verified
        yield database_1.default.user.update({
            where: { id: user.id },
            data: {
                otpToken: null,
                otpExpires: null,
                emailVerified: new Date(),
            },
        });
        res.json({ message: 'OTP verified successfully' });
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'An error occurred while verifying OTP' });
    }
});
exports.verifyOtp = verifyOtp;
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { otp, otpExpires } = (0, helpers_1.generateOtp)();
        yield database_1.default.user.update({
            where: { id: user.id },
            data: { lastActive: new Date(), otpToken: otp, otpExpires },
        });
        const existingToken = yield database_1.default.twoFactorToken.findFirst({ where: { email } });
        if (existingToken) {
            yield database_1.default.twoFactorToken.delete({ where: { id: existingToken.id } });
        }
        const token = otp;
        const expires = otpExpires;
        yield database_1.default.twoFactorToken.create({
            data: { email, token, expires },
        });
        yield (0, email_1.sendTwoFactorTokenEmail)(email, user.name, otp);
        // const { otp, otpExpires } = generateOtp();
        // await prisma.user.update({
        //     where: { id: user.id },
        //     data: {
        //         otpToken: otp,
        //         otpExpires,
        //     },
        // });
        // await sendOtpEmail(email, otp);
        res.json({ message: 'New OTP sent successfully' });
    }
    catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'An error occurred while resending OTP' });
    }
});
exports.resendOtp = resendOtp;
// ... (rest of the code remains the same)
// import { Request, Response, NextFunction } from 'express';
// import * as authService from '../services/authService';
// import * as userService from '../services/userService';
// import { sendConfirmationEmail, sendPasswordResetEmail } from '../utils/email';
// import { validationResult } from 'express-validator';
// import bcrypt from 'bcrypt';
// import { generateTokens, invalidateRefreshToken } from '../utils/jwt';
// export const login = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         const { email, password, code } = req.body as { email: string; password: string; code?: string };
//         const result = await authService.login(email, password, code);
//         if ('success' in result || 'error' in result || 'twoFactor' in result) {
//             return res.json(result);
//         }
//         const { accessToken, refreshToken, user } = result;
//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });
//         console.log('+++++++++++++++useAuth++++++++++++++++++++++++ ')
//         console.log(result)
//         console.log('+++++++++++++useAuth++++++++++++++++++++++++++ ')
//         res.json({
//             message: 'Login successful',
//             accessToken,
//             user,
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'An error occurred during login' });
//     }
// };
// export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;
//         if (!refreshToken) {
//             return res.status(401).json({ error: 'Refresh token not found' });
//         }
//         const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);
//         res.cookie('refreshToken', newRefreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });
//         res.json({ accessToken });
//     } catch (error) {
//         console.error('Refresh token error:', error);
//         res.status(401).json({ error: 'Invalid refresh token' });
//     }
// };
// export const logout = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // const refreshToken = req.cookies.refreshToken;
//         // console.log('++++++++ refreshToken  +++++++++++++ ')
//         // console.log(refreshToken)
//         // console.log('++++++++v refreshToken +++++++++++++++ ')
//         // if (refreshToken) {
//         //     await invalidateRefreshToken(refreshToken);
//         // }
//         res.clearCookie('refreshToken');
//         res.json({ message: 'Logout successful' });
//     } catch (error) {
//         console.error('Logout error:', error);
//         res.status(500).json({ error: 'An error occurred during logout' });
//     }
// };
const emailVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        // console.log(" +++++++++++verify CONTROLLER Email++++++++++++++ ")
        // console.log(token)
        // console.log(" +++++++++++verify CONTROLLER Email++++++++++++++ ")
        yield authService.newVerification(token);
        res.json({ success: 'Email confirmed successfully.' });
    }
    catch (error) {
        next(error);
    }
});
exports.emailVerification = emailVerification;
// //=======================================================================================
// export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { token } = req.params;
//         console.log(" +++++++++++verifyEmail++++++++++++++ ")
//         console.log(token)
//         console.log(" +++++++++++verifyEmail++++++++++++++ ")
//         await authService.confirmEmail(token);
//         res.json({ message: 'Email confirmed successfully.' });
//     } catch (error) {
//         next(error);
//     }
// };
// export const login11 = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         const { email, password, code } = req.body as { email: string; password: string; code?: string };
//         const result = await authService.login(email, password, code);
//         if ('success' in result || 'error' in result || 'twoFactor' in result) {
//             return res.json(result);
//         }
//         const { accessToken, refreshToken } = result;
//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });
//         res.json({ accessToken });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'An error occurred during login' });
//     }
// };
// export const register = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { name, email, password } = req.body;
//         const user = await authService.createUser(name, email, password);
//         const confirmationToken = await generateTokens(user.id);
//         //  await authService.setConfirmationToken(user.id, confirmationToken);
//         //  await sendConfirmationEmail(user.email as string, confirmationToken);
//         res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
//     } catch (error) {
//         next(error);
//     }
// };
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        yield authService.register(name, email, password);
        res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const user = yield authService.getUserProfile(userId);
        console.log(" ++++++++++getProfile+++++++++++++++ ");
        console.log(userId);
        console.log(user);
        console.log(" +++++++++++getProfile++++++++++++++ ");
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const resetToken = yield authService.createPasswordResetToken(email);
        yield (0, email_1.sendPasswordResetEmail)(email, resetToken);
        res.json({ message: 'Password reset email sent.' });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        console.log(" ++++++++++resetPassword+++++++++++++++ ");
        console.log(token);
        console.log(password);
        console.log(" +++++++++++resetPassword++++++++++++++ ");
        yield authService.resetPassword(token, password);
        res.json({ message: 'Password reset successfully.' });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
