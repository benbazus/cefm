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
exports.validateRefreshToken = exports.resetPassword = exports.createPasswordResetToken = exports.confirmEmail = exports.getUserProfile = exports.createUser = exports.newVerification = exports.signIn = exports.register1 = exports.register = exports.login = exports.refreshToken = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const userService_1 = require("./userService");
const email_1 = require("../utils/email");
const jwt_1 = require("../utils/jwt");
const helpers_1 = require("../utils/helpers");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const OTP_EXPIRATION_MINUTES = 10;
const SALT_ROUNDS = 10;
const refreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const accessToken = (0, jwt_1.generateAccessToken)(decoded.id);
        return accessToken;
    }
    catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
    }
});
exports.refreshToken = refreshToken;
const login = (email, password, code) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield database_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Invalid credentials');
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error('Invalid credentials');
    if (!user.emailVerified) {
        const verificationToken = yield (0, userService_1.generateVerificationToken)(user.email);
        yield (0, email_1.sendVerificationEmail)(user.email, (_a = user.name) !== null && _a !== void 0 ? _a : '', verificationToken.token);
        return { success: "Verification email sent!" };
    }
    if (user.isTwoFactorEnabled && user.email) {
        if (code) {
            const twoFactorToken = yield database_1.default.twoFactorToken.findFirst({ where: { email } });
            if (!twoFactorToken || twoFactorToken.token !== code)
                return { error: "Invalid code!" };
            if (new Date(twoFactorToken.expires) < new Date())
                return { error: "Code expired!" };
            yield database_1.default.twoFactorToken.delete({ where: { id: twoFactorToken === null || twoFactorToken === void 0 ? void 0 : twoFactorToken.id } });
        }
        else {
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
            return { twoFactor: true };
        }
    }
    yield database_1.default.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
    });
    const accessToken = yield (0, jwt_1.generateAccessToken)(user.id);
    const refreshToken = yield (0, jwt_1.generateRefreshToken)(user.id);
    return Object.assign(Object.assign({}, accessToken), { refreshToken, user: {
            id: user.id,
            name: user.name,
            email: user.email
        } });
});
exports.login = login;
// Determine storage path based on environment
const getStoragePath = (email) => {
    if (process.env.NODE_ENV === 'production') {
        return path_1.default.join('/var/www/cefmdrive/storage', email);
    }
    else {
        return path_1.default.join(__dirname, 'public', 'storage', email); // Development path
    }
};
// Register new user
const register = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already exists
    const existingUser = yield database_1.default.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error("User email already exists.");
    // Hash the password
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    // Create user in the database
    const createdUser = yield database_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    // Create folder for user files
    const folderPath = getStoragePath(email);
    yield fs_1.promises.mkdir(folderPath, { recursive: true });
    yield fs_1.promises.chmod(folderPath, 0o700);
    // Create a folder record in the database (if you have a folder model)
    yield database_1.default.folder.create({
        data: { name: email, userId: createdUser.id },
    });
    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    // Update user with OTP token and expiry
    yield database_1.default.user.update({
        where: { id: createdUser.id },
        data: { otpToken: otp, otpExpires },
    });
    // Generate and send verification token and email
    const verificationToken = yield (0, userService_1.generateVerificationToken)(email);
    yield (0, email_1.sendVerificationEmail)(email, name, verificationToken.token);
    return "Successfully registered. Verify your email!";
});
exports.register = register;
// Register new user
const register1 = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
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
    const folderPath = path_1.default.join(__dirname, 'Storage', 'File Manager', email);
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
    const verificationToken = yield (0, userService_1.generateVerificationToken)(email);
    yield (0, email_1.sendVerificationEmail)(email, name, verificationToken.token);
    return "Successfully registered. Verify your email!";
});
exports.register1 = register1;
// Register new user
const signIn = (name, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user already exists
        const existingUser = yield database_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error('User email already exists.');
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create user in the database
        const createdUser = yield database_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        // Create user folder for file storage
        const folderPath = path_1.default.join(process.cwd(), 'public', 'File Manager', email);
        yield fs_1.promises.mkdir(folderPath, { recursive: true });
        // Create root folder in the database for the user
        yield database_1.default.folder.create({
            data: {
                name: email,
                userId: createdUser.id,
            },
        });
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000); // 10-minute expiry
        // Save OTP to the user
        yield database_1.default.user.update({
            where: { id: createdUser.id },
            data: { otpToken: otp, otpExpires },
        });
        // Generate verification token
        const verificationToken = yield (0, userService_1.generateVerificationToken)(email);
        // Send verification email
        yield (0, email_1.sendVerificationEmail)(email, name, verificationToken.token);
        return 'Successfully registered. Verify your email!';
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            // Handle known Prisma errors, e.g., unique constraint violations
            throw new Error('An error occurred while interacting with the database.');
        }
        else {
            throw new Error(`Error: ${error}`);
        }
    }
});
exports.signIn = signIn;
const newVerification = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const existingToken = yield (0, userService_1.getVerificationTokenByToken)(token);
    if (!existingToken) {
        return { error: "Token does not exist!" };
    }
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return { error: "Token has expired!" };
    }
    const existingUser = yield (0, userService_1.getUserByEmail)(existingToken.email);
    if (!existingUser) {
        return { error: "User not registered!" };
    }
    yield database_1.default.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            lastActive: new Date(),
            email: existingToken.email,
        },
    });
    yield database_1.default.verificationToken.delete({
        where: { id: existingToken.id },
    });
    return "Account verified!";
});
exports.newVerification = newVerification;
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
const getUserProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(" ++++ getUserProfile +++++++  ");
    console.log(userId);
    console.log(" ++++ getUserProfile +++++++  ");
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
    if (!user) {
        throw new Error('User not found');
    }
    return user;
});
exports.getUserProfile = getUserProfile;
const confirmEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = yield (0, jwt_1.verifyRefreshToken)(token);
    if (!userId) {
        throw new Error('Invalid refresh token');
    }
    const user = yield database_1.default.user.findUnique({ where: { id: userId } });
    if (!user || user.confirmationToken !== token) {
        throw new Error('Invalid confirmation token');
    }
    yield database_1.default.user.update({
        where: { id: userId },
        data: { emailVerified: Date(), confirmationToken: null },
    });
});
exports.confirmEmail = confirmEmail;
const generateResetToken = () => __awaiter(void 0, void 0, void 0, function* () {
    return crypto_1.default.randomBytes(32).toString('hex');
});
const createPasswordResetToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }
    const resetToken = yield generateResetToken();
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
const validateRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = yield (0, jwt_1.verifyRefreshToken)(refreshToken);
    if (!userId) {
        throw new Error('Invalid refresh token');
    }
    const user = yield database_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User not found');
    }
    return userId;
});
exports.validateRefreshToken = validateRefreshToken;
