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
exports.invalidateRefreshToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generatePasswordResetToken = exports.generateTokens = void 0;
;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const resetTokenSchema = zod_1.z.object({
    token: zod_1.z.string().optional(),
    userId: zod_1.z.string().uuid(),
});
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '30m';
const REFRESH_TOKEN_EXPIRY = '7d';
const RESET_TOKEN_EXPIRY = '7d';
const generateTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    yield database_1.default.refreshToken.create({
        data: {
            token: refreshToken,
            userId: userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });
    return { accessToken, refreshToken };
});
exports.generateTokens = generateTokens;
const generateResetToken = () => __awaiter(void 0, void 0, void 0, function* () {
    return crypto_1.default.randomBytes(32).toString('hex');
});
const generatePasswordResetToken = (token, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const { error } = resetTokenSchema.safeParse({ token, userId });
        if (error) {
            throw new Error('Invalid input');
        }
        // Generate secure reset token
        const resetToken = yield generateResetToken();
        // Validate user ID existence before updating
        const user = yield database_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        // Update user with reset token
        yield database_1.default.user.update({
            where: { id: userId },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: new Date(Date.now() + parseInt(RESET_TOKEN_EXPIRY, 10) * 1000),
            },
        });
        return { resetToken };
    }
    catch (error) {
        console.error('Error generating reset token:', error);
        return null;
    }
});
exports.generatePasswordResetToken = generatePasswordResetToken;
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
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
        const storedToken = yield database_1.default.refreshToken.findFirst({
            where: { token, userId: decoded.userId, expiresAt: { gt: new Date() } },
        });
        if (!storedToken)
            return null;
        return decoded.userId;
    }
    catch (error) {
        return null;
    }
});
exports.verifyRefreshToken = verifyRefreshToken;
const invalidateRefreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.refreshToken.delete({ where: { token } });
});
exports.invalidateRefreshToken = invalidateRefreshToken;
