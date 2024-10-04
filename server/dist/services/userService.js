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
exports.resetPassword = exports.createPasswordResetToken = exports.setConfirmationToken = exports.validateUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserProfile = exports.verifyOtp = exports.getTwoFactorConfirmationByUserId = exports.getTwoFactorTokenByEmail = exports.getPasswordResetTokenByEmail = exports.getPasswordResetTokenByToken = exports.getTwoFactorTokenByToken = exports.getUserById = exports.getVerificationTokenByEmail = exports.getUsers = exports.generateVerificationToken = exports.getVerificationTokenByToken = exports.getUserByEmail = void 0;
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
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield database_1.default.user.findMany({ select: { id: true, name: true, email: true, role: true } });
    return users;
});
exports.getUsers = getUsers;
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
const createUser = (name, email, password, role) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield database_1.default.user.create({ data: { name, email, password: hashedPassword, role: role } });
    const folderPath = path_1.default.join(__dirname, 'Storage', 'File Manager', email);
    yield fs_1.promises.mkdir(folderPath, { recursive: true });
    yield database_1.default.folder.create({
        data: { name: email, userId: user.id },
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    yield database_1.default.user.update({
        where: { id: user.id },
        data: { otpToken: otp, otpExpires },
    });
    const verificationToken = yield (0, exports.generateVerificationToken)(email);
    yield (0, email_1.sendVerificationEmail)(email, name, verificationToken.token);
});
exports.createUser = createUser;
const updateUser = (id, name, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.user.update({ where: { id }, data: { name, email, role: role } });
});
exports.updateUser = updateUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.user.delete({ where: { id } });
});
exports.deleteUser = deleteUser;
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
