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
exports.getCurrentUser = exports.resetPassword = exports.forgotPassword = exports.getProfile = exports.register = void 0;
const userService = __importStar(require("../services/userService"));
const email_1 = require("../utils/email");
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // const user = await userService.createUser(name, email, password);
        yield userService.register(name, email, password);
        // if (!user) {
        //     res.status(400).json({ error: 'User registration failed' });
        // }
        //   const confirmationToken = generateToken(user.id as string );
        // await userService.setConfirmationToken(user.id, confirmationToken);
        //  await sendConfirmationEmail(user.email as string, confirmationToken);
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
        const user = yield userService.getUserProfile(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }
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
        const resetToken = yield userService.createPasswordResetToken(email);
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
        yield userService.resetPassword(token, password);
        res.json({ message: 'Password reset successfully.' });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        console.log(" +++++++++ getCurrentUser +++++++++++++++ ");
        console.log(authHeader);
        console.log(" +++++++++ getCurrentUser +++++++++++++++ ");
        if (!authHeader)
            return null;
        const token = authHeader.split(' ')[1];
        if (!token)
            return null;
        //const userId: string | null = verifyAccessToken(token);
        const userId = (0, jwt_1.verifyAccessToken)(token);
        if (userId === null || userId === undefined) {
            throw new Error('Invalid access token');
        }
        const user = yield database_1.default.user.findUnique({ where: { id: "userId" } });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
});
exports.getCurrentUser = getCurrentUser;
