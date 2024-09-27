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
exports.fetchDocumentUsers = exports.shareDocumentToUser = exports.changeFileSharePermissionToUser = exports.shareDocument = void 0;
exports.getUserInfo = getUserInfo;
const database_1 = __importDefault(require("../config/database"));
const email_1 = require("../utils/email");
const bcrypt_1 = __importDefault(require("bcrypt"));
const moment_1 = __importDefault(require("moment"));
const helpers_1 = require("../utils/helpers");
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
function getUserInfo(req) {
    const parser = new ua_parser_js_1.default(req.headers['user-agent']);
    const result = parser.getResult();
    return {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        operatingSystem: result.os.name || 'Unknown',
        browser: result.browser.name || 'Unknown',
        deviceType: result.device.type || 'unknown',
        deviceModel: result.device.model || 'unknown',
        deviceVendor: result.device.vendor || 'unknown',
        os: result.os.name || 'unknown',
    };
}
const shareDocument = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { documentId, email, message, date, permission, currentUrl, isPasswordEnabled } = req.body;
    try {
        let password;
        let hashedPassword;
        const user = yield database_1.default.user.findUnique({ where: { id: userId } });
        const document = yield database_1.default.document.findUnique({ where: { id: documentId } });
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        if (isPasswordEnabled) {
            password = (0, helpers_1.generateRandomPassword)(10);
            hashedPassword = yield bcrypt_1.default.hash(password, 10);
        }
        yield database_1.default.document.update({
            where: { id: documentId },
            data: {
                password: hashedPassword,
            },
        });
        yield database_1.default.userPermission.create({
            data: {
                userId: userId,
                documentId: documentId,
                permission: permission,
            },
        });
        // Log the file activity
        yield database_1.default.fileActivity.create({
            data: {
                userId: userId,
                documentId: documentId,
                activityType: "Document",
                action: `Shared document with ${email}`,
            },
        });
        yield (0, email_1.sendShareDocumentEmail)(user === null || user === void 0 ? void 0 : user.email, email, message, document.title, password, date, permission, currentUrl);
        return res.json({ success: true, message: "Document shared successfully!" });
    }
    catch (error) {
        console.error("Error sharing document:", error);
        res.status(500).json({ error: "Failed to share document" });
        next(error);
    }
});
exports.shareDocument = shareDocument;
const changeFileSharePermissionToUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { documentId, permission } = req.body;
        const user = yield database_1.default.user.findUnique({ where: { id: userId } });
        const document = yield database_1.default.document.findUnique({ where: { id: documentId } });
        const userPermission = yield database_1.default.userPermission.findFirst({ where: { documentId: documentId } });
        if (userPermission) {
            yield database_1.default.userPermission.update({
                where: { id: userPermission === null || userPermission === void 0 ? void 0 : userPermission.id },
                data: {
                    userId: user === null || user === void 0 ? void 0 : user.id,
                    documentId: document === null || document === void 0 ? void 0 : document.id,
                    permission: permission,
                    documentAccess: userPermission.documentAccess,
                },
            });
        }
        const documentUser = yield database_1.default.documentUser.findFirst({ where: { userId, documentId } });
        yield database_1.default.documentUser.update({
            where: { id: documentUser === null || documentUser === void 0 ? void 0 : documentUser.id, },
            data: {
                permission: permission,
                documentAccess: userPermission === null || userPermission === void 0 ? void 0 : userPermission.documentAccess,
            },
        });
        yield database_1.default.fileActivity.create({
            data: {
                userId: userId,
                documentId: documentUser === null || documentUser === void 0 ? void 0 : documentUser.id,
                action: `Updated permission to ${permission} for document`,
            },
        });
        res.status(200).json({ message: 'Permission updated successfully' });
    }
    catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ error: 'Failed to update permission' });
        next(error);
    }
});
exports.changeFileSharePermissionToUser = changeFileSharePermissionToUser;
const shareDocumentToUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, message, documentId, permission, currentUrl, documentAccess } = req.body;
        const { userId } = req.user;
        console.log(' ++++++++shareDocumentToUser 0000000 +++++++++++++++ ');
        console.log(documentId);
        console.log(email);
        console.log(message);
        console.log(permission);
        console.log(currentUrl);
        console.log(documentAccess);
        console.log(' ++++++++shareDocumentToUser 0000000 +++++++++++++++ ');
        const document = yield database_1.default.document.findUnique({ where: { id: documentId } });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        // Check if the user exists, if not create a new user
        let user = yield database_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = yield database_1.default.user.create({
                data: {
                    email,
                    name: email.split('@')[0], // Use the part before @ as the name
                },
            });
        }
        const documentUser = yield database_1.default.documentUser.create({
            data: {
                userId,
                documentId: document.id,
                permission: permission,
                documentAccess: documentAccess,
            },
        });
        // Create UserPermission
        yield database_1.default.userPermission.create({
            data: {
                userId: user.id,
                documentId: document.id,
                permission: permission,
                documentAccess: documentAccess,
            },
        });
        // Create SharedFile
        yield database_1.default.sharedFile.create({
            data: {
                userId: user.id,
                sharedUrl: currentUrl,
                documentUserId: documentUser.id,
                shareableType: 'Document',
                sharedWith: email,
                shareWithMessage: message,
            },
        });
        // Log the file activity
        yield database_1.default.fileActivity.create({
            data: {
                userId: user.id,
                documentId: documentUser.id,
                activityType: "Document",
                action: `Shared document with ${email}`,
            },
        });
        yield (0, email_1.sendDocumentShareEmail)(user.name, user.email, email, message, currentUrl, permission, document.title);
        res.status(200).json({ message: 'Document shared successfully' });
    }
    catch (error) {
        console.error('Error sharing document:', error);
        res.status(500).json({ error: 'Failed to share document' });
        next(error);
    }
});
exports.shareDocumentToUser = shareDocumentToUser;
const fetchDocumentUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { documentId } = req.params;
        const documentUsers = yield database_1.default.documentUser.findMany({
            where: { documentId: documentId, userId: userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        const users = documentUsers.map((du) => ({
            id: du.user.id,
            name: du.user.name,
            email: du.user.email,
            permission: du.permission,
            sharedDate: du.createdAt ? (0, moment_1.default)(du.createdAt).format('DD MMM YYYY HH:mm:ss') : null,
        }));
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching document users:', error);
        res.status(500).json({ error: 'Failed to fetch document users' });
        next(error);
    }
});
exports.fetchDocumentUsers = fetchDocumentUsers;
