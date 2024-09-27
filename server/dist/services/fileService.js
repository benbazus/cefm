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
exports.handleChunkUpload = exports.getFileById = exports.shareFile = exports.shareLink = exports.getFileDetails = exports.moveToTrash = exports.restoreFile = exports.renameFile = exports.getSharedWithMe = exports.getWordFiles = exports.getPDFFiles = exports.getVideoFiles = exports.getPPFiles = exports.getAudioFiles = exports.getExcelFiles = exports.getPhotos = exports.getTrashed = exports.getShared = exports.getCustomDocuments = exports.getDocuments = exports.checkPassword = exports.getFiles = exports.deleteStorageHistory = exports.updateStorageHistory = exports.getStorageHistory = exports.getStorageHistories = exports.deleteFileActivities = exports.updatefileActivities = exports.getFileActivities = exports.getFilesActivities = exports.saveFileData = exports.uploadFile = void 0;
exports.deleteFile = deleteFile;
const database_1 = __importDefault(require("../config/database"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = require("fs");
const md5_1 = __importDefault(require("md5"));
const config_1 = require("../config/config");
const helpers_1 = require("../utils/helpers");
const uuid_1 = require("uuid");
const UPLOAD_DIR = path_1.default.join(__dirname, '..', '..', 'uploads');
const uploadFile = (userId, folderId, file) => __awaiter(void 0, void 0, void 0, function* () {
    const { originalname, mimetype, size } = file;
    console.log("File upload details:", { originalname, mimetype, size });
    const filePath = path_1.default.join(UPLOAD_DIR, file.filename);
    try {
        const uploadedFile = yield database_1.default.file.create({
            data: {
                name: originalname,
                mimeType: mimetype,
                size,
                filePath,
                userId,
                folderId,
            },
        });
        return uploadedFile;
    }
    catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Failed to upload file");
    }
});
exports.uploadFile = uploadFile;
const saveFileData = (originalname, folderId, mimetype, size, filePath, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedFile = yield database_1.default.file.create({
            data: {
                name: originalname,
                mimeType: mimetype,
                size,
                filePath,
                userId,
                folderId,
            },
        });
        return uploadedFile;
    }
    catch (error) {
        console.error("Error saving file data:", error);
        throw new Error("Failed to save file data");
    }
});
exports.saveFileData = saveFileData;
const getFilesActivities = (userId, folderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const whereClause = Object.assign({ userId }, folderId && { folderId });
        const userFileActivities = yield database_1.default.fileActivity.findMany({
            where: whereClause,
            include: {
                user: true,
                File: true,
                Folder: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return userFileActivities;
    }
    catch (error) {
        console.error("Error fetching file activities:", error);
        throw new Error("Failed to fetch file activities");
    }
});
exports.getFilesActivities = getFilesActivities;
const getFileActivities = (userId, fileId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileActivities = yield database_1.default.fileActivity.findMany({
            where: { fileId },
            include: { user: true },
        });
        return fileActivities;
    }
    catch (error) {
        console.error("Error fetching file activities:", error);
        throw new Error("Failed to fetch file activities");
    }
});
exports.getFileActivities = getFileActivities;
const updatefileActivities = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.fileActivity.update({
            where: { id: fileId },
            data: { action: 'download' },
        });
    }
    catch (error) {
        console.error("Error updating file activity:", error);
        throw new Error("Failed to update file activity");
    }
});
exports.updatefileActivities = updatefileActivities;
const deleteFileActivities = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.fileActivity.delete({ where: { id: fileId } });
    }
    catch (error) {
        console.error("Error deleting file activity:", error);
        throw new Error("Failed to delete file activity");
    }
});
exports.deleteFileActivities = deleteFileActivities;
const getStorageHistories = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userStorageHistories = yield database_1.default.storageHistory.findMany({
            where: { userId },
            include: { user: true },
        });
        return userStorageHistories;
    }
    catch (error) {
        console.error("Error fetching storage histories:", error);
        throw new Error("Failed to fetch storage histories");
    }
});
exports.getStorageHistories = getStorageHistories;
const getStorageHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storageHistoryForUserAndType = yield database_1.default.storageHistory.findFirst({
            where: { userId, storageType: 'file' },
        });
        return storageHistoryForUserAndType;
    }
    catch (error) {
        console.error("Error fetching storage history:", error);
        throw new Error("Failed to fetch storage history");
    }
});
exports.getStorageHistory = getStorageHistory;
const updateStorageHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.storageHistory.create({
            data: {
                userId,
                usedStorage: 100,
                totalStorage: 10, // config.totalStorage,
                storageType: 'file',
                storageLocation: 'local',
            },
        });
    }
    catch (error) {
        console.error("Error updating storage history:", error);
        throw new Error("Failed to update storage history");
    }
});
exports.updateStorageHistory = updateStorageHistory;
const deleteStorageHistory = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.storageHistory.delete({ where: { id: fileId } });
    }
    catch (error) {
        console.error("Error deleting storage history:", error);
        throw new Error("Failed to delete storage history");
    }
});
exports.deleteStorageHistory = deleteStorageHistory;
const getFiles = (userId, folderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return database_1.default.file.findMany({
            where: { userId, folderId },
        });
    }
    catch (error) {
        console.error("Error fetching files:", error);
        throw new Error("Failed to fetch files");
    }
});
exports.getFiles = getFiles;
const checkPassword = (password, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const encodedItemId = (0, helpers_1.decodeFolder)(itemId);
        const sharedFile = yield database_1.default.sharedFile.findFirst({
            where: { sharedUrl: encodedItemId },
            select: { password: true },
        });
        if (!sharedFile || !sharedFile.password) {
            throw new Error('File not found or password not set');
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, sharedFile.password);
        if (!passwordMatch) {
            throw new Error('Invalid password');
        }
        return 'Password verified successfully.';
    }
    catch (error) {
        console.error("Error checking password:", error);
        throw error;
    }
});
exports.checkPassword = checkPassword;
function deleteFile(fileId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = yield database_1.default.file.findUnique({
                where: { id: fileId },
                include: { user: true }
            });
            if (!file) {
                throw new Error('File not found');
            }
            if (file.userId !== userId) {
                throw new Error('You do not have permission to delete this file');
            }
            const filePath = path_1.default.join(process.env.FILE_STORAGE_PATH, file.filePath);
            yield fs_1.promises.unlink(filePath);
            yield database_1.default.file.delete({ where: { id: fileId } });
            yield database_1.default.fileActivity.deleteMany({ where: { fileId } });
            return 'File deleted successfully';
        }
        catch (error) {
            console.error("Error deleting file:", error);
            throw error;
        }
    });
}
const getDocuments = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: 'Adobe Portable Document Format (PDF)',
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching documents:", error);
        throw new Error("Failed to fetch documents");
    }
});
exports.getDocuments = getDocuments;
const getCustomDocuments = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const documents = yield database_1.default.document.findMany({
            where: {
                userId,
                trashed: false,
            },
        });
        return { documents };
    }
    catch (error) {
        console.error("Error fetching documents:", error);
        throw new Error("Failed to fetch documents");
    }
});
exports.getCustomDocuments = getCustomDocuments;
const getShared = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folders = yield database_1.default.folder.findMany({
            where: { userId, trashed: false, isShared: true },
        });
        const files = yield database_1.default.file.findMany({
            where: { userId, trashed: false, isShared: true },
        });
        return { folders, files };
    }
    catch (error) {
        console.error("Error fetching shared items:", error);
        throw new Error("Failed to fetch shared items");
    }
});
exports.getShared = getShared;
const getTrashed = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folders = yield database_1.default.folder.findMany({
            where: { userId, trashed: true },
        });
        const files = yield database_1.default.file.findMany({
            where: { userId, trashed: true },
        });
        const documents = yield database_1.default.document.findMany({
            where: { userId, trashed: true },
        });
        return { folders, files, documents };
    }
    catch (error) {
        console.error("Error fetching trashed items:", error);
        throw new Error("Failed to fetch trashed items");
    }
});
exports.getTrashed = getTrashed;
const getPhotos = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: { in: ['PNG Image', 'JPEG Image'] },
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching photos:", error);
        throw new Error("Failed to fetch photos");
    }
});
exports.getPhotos = getPhotos;
const getExcelFiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: 'Microsoft Excel Spreadsheet',
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching Excel files:", error);
        throw new Error("Failed to fetch Excel files");
    }
});
exports.getExcelFiles = getExcelFiles;
const getAudioFiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: 'Audio File',
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching Audio files:", error);
        throw new Error("Failed to fetch Audio files");
    }
});
exports.getAudioFiles = getAudioFiles;
const getPPFiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: 'Microsoft PowerPoint Presentation',
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching Audio files:", error);
        throw new Error("Failed to fetch Audio files");
    }
});
exports.getPPFiles = getPPFiles;
const getVideoFiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: 'Video File',
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching Video files:", error);
        throw new Error("Failed to fetch Video files");
    }
});
exports.getVideoFiles = getVideoFiles;
const getPDFFiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: 'Adobe Portable Document Format (PDF)',
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching pdf files:", error);
        throw new Error("Failed to fetch pdf files");
    }
});
exports.getPDFFiles = getPDFFiles;
const getWordFiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: 'Microsoft Word Document',
                userId,
                trashed: false,
            },
        });
        return { files };
    }
    catch (error) {
        console.error("Error fetching pdf files:", error);
        throw new Error("Failed to fetch pdf files");
    }
});
exports.getWordFiles = getWordFiles;
const getSharedWithMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return database_1.default.file.findMany({
            where: {
                userId,
                trashed: false,
                isShared: true,
            },
        });
    }
    catch (error) {
        console.error("Error fetching shared files:", error);
        throw new Error("Failed to fetch shared files");
    }
});
exports.getSharedWithMe = getSharedWithMe;
const renameFile = (fileId, userId, newName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const file = yield database_1.default.file.findUnique({
            where: { id: fileId },
            include: { folder: true }
        });
        if (!file) {
            throw new Error('File not found');
        }
        if (file.userId !== userId) {
            throw new Error('You do not have permission to rename this file');
        }
        const existingFile = yield database_1.default.file.findFirst({
            where: {
                name: newName,
                folderId: file.folderId,
                id: { not: fileId }
            }
        });
        if (existingFile) {
            throw new Error('A file with this name already exists in the folder');
        }
        const oldPath = file.filePath;
        const newPath = path_1.default.join(path_1.default.dirname(oldPath), newName);
        yield fs_1.promises.rename(oldPath, newPath);
        console.log("File renamed:", { oldPath, newPath });
        yield database_1.default.file.update({
            where: { id: fileId },
            data: {
                name: newName,
                filePath: newPath,
                fileUrl: (_a = file.fileUrl) === null || _a === void 0 ? void 0 : _a.replace(file.name, newName),
            }
        });
        yield database_1.default.fileActivity.create({
            data: {
                userId: userId,
                fileId: fileId,
                action: 'rename',
            },
        });
        return `File renamed to ${newName}`;
    }
    catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
});
exports.renameFile = renameFile;
const restoreFile = (id, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (type === 'folder') {
            const folder = yield database_1.default.folder.findUnique({ where: { id } });
            if (!folder) {
                throw new Error('Folder not found');
            }
            yield database_1.default.folder.update({
                where: { id },
                data: { trashed: false },
            });
            return "Folder restored successfully";
        }
        if (type === 'file') {
            const file = yield database_1.default.file.findUnique({ where: { id } });
            if (!file) {
                throw new Error('File not found');
            }
            yield database_1.default.file.update({
                where: { id },
                data: { trashed: false },
            });
            return "File restored successfully";
        }
        throw new Error("Invalid type specified");
    }
    catch (error) {
        console.error("Error restoring item:", error);
        throw error;
    }
});
exports.restoreFile = restoreFile;
const moveToTrash = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = yield database_1.default.file.findUnique({ where: { id } });
        const folder = yield database_1.default.folder.findUnique({ where: { id } });
        const document = yield database_1.default.document.findUnique({ where: { id } });
        if (!file && !folder && !document) {
            throw new Error('File not found');
        }
        if (folder) {
            yield database_1.default.folder.update({
                where: { id },
                data: { trashed: true },
            });
        }
        if (file) {
            yield database_1.default.file.update({
                where: { id },
                data: { trashed: true },
            });
        }
        if (document) {
            yield database_1.default.document.update({
                where: { id },
                data: { trashed: true },
            });
        }
        yield database_1.default.fileActivity.create({
            data: { action: 'moveToTrash', userId: userId, },
        });
        return 'File moved to trash successfully';
    }
    catch (error) {
        console.error("Error moving file to trash:", error);
        throw error;
    }
});
exports.moveToTrash = moveToTrash;
const getFileDetails = (itemId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const file = yield database_1.default.file.findUnique({
            where: { id: itemId },
            include: { folder: true },
        });
        if (!file) {
            throw new Error(`File with ID ${itemId} not found`);
        }
        const user = yield database_1.default.user.findUnique({
            where: { id: file.userId },
        });
        return {
            id: file.id,
            name: file.name,
            parentFolderName: ((_a = file.folder) === null || _a === void 0 ? void 0 : _a.name) || 'Root Folder',
            size: file.size,
            uploadedBy: (user === null || user === void 0 ? void 0 : user.name) || null,
            mimeType: file.mimeType,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        };
    }
    catch (error) {
        console.error("Error fetching file details:", error);
        throw error;
    }
});
exports.getFileDetails = getFileDetails;
const shareLink = (userId, itemId) => __awaiter(void 0, void 0, void 0, function* () {
    let sharedFileUrl = null;
    const existingFile = yield database_1.default.file.findUnique({ where: { id: itemId } });
    const existingFolder = yield database_1.default.folder.findUnique({ where: { id: itemId } });
    if (!existingFile && !existingFolder) {
        throw new Error("File or folder does not exist");
    }
    const shareableId = (0, uuid_1.v4)();
    if (existingFile) {
        // Share file logic
        yield database_1.default.sharedFile.create({
            data: {
                fileId: existingFile.id,
                sharedUrl: shareableId,
                shareableType: "File",
                userId,
            }
        });
        yield database_1.default.file.update({
            where: { id: existingFile.id },
            data: { isShared: true },
        });
        yield database_1.default.fileActivity.create({
            data: {
                fileId: existingFile.id,
                action: 'copied file link',
                userId,
            }
        });
        // Get the base URL from environment variables
        const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
        const encodedFileId = (0, helpers_1.encodeFolderId)(shareableId);
        sharedFileUrl = `${baseUrl}/sharedFile/${encodedFileId}`;
    }
    if (existingFolder) {
        // Share folder logic
        yield database_1.default.sharedFile.create({
            data: {
                sharedUrl: shareableId,
                shareableType: "Folder",
                folderId: existingFolder.id,
                userId,
            }
        });
        yield database_1.default.folder.update({
            where: { id: existingFolder.id },
            data: { isShared: true },
        });
        yield database_1.default.fileActivity.create({
            data: {
                folderId: existingFolder.id,
                action: 'copied folder link',
                userId,
            }
        });
        // Get the base URL from environment variables
        const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
        const encodedFolderId = (0, helpers_1.encodeFolderId)(shareableId);
        sharedFileUrl = `${baseUrl}/sharedFile/${encodedFolderId}`;
    }
    return { url: sharedFileUrl };
});
exports.shareLink = shareLink;
const shareFile = (userId, itemId, password, sharedWith, shareWithMessage, isPasswordEnabled, expirationDate, isExpirationEnabled) => __awaiter(void 0, void 0, void 0, function* () {
    let sharedFileUrl = null;
    let validExpirationDate = null;
    // Validate expirationDate if isExpirationEnabled is true
    if (isExpirationEnabled && expirationDate) {
        validExpirationDate = new Date(expirationDate);
        if (isNaN(validExpirationDate.getTime())) {
            throw new Error('Invalid expiration date format');
        }
    }
    // Check if the file or folder exists
    const existingFile = yield database_1.default.file.findUnique({ where: { id: itemId } });
    const existingFolder = yield database_1.default.folder.findUnique({ where: { id: itemId } });
    if (!existingFile && !existingFolder) {
        throw new Error("File or folder does not exist");
    }
    // Hash the password if enabled
    let hashedPassword = null;
    if (isPasswordEnabled && password) {
        hashedPassword = yield bcrypt_1.default.hash(password, 10);
    }
    const shareableId = (0, uuid_1.v4)();
    if (existingFile) {
        // Share file logic
        yield database_1.default.sharedFile.create({
            data: {
                fileId: existingFile.id,
                sharedUrl: shareableId,
                shareableType: "File",
                sharedWith,
                shareWithMessage,
                isPasswordEnabled,
                expirationDate: validExpirationDate,
                isExpirationEnabled,
                password: hashedPassword,
                userId,
            }
        });
        yield database_1.default.file.update({
            where: { id: existingFile.id },
            data: { isShared: true },
        });
        yield database_1.default.fileActivity.create({
            data: {
                fileId: existingFile.id,
                action: 'shared file',
                userId,
            }
        });
        // Get the base URL from environment variables
        const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
        const encodedFileId = (0, helpers_1.encodeFolderId)(shareableId);
        sharedFileUrl = `${baseUrl}/sharedFile/${encodedFileId}`;
    }
    if (existingFolder) {
        // Share folder logic
        yield database_1.default.sharedFile.create({
            data: {
                sharedUrl: shareableId,
                shareableType: "Folder",
                folderId: existingFolder.id,
                sharedWith,
                shareWithMessage,
                isPasswordEnabled,
                expirationDate: validExpirationDate,
                isExpirationEnabled,
                password: hashedPassword,
                userId,
            }
        });
        yield database_1.default.folder.update({
            where: { id: existingFolder.id },
            data: { isShared: true },
        });
        yield database_1.default.fileActivity.create({
            data: {
                folderId: existingFolder.id,
                action: 'shared folder',
                userId,
            }
        });
        // Get the base URL from environment variables
        const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
        const encodedFolderId = (0, helpers_1.encodeFolderId)(shareableId);
        sharedFileUrl = `${baseUrl}/sharedFile/${encodedFolderId}`;
    }
    // Return the shared file/folder URL and a success message
    return {
        url: sharedFileUrl,
        message: existingFile ? "File shared successfully" : "Folder shared successfully"
    };
});
exports.shareFile = shareFile;
const getFileById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.file.findUnique({
        where: { id },
    });
});
exports.getFileById = getFileById;
const handleChunkUpload = (name, currentChunkIndex, totalChunks, data, ip) => __awaiter(void 0, void 0, void 0, function* () {
    const firstChunk = currentChunkIndex === 0;
    const lastChunk = currentChunkIndex === totalChunks - 1;
    const ext = name.split('.').pop() || '';
    const buffer = Buffer.from(data.split(',')[1], 'base64');
    const tmpFilename = `tmp_${(0, md5_1.default)(name + ip)}.${ext}`;
    const tmpFilePath = `${config_1.config.UPLOAD_DIR}/${tmpFilename}`;
    try {
        // If it's the first chunk, check and delete any existing temporary file asynchronously
        if (firstChunk) {
            try {
                yield fs_1.promises.access(tmpFilePath); // Check if the file exists
                yield fs_1.promises.unlink(tmpFilePath); // If it exists, delete it
            }
            catch (error) {
                //if (error?.code !== 'ENOENT') {
                //    throw error; // Only throw an error if it's not a "file not found" error
                //}
            }
        }
        // Append the current chunk to the temporary file
        yield fs_1.promises.appendFile(tmpFilePath, buffer);
        // If it's the last chunk, rename the temporary file to its final name
        if (lastChunk) {
            const finalFilename = `${(0, md5_1.default)(Date.now().toString()).substr(0, 6)}.${ext}`;
            const finalFilePath = `${config_1.config.UPLOAD_DIR}/${finalFilename}`;
            yield fs_1.promises.rename(tmpFilePath, finalFilePath);
            return { finalFilename };
        }
        return 'ok';
    }
    catch (error) {
        console.error('Error handling chunk upload:', error);
        throw new Error('Failed to handle chunk upload');
    }
});
exports.handleChunkUpload = handleChunkUpload;
