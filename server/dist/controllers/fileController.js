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
exports.shareFile = exports.copyLink = exports.sharedFile = exports.shareLink = exports.moveToTrash = exports.unlockFile = exports.lockFile = exports.getFileDetails = exports.renameFile = exports.getSharedWithMe = exports.getExcelFiles = exports.getPhotos = exports.getWord = exports.getAudio = exports.getVideo = exports.getPdf = exports.getTrashed = exports.getShared = exports.getCustomDocuments = exports.getDocuments = exports.deleteFile = exports.getFiles = exports.copyFile = exports.previewFile = exports.restoreFile = exports.deletePermanently = exports.downloadFolders = exports.downloadFolder = exports.createDocument = exports.downloadFile = exports.downloadFiles = exports.versionsFile = exports.versionRestoreFile = exports.uploadFile = exports.uploadFiles = exports.uploadFolder = exports.checkPassword = exports.moveFile = exports.moveFileItem = exports.fileUpload = exports.handleFileUpload = void 0;
exports.getUserInfo = getUserInfo;
const fileService = __importStar(require("./../services/fileService"));
const folderService = __importStar(require("../services/folderService"));
const userService = __importStar(require("../services/userService"));
const database_1 = __importDefault(require("../config/database"));
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
const busboy_1 = __importDefault(require("busboy"));
const config_1 = require("../config/config");
const zipFolder_1 = require("./../utils/zipFolder");
const email_1 = require("../utils/email");
const helpers_1 = require("../utils/helpers");
const logger_1 = __importDefault(require("../utils/logger"));
const fileService_1 = require("./../services/fileService");
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const mime_types_1 = __importDefault(require("mime-types"));
const sharp_1 = __importDefault(require("sharp"));
const pdf2pic_1 = require("pdf2pic");
const fs_extra_1 = __importDefault(require("fs-extra"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const stream_1 = require("stream");
function getUserInfo(req) {
    const parser = new ua_parser_js_1.default(req.headers["user-agent"]);
    const result = parser.getResult();
    return {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"] || "",
        operatingSystem: result.os.name || "Unknown",
        browser: result.browser.name || "Unknown",
        deviceType: result.device.type || "unknown",
        deviceModel: result.device.model || "unknown",
        deviceVendor: result.device.vendor || "unknown",
        os: result.os.name || "unknown",
        //browser: result.browser.name || 'unknown'
    };
}
const handleFileUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const parentId = req.body.parentId;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        const uploadedFiles = files.map((file) => {
            const filePath = file.path
                .replace(config_1.config.uploadDir, "")
                .replace(/\\/g, "/");
            const dirPath = path_1.default.dirname(filePath);
            // Create directories if they don't exist
            if (dirPath !== "/") {
                fs_extra_1.default.mkdirSync(path_1.default.join(config_1.config.uploadDir, dirPath), { recursive: true });
            }
            return {
                originalName: file.originalname,
                fileName: file.filename,
                path: filePath,
                size: file.size,
                mimeType: file.mimetype,
                parentId: parentId,
            };
        });
        res.status(200).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    }
    catch (error) {
        console.error("Error in file upload:", error);
        res.status(500).json({
            message: "Error uploading files",
            error: error.message,
        });
    }
});
exports.handleFileUpload = handleFileUpload;
const fileUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bb = (0, busboy_1.default)({ headers: req.headers });
    const uploadPromises = [];
    const { userId } = req.user;
    const files = req.files;
    let folderId = null;
    let baseFolderPath = "";
    let fileRelativePath = "";
    bb.on("field", (name, val) => {
        if (name === "folderId") {
            folderId = val;
        }
        if (name === "relativePath") {
            fileRelativePath = val;
        }
    });
    try {
        bb.on("file", (name, file, info) => __awaiter(void 0, void 0, void 0, function* () {
            const { filename, mimeType } = info;
            const relativePath = fileRelativePath ? fileRelativePath.split("/") : [];
            relativePath.pop();
            if (folderId) {
                const folderResponse = yield folderService.getFolderById(folderId);
                if (folderResponse) {
                    baseFolderPath = folderResponse.folderPath;
                }
            }
            const user = (yield userService.getUserById(userId));
            if (!baseFolderPath) {
                baseFolderPath = path_1.default.join(process.cwd(), "public", "File Manager", user === null || user === void 0 ? void 0 : user.email);
            }
            const fullPath = path_1.default.join(baseFolderPath, ...relativePath, filename);
            const fileUrl = `${process.env.PUBLIC_APP_URL}/File Manager/${encodeURIComponent(userId)}/${encodeURIComponent(filename)}`;
            const writeStream = fs_extra_1.default.createWriteStream(fullPath);
            file.pipe(writeStream);
            const uploadPromise = new Promise((resolve, reject) => {
                writeStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        const stats = yield fs_extra_1.default.promises.stat(fullPath);
                        const fileData = yield database_1.default.file.create({
                            data: {
                                name: filename,
                                filePath: fullPath,
                                fileUrl: fileUrl,
                                mimeType: mimeType,
                                size: stats.size,
                                userId: userId,
                                folderId: folderId,
                            },
                        });
                        resolve(fileData);
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
                writeStream.on("error", (error) => {
                    reject(error);
                });
            });
            uploadPromises.push(uploadPromise);
        }));
        bb.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const results = yield Promise.all(uploadPromises);
                res.json({ message: "Files uploaded successfully", files: results });
            }
            catch (error) {
                console.error("Error uploading files:", error);
                res.status(500).json({ error: "Error uploading files" });
            }
        }));
        req.pipe(bb);
    }
    catch (error) {
        next(error);
    }
});
exports.fileUpload = fileUpload;
const moveFileItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { fileId } = req.params;
        const { newFolderId } = req.body;
        // Fetch the file and ensure it belongs to the user
        const file = yield database_1.default.file.findFirst({
            where: { id: fileId, userId: userId },
        });
        if (!file) {
            return res.status(404).json({
                error: "File not found or you do not have permission to move this file.",
            });
        }
        // Fetch the new folder and ensure it belongs to the user
        const newFolder = yield database_1.default.folder.findFirst({
            where: { id: newFolderId, userId: userId },
        });
        if (!newFolder) {
            return res.status(404).json({
                error: "Destination folder not found or you do not have permission to access it.",
            });
        }
        // Construct the new file path
        const oldPath = file.filePath;
        const newPath = path_1.default.join(newFolder.folderPath, path_1.default.basename(oldPath));
        // Move the file on the file system
        yield fs_extra_1.default.move(oldPath, newPath);
        // Construct the new fileUrl
        const user = yield database_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const newFileUrl = `${process.env.PUBLIC_APP_URL}/cefmdrive/storage/${encodeURIComponent(user.email)}/${encodeURIComponent(path_1.default.relative(newFolder.folderPath, newPath))}`;
        // Update the file record in the database
        const updatedFile = yield database_1.default.file.update({
            where: { id: fileId },
            data: {
                filePath: newPath,
                folderId: newFolderId,
                fileUrl: newFileUrl,
            },
        });
        // Log file activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                fileId: updatedFile.id,
                activityType: "File",
                action: "MOVE FILE",
                filePath: updatedFile.filePath,
                fileSize: updatedFile.size,
                fileType: updatedFile.fileType,
            },
        });
        res.json({ message: "File moved successfully", file: updatedFile });
    }
    catch (error) {
        console.error("Error moving file:", error);
        next(error);
    }
});
exports.moveFileItem = moveFileItem;
const moveFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { newParentId } = req.body;
    try {
        const user = yield database_1.default.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const file = yield database_1.default.file.update({
            where: { id: req.params.id, userId: req.user.id },
            data: { folderId: newParentId },
        });
        if (!file) {
            res.status(404).json({ error: "File not found" });
            return;
        }
        // Log file activity
        yield database_1.default.fileActivity.create({
            data: {
                userId: user.id,
                fileId: file.id,
                activityType: "File",
                action: "MOVE FILE",
                filePath: file.filePath,
                fileSize: file.size,
                fileType: file.fileType,
            },
        });
        res.json(file);
    }
    catch (error) {
        next(error);
    }
});
exports.moveFile = moveFile;
const checkPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, fileId } = req.body;
        if (!password || !fileId) {
            return res.status(400).json("Missing required password or fileId");
        }
        const uploadedFile = yield fileService.checkPassword(password, fileId);
        res.status(201).json(uploadedFile);
    }
    catch (error) {
        next(error);
    }
});
exports.checkPassword = checkPassword;
const uploadFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { parentFolderId } = req.body;
        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ message: "No folder uploaded" });
        }
        const uploadedFolder = yield folderService.createFolder(userId, parentFolderId, req.body.folderName);
        for (const [path, fileArray] of Object.entries(files)) {
            const file = fileArray[0];
            const pathParts = path.split("/");
            pathParts.pop();
            let currentFolderId = uploadedFolder.id;
            for (const folderName of pathParts) {
                const folder = yield folderService.findOrCreateFolder(userId, currentFolderId, folderName);
                currentFolderId = folder.id;
            }
            yield fileService.uploadFile(userId, currentFolderId, file);
        }
        res.status(201).json(uploadedFolder);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadFolder = uploadFolder;
const uploadFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { folderId } = req.body;
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        const uploadedFiles = [];
        for (const file of files) {
            const uploadedFile = yield fileService.uploadFile(userId, folderId, file);
            uploadedFiles.push(uploadedFile);
        }
        res.status(201).json(uploadedFiles);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadFiles = uploadFiles;
const getBaseFolderPath = (email) => {
    return process.env.NODE_ENV === "production"
        ? path_1.default.join("/var/www/cefmdrive/storage", email)
        : path_1.default.join(process.cwd(), "public", "File Manager", email);
};
const uploadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bb = (0, busboy_1.default)({ headers: req.headers });
        const uploadPromises = [];
        const { userId } = req.user;
        const userInfo = getUserInfo(req);
        const { ipAddress, userAgent, deviceType: device, operatingSystem, browser, } = userInfo;
        let folderId = null;
        let baseFolderPath = "";
        let fileRelativePath = "";
        bb.on("field", (name, val) => {
            if (name === "folderId") {
                folderId = val;
            }
            if (name === "relativePath") {
                fileRelativePath = val;
            }
        });
        bb.on("file", (name, fileStream, info) => __awaiter(void 0, void 0, void 0, function* () {
            const { filename, mimeType } = info;
            const relativePath = fileRelativePath ? fileRelativePath.split("/") : [];
            relativePath.pop();
            // Get folder path from the database
            if (folderId) {
                const folderResponse = yield folderService.getFolderById(folderId);
                if (folderResponse) {
                    baseFolderPath = folderResponse.folderPath;
                }
            }
            const user = yield database_1.default.user.findUnique({ where: { id: userId } });
            // If folder path is still empty, set default base path
            if (!baseFolderPath) {
                baseFolderPath = getBaseFolderPath(user === null || user === void 0 ? void 0 : user.email);
            }
            console.log(` ++++++++++++++++++++++++++++++ `);
            console.log(baseFolderPath);
            console.log(` ++++++++++++++++++++++++++++++ `);
            const fullPath = path_1.default.join(baseFolderPath, ...relativePath, filename);
            const fileUrl = `${process.env.PUBLIC_APP_URL}/cefmdrive/storage/${encodeURIComponent(user === null || user === void 0 ? void 0 : user.email)}/${encodeURIComponent(filename)}`;
            const writeStream = fs_extra_1.default.createWriteStream(fullPath);
            fileStream.pipe(writeStream);
            uploadPromises.push(new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
                writeStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        const stats = yield fs_extra_1.default.promises.stat(fullPath);
                        // Check storage usage before saving the file
                        const currentStorage = yield database_1.default.storageHistory.findFirst({
                            where: { userId: userId },
                            orderBy: { createdAt: "desc" },
                        });
                        const newUsedStorage = ((currentStorage === null || currentStorage === void 0 ? void 0 : currentStorage.usedStorage) || 0) + stats.size;
                        const maxStorageSize = (user === null || user === void 0 ? void 0 : user.maxStorageSize) || 0;
                        if (newUsedStorage > maxStorageSize) {
                            fs_extra_1.default.unlinkSync(fullPath);
                            return reject(new Error("Storage limit exceeded. File not saved."));
                        }
                        // Determine file type based on extension or mime type
                        const extension = path_1.default.extname(filename).toLowerCase();
                        const mimeTypes = {
                            ".pdf": "Adobe Portable Document Format (PDF)",
                            ".xlsx": "Microsoft Excel Spreadsheet (XLSX)",
                            ".xls": "Microsoft Excel Spreadsheet (XLS)",
                            ".png": "PNG Image",
                            ".jpg": "JPEG Image",
                            ".jpeg": "JPEG Image",
                            ".doc": "Microsoft Word Document",
                            ".docx": "Microsoft Word Document",
                            ".ppt": "Microsoft PowerPoint Presentation",
                            ".pptx": "Microsoft PowerPoint Presentation",
                            ".txt": "Plain Text File",
                            ".zip": "ZIP Archive",
                            ".mp4": "Video File",
                            ".mov": "Video File",
                            ".avi": "Video File",
                            ".mkv": "Video File",
                            ".webm": "Video File",
                            ".mp3": "Audio File",
                            ".wav": "Audio File",
                            ".aac": "Audio File",
                            ".flac": "Audio File",
                            ".ogg": "Audio File",
                            ".m4a": "Audio File",
                        };
                        const fileType = mimeTypes[extension] || mimeType;
                        if (!folderId) {
                            const folder = yield database_1.default.folder.findFirst({
                                where: { name: user === null || user === void 0 ? void 0 : user.email },
                            });
                            folderId = (folder === null || folder === void 0 ? void 0 : folder.id) || null;
                        }
                        const fileData = yield database_1.default.file.create({
                            data: {
                                name: filename,
                                filePath: fullPath,
                                fileUrl: fileUrl,
                                mimeType: mimeType,
                                size: stats.size,
                                userId: userId,
                                folderId: folderId,
                                fileType: fileType,
                            },
                        });
                        // Log file activity
                        yield database_1.default.fileActivity.create({
                            data: {
                                userId,
                                fileId: fileData.id,
                                activityType: "File",
                                action: "CREATE FILE",
                                ipAddress,
                                userAgent,
                                device,
                                operatingSystem,
                                browser,
                                filePath: fullPath,
                                fileSize: stats.size,
                                fileType: fileType,
                            },
                        });
                        // Update storage history
                        const totalStorage = (user === null || user === void 0 ? void 0 : user.maxStorageSize) || 0;
                        const storageUsagePercentage = (newUsedStorage / Math.max(totalStorage, 1)) * 100;
                        const overflowStorage = Math.max(0, newUsedStorage - totalStorage);
                        yield database_1.default.storageHistory.create({
                            data: {
                                userId: userId,
                                usedStorage: newUsedStorage,
                                totalStorage: totalStorage,
                                storageType: "file",
                                storageLocation: baseFolderPath,
                                storageUsagePercentage: Math.min(storageUsagePercentage, 100),
                                storageLimit: totalStorage,
                                overflowStorage: overflowStorage,
                                notificationSent: storageUsagePercentage > 90,
                            },
                        });
                        // Handle file versioning
                        const latestVersion = yield database_1.default.fileVersion.findFirst({
                            where: { fileId: fileData.id },
                            orderBy: { versionNumber: "desc" },
                        });
                        const newVersionNumber = ((latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.versionNumber) || 0) + 1;
                        yield database_1.default.fileVersion.create({
                            data: {
                                userId: userId,
                                fileId: fileData.id,
                                versionNumber: newVersionNumber,
                                url: fileUrl,
                                folderId: folderId,
                            },
                        });
                        resolve(fileData);
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
                writeStream.on("error", (error) => {
                    reject(error);
                });
            })));
        }));
        bb.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const results = yield Promise.all(uploadPromises);
                res.json({ message: "Files uploaded successfully", files: results });
            }
            catch (error) {
                if (error.message === "Storage limit exceeded. File not saved.") {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Error uploading files" });
                }
            }
        }));
        req.pipe(bb);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadFile = uploadFile;
const versionRestoreFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const version = yield database_1.default.fileVersion.findUnique({
            where: { id: req.params.versionId, file: { userId: req.user.id } },
        });
        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }
        const file = yield database_1.default.file.update({
            where: { id: req.params.id, userId: req.user.id },
            data: { fileUrl: version.url },
        });
        res.json(file);
    }
    catch (error) {
        res.status(500).json({ error: "Error restoring file version" });
    }
});
exports.versionRestoreFile = versionRestoreFile;
const versionsFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const versions = yield database_1.default.fileVersion.findMany({
            where: { fileId: req.params.id, file: { userId: req.user.id } },
            orderBy: { createdAt: "desc" },
        });
        res.json(versions);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching file versions" });
        next(error);
    }
});
exports.versionsFile = versionsFile;
const downloadFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info("Starting file download process", {
            fileId: req.params.itemId,
        });
        const fileId = req.params.itemId;
        // Fetch the file from the database
        const file = yield database_1.default.file.findUnique({
            where: { id: fileId },
        });
        if (!file) {
            logger_1.default.error("File not found in the database", { fileId });
            return res.status(404).json({ message: "File not found." });
        }
        const filePath = path_1.default.join(file.filePath);
        // Check if file exists on the server
        if (!fs_extra_1.default.existsSync(filePath)) {
            logger_1.default.error("File not found on the server", { filePath });
            return res.status(404).json({ message: "File not found on the server." });
        }
        // // Log the file download action in fileActivity
        // await prisma.fileActivity.create({
        //     data: {
        //         userId: 'userId', // Replace this with dynamic userId from your auth system
        //         fileId: fileId,
        //         action: 'download file',
        //     },
        // });
        logger_1.default.info("File download action logged", { fileId });
        // Read the file stream
        const fileStream = fs_extra_1.default.createReadStream(filePath);
        // Set appropriate headers
        const contentDisposition = file.mimeType.startsWith("image/")
            ? "inline"
            : "attachment";
        res.setHeader("Content-Disposition", `${contentDisposition}; filename="${encodeURIComponent(file.name)}"`);
        res.setHeader("Content-Type", file.mimeType);
        // Pipe the file stream to the response
        fileStream.pipe(res);
        fileStream.on("end", () => {
            logger_1.default.info("File download successful", { fileId });
        });
        fileStream.on("error", (err) => {
            logger_1.default.error("Error while downloading file", {
                fileId,
                error: err.message,
            });
            next(err);
        });
    }
    catch (error) {
        logger_1.default.error("Error in downloadFiles function", {
            error: error.message,
        });
        next(error);
    }
});
exports.downloadFiles = downloadFiles;
const downloadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileId = req.params.itemId;
    try {
        const file = yield (0, fileService_1.getFileById)(fileId);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        const filePath = file.filePath;
        if (!fs_extra_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found on the server" });
        }
        // Determine the MIME type
        const mimeType = mime_types_1.default.lookup(filePath) || "application/octet-stream";
        // Get the file name and encode it for the Content-Disposition header
        const fileName = encodeURIComponent(path_1.default.basename(filePath));
        // Set the appropriate headers
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${fileName}`);
        // Stream the file
        const fileStream = fs_extra_1.default.createReadStream(filePath);
        fileStream.on("error", (error) => {
            console.error("Error streaming file:", error);
            res.status(500).json({ error: "Error streaming file" });
        });
        fileStream.pipe(res);
    }
    catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.downloadFile = downloadFile;
const createDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileId = req.params.itemId;
    try {
        res.status(201).json("Document created successfully!!!!!!");
    }
    catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.createDocument = createDocument;
const downloadFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const folderId = req.params.itemId;
    try {
        const folder = yield folderService.getFolderById(folderId);
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        const folderPath = folder.folderPath;
        if (!fs_extra_1.default.existsSync(folderPath)) {
            logger_1.default.error(`Folder does not exist on the server, ${folderPath}`);
            return res
                .status(500)
                .json({ error: "Folder does not exist on the file system" });
        }
        const zipStream = yield (0, zipFolder_1.zipFolder)(folderPath);
        zipStream.pipe(res);
    }
    catch (error) {
        console.error("Error downloading folder:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.downloadFolder = downloadFolder;
const downloadFolders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const folderId = req.params.itemId;
    logger_1.default.info("Request to download folder", { folderId });
    try {
        // Fetch folder data from the database
        const folder = yield database_1.default.folder.findUnique({
            where: { id: folderId },
        });
        if (!folder) {
            logger_1.default.error("Folder not found in the database", { folderId });
            return res.status(404).json({ message: "Folder not found" });
        }
        // Define the folder path based on folderPath stored in the database
        const folderPath = path_1.default.join(folder.folderPath);
        logger_1.default.info("Folder path resolved", { folderId, folderPath });
        // Check if the folder exists on the file system
        if (!fs_extra_1.default.existsSync(folderPath)) {
            logger_1.default.error("Folder does not exist on the server", { folderPath });
            return res
                .status(404)
                .json({ message: "Folder does not exist on the server" });
        }
        // Create a zip file
        const zipFileName = `${folder.name}.zip`;
        const zipFilePath = path_1.default.join(process.cwd(), zipFileName);
        // const zipFilePath = path.join(folderPath, zipFileName);
        const output = fs_extra_1.default.createWriteStream(zipFilePath);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        output.on("close", () => {
            logger_1.default.info(`Zipped ${archive.pointer()} total bytes.`, {
                zipFileName,
                folderId,
            });
        });
        archive.on("error", (err) => {
            logger_1.default.error("Error occurred while zipping folder", {
                error: err.message,
            });
            throw err;
        });
        // Pipe the zip stream to the output file
        archive.pipe(output);
        // Append the folder and its subfolders/files to the archive
        archive.directory(folderPath, false);
        // Finalize the archive to finish the zip creation
        yield archive.finalize();
        // Wait until the zip file is ready before streaming it to the client
        output.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.default.info("ZIP file creation completed", { zipFilePath });
            // Set response headers for downloading the zip file
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
            // Stream the zip file to the client
            const zipFileStream = fs_extra_1.default.createReadStream(zipFilePath);
            zipFileStream.pipe(res);
            // Cleanup the zip file after download
            zipFileStream.on("end", () => {
                logger_1.default.info("ZIP file streamed to client, deleting file", {
                    zipFilePath,
                });
                fs_extra_1.default.unlinkSync(zipFilePath); // Delete the zip file from the server after streaming
            });
            // try {
            //     // Log the file download action in fileActivity
            //     await prisma.fileActivity.create({
            //         data: {
            //             userId: req.userId, // Make sure userId is dynamically passed from authentication
            //             fileId: folderId,
            //             action: 'download folder',
            //         },
            //     });
            // } catch (activityError) {
            //     logger.error('Error logging file activity', { error: activityError });
            // }
        }));
    }
    catch (error) {
        logger_1.default.error("An error occurred while downloading the folder", {
            error: error.message,
        });
        next(error);
    }
});
exports.downloadFolders = downloadFolders;
const deletePermanently = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { fileType, fileId } = req.params;
    try {
        const document = yield database_1.default.document.findUnique({
            where: { id: fileId },
        });
        if (document) {
            if (!document) {
                return res
                    .status(404)
                    .json({ error: `File with ID ${fileId} not found.` });
            }
            yield database_1.default.document.delete({
                where: { id: fileId },
            });
            return res
                .status(404)
                .json({ success: `File with ID ${fileId} deleted permanently.` });
        }
        if (fileType === "Folder") {
            // console.log(' +++++++++++++++type FOLDER+++++++++++++++++++++++ ')
            //  console.log({ id, type })
            // console.log(' +++++++++++++++++type+++++++++++++++++++++ ')
            const folder = yield database_1.default.folder.findUnique({
                where: { id: fileId },
            });
            if (!folder) {
                return res
                    .status(404)
                    .json({ error: `Folder with ID ${fileId} not found.` });
            }
            // Define folder path
            const folderPath = path_1.default.join(folder.folderPath);
            // Delete folder from the file system
            yield fs_extra_1.default.rm(folderPath, { recursive: true, force: true });
            // Delete folder from database
            yield database_1.default.folder.delete({ where: { id: fileId } });
            return res
                .status(201)
                .json({ success: `Folder with ID ${fileId} deleted permanently.` });
        }
        if (fileType === "File") {
            const file = yield database_1.default.file.findUnique({ where: { id: fileId } });
            if (!file) {
                return res
                    .status(404)
                    .json({ error: `File with ID ${fileId} not found.` });
            }
            // Define file path
            const filePath = path_1.default.join(file.filePath);
            // Delete all related FileVersion records
            yield database_1.default.fileVersion.deleteMany({
                where: { fileId: fileId },
            });
            // Delete file from the file system
            yield fs_extra_1.default.unlink(filePath);
            // Delete file from database
            yield database_1.default.file.delete({
                where: { id: fileId },
            });
            return res
                .status(200)
                .json({ success: `File with ID ${fileId} deleted permanently.` });
        }
    }
    catch (error) {
        logger_1.default.error("An error occurred while deleting the file", { error });
        next(error);
    }
});
exports.deletePermanently = deletePermanently;
const restoreFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileId } = req.params;
    const { userId } = req.user;
    try {
        const file = yield database_1.default.file.findUnique({
            where: { id: fileId, userId: userId },
        });
        if (!file) {
            return res
                .status(404)
                .json({ error: `File with ID ${fileId} not found.` });
        }
        if (!file.trashed) {
            return res
                .status(400)
                .json({ error: `File with ID ${fileId} is not in trash.` });
        }
        const updatedFile = yield database_1.default.file.update({
            where: { id: fileId },
            data: { trashed: false },
        });
        // Log file activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                fileId: updatedFile.id,
                activityType: "File",
                action: "RESTORE FILE",
                filePath: updatedFile.filePath,
                fileSize: updatedFile.size,
                fileType: updatedFile.fileType,
            },
        });
        return res.status(200).json({
            success: `File with ID ${fileId} restored`,
            file: updatedFile,
        });
    }
    catch (error) {
        console.error(`Error restoring file with ID ${fileId}:`, error);
        return next(new Error(`Failed to restore file with ID ${fileId}.`));
    }
});
exports.restoreFile = restoreFile;
const generatePreview = (filePath, mimeType, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const previewDir = path_1.default.join(process.cwd(), "public", "File Manager", email, "previews");
        // Ensure the preview directory exists using async methods
        yield fs_extra_1.default.mkdir(previewDir, { recursive: true });
        const previewFileName = `${path_1.default.basename(filePath, path_1.default.extname(filePath))}_preview.png`;
        const previewPath = path_1.default.join(previewDir, previewFileName);
        if (mimeType.startsWith("image/")) {
            // Handle image preview generation using async/await
            yield (0, sharp_1.default)(filePath)
                .resize({ width: 200, height: 200, fit: "inside" })
                .toFile(previewPath);
        }
        else if (mimeType === "application/pdf") {
            // Handle PDF preview generation
            const options = {
                density: 100,
                saveFilename: path_1.default.basename(filePath, path_1.default.extname(filePath)),
                savePath: previewDir,
                format: "png",
                width: 200,
                height: 200,
            };
            const pdfConverter = (0, pdf2pic_1.fromPath)(filePath, options);
            yield pdfConverter(1); // Convert first page to image
            // Handle the generated PDF image file
            const generatedFileName = `${options.saveFilename}.1.png`;
            const generatedFilePath = path_1.default.join(previewDir, generatedFileName);
            // Rename the generated PDF preview to match our naming convention
            yield fs_extra_1.default.rename(generatedFilePath, previewPath);
        }
        else {
            // Return null for unsupported file types
            return null;
        }
        // Return the path to the generated preview image
        return `/previews/${previewFileName}`;
    }
    catch (error) {
        console.error("Error generating preview:", error);
        return null;
    }
});
const generatePreview4 = (filePath, mimeType, email) => __awaiter(void 0, void 0, void 0, function* () {
    const previewDir = path_1.default.join(process.cwd(), "public", "File Manager", email, "previews");
    if (!fs_extra_1.default.existsSync(previewDir)) {
        fs_extra_1.default.mkdirSync(previewDir, { recursive: true });
    }
    const previewFileName = `${path_1.default.basename(filePath, path_1.default.extname(filePath))}_preview.png`;
    const previewPath = path_1.default.join(previewDir, previewFileName);
    try {
        if (mimeType.startsWith("image/")) {
            // Create a readable stream from the original file and a writable stream to the preview file
            const readStream = (0, fs_1.createReadStream)(filePath);
            const writeStream = (0, fs_1.createWriteStream)(previewPath);
            // Pipe the original image to the preview image
            yield (0, util_1.promisify)(stream_1.pipeline)(readStream, writeStream);
        }
        else if (mimeType === "application/pdf") {
            // For PDF files, directly copy the first page as the preview
            const readStream = (0, fs_1.createReadStream)(filePath);
            const writeStream = (0, fs_1.createWriteStream)(previewPath);
            yield (0, util_1.promisify)(stream_1.pipeline)(readStream, writeStream);
        }
        else {
            return null; // No preview for unsupported file types
        }
        console.log(" ============generate R E T U R N Preview================= ");
        console.log(previewFileName);
        console.log(previewPath);
        console.log(`/previews/${previewFileName}`);
        console.log(" ============generate R E T U R N Preview================= ");
        const route = `/File Manager/${email}/previews/${previewFileName}`;
        return route;
        // return `/${previewDir}/${previewFileName}`;
    }
    catch (error) {
        console.error("Error generating preview:", error);
        return null;
    }
});
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const generatePreview2 = (filePath, mimeType, email) => __awaiter(void 0, void 0, void 0, function* () {
    const previewDir = path_1.default.join(process.cwd(), "public", "File Manager", email, "previews");
    yield fs_extra_1.default.ensureDir(previewDir);
    const previewFileName = `${path_1.default.basename(filePath, path_1.default.extname(filePath))}_preview.png`;
    const previewPath = path_1.default.join(previewDir, previewFileName);
    console.log(" ============generatePreview================= ");
    console.log(previewFileName);
    console.log(previewPath);
    console.log(" ===========generatePreview================== ");
    try {
        if (mimeType.startsWith("image/")) {
            yield generateImagePreview(filePath, previewPath);
        }
        else if (mimeType === "application/pdf") {
            yield generatePdfPreview(filePath, previewPath);
        }
        else {
            return null; // No preview for unsupported file types
        }
        return `/previews/${previewFileName}`;
    }
    catch (error) {
        console.error("Error generating preview:", error);
        return null;
    }
});
const generateImagePreview = (filePath, previewPath) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, sharp_1.default)(filePath)
        .resize(200, 200, { fit: "inside", withoutEnlargement: true })
        .toFile(previewPath);
});
const generatePdfPreview = (filePath, previewPath) => __awaiter(void 0, void 0, void 0, function* () {
    const tempOutputPath = `${previewPath}.temp.png`;
    try {
        // Use ImageMagick to convert PDF to PNG
        yield execAsync(`magick convert -density 150 -quality 90 -background white -alpha remove "${filePath}[0]" -resize 200x200 "${tempOutputPath}"`);
        // Use sharp to ensure the output is in PNG format and to apply any additional processing if needed
        yield (0, sharp_1.default)(tempOutputPath).png().toFile(previewPath);
    }
    finally {
        // Clean up the temporary file
        yield fs_extra_1.default.remove(tempOutputPath);
    }
});
const generatePreview1 = (filePath, mimeType, email) => __awaiter(void 0, void 0, void 0, function* () {
    const previewDir = path_1.default.join(process.cwd(), "public", "File Manager", email, "previews");
    if (!fs_extra_1.default.existsSync(previewDir)) {
        fs_extra_1.default.mkdirSync(previewDir, { recursive: true });
    }
    const previewFileName = `${path_1.default.basename(filePath, path_1.default.extname(filePath))}_preview.png`;
    const previewPath = path_1.default.join(previewDir, previewFileName);
    console.log(" ============generatePreview================= ");
    console.log(previewFileName);
    console.log(previewPath);
    console.log(" ===========generatePreview================== ");
    try {
        if (mimeType.startsWith("image/")) {
            yield (0, sharp_1.default)(filePath)
                .resize(200, 200, { fit: "inside" })
                .toFile(previewPath);
        }
        else if (mimeType === "application/pdf") {
            const options = {
                density: 100,
                saveFilename: path_1.default.basename(filePath, path_1.default.extname(filePath)),
                savePath: previewDir,
                format: "png",
                width: 200,
                height: 200,
            };
            const convert = (0, pdf2pic_1.fromPath)(filePath, options);
            const pageToConvertAsImage = 1;
            yield convert(pageToConvertAsImage);
            // Rename the generated file to match our naming convention
            const generatedFileName = `${options.saveFilename}.1.png`;
            const generatedFilePath = path_1.default.join(previewDir, generatedFileName);
            fs_extra_1.default.renameSync(generatedFilePath, previewPath);
        }
        else {
            return null; // No preview for unsupported file types
        }
        return `/previews/${previewFileName}`;
    }
    catch (error) {
        console.error("Error generating preview:", error);
        return null;
    }
});
// const generatePreview = async (filePath: string, mimeType: string): Promise<string | null> => {
//     const previewDir = path.join(process.cwd(), 'public', 'previews');
//     if (!fs.existsSync(previewDir)) {
//         fs.mkdirSync(previewDir, { recursive: true });
//     }
//     const previewFileName = `${path.basename(filePath, path.extname(filePath))}_preview.png`;
//     const previewPath = path.join(previewDir, previewFileName);
//     try {
//         if (mimeType.startsWith('image/')) {
//             await sharp(filePath)
//                 .resize(200, 200, { fit: 'inside' })
//                 .toFile(previewPath);
//         } else if (mimeType === 'application/pdf') {
//             const pdfBytes = await fs.promises.readFile(filePath);
//             const pdfDoc = await PDFDocument.load(pdfBytes);
//             const firstPage = pdfDoc.getPages()[0];
//             const pngImage = await firstPage.exportAsPNG({ scale: 0.5 });
//             await sharp(pngImage)
//                 .resize(200, 200, { fit: 'inside' })
//                 .toFile(previewPath);
//         } else {
//             return null; // No preview for unsupported file types
//         }
//         return `/previews/${previewFileName}`;
//     } catch (error) {
//         console.error('Error generating preview:', error);
//         return null;
//     }
// };
const previewFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //   const file = await prisma.file.findUnique({ where: { id: req.params.fileId }, });
        // if (!file) {
        //     return res.status(404).json({ error: 'File not found' });
        // }
        const file = yield database_1.default.file.findUnique({
            where: { id: String(req.params.fileId) },
            include: { user: true },
        });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        // if (file.userId !== userId) {
        //     return res.status(403).json({ message: 'Access denied' })
        // }
        if (!fs_extra_1.default.existsSync(file.filePath)) {
            return res.status(404).json({ error: "File not found on the server" });
        }
        //const filePath = path.join(process.cwd(), file.filePath as string)
        const filePath = path_1.default.join(file.filePath);
        const fileContent = fs_extra_1.default.readFileSync(filePath);
        res.setHeader("Content-Type", file.mimeType);
        res.setHeader("Content-Disposition", `inline; filename="${file.name}"`);
        res.send(fileContent);
        // const filePath = file.filePath as string;
        // // Set appropriate headers for preview
        // res.setHeader('Content-Type', file.mimeType);
        // res.sendFile(filePath);
        // res.json(file);
    }
    catch (error) {
        next(error);
    }
});
exports.previewFile = previewFile;
const copyFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // const { newParentId } = req.body;
        const sourceFile = yield database_1.default.file.findUnique({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!sourceFile) {
            return res.status(404).json({ error: "File not found" });
        }
        // Fetch the user to calculate storage usage
        const user = yield database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Generate a new filename for the copy
        const newFilename = `Copy of ${sourceFile.name}`;
        const newFilePath = path_1.default.join(path_1.default.dirname(sourceFile.filePath), newFilename);
        // Copy the file
        yield fs_extra_1.default.promises.copyFile(sourceFile.filePath, newFilePath);
        // Create a new file record in the database
        const copiedFile = yield database_1.default.file.create({
            data: {
                name: newFilename,
                fileType: sourceFile.fileType,
                size: sourceFile.size,
                filePath: newFilePath,
                fileUrl: `${process.env.PUBLIC_APP_URL}/cefmdrive/storage/${encodeURIComponent(user.email)}/${encodeURIComponent(newFilename)}`,
                mimeType: sourceFile.mimeType,
                folderId: sourceFile.folderId,
                userId,
            },
        });
        // Log file activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                fileId: copiedFile.id,
                activityType: "File",
                action: "COPY FILE",
                filePath: copiedFile.filePath,
                fileSize: copiedFile.size,
                fileType: copiedFile.fileType,
            },
        });
        // Update storage history
        const totalStorage = user.maxStorageSize || 0;
        const usedStorage = yield database_1.default.file.aggregate({
            _sum: { size: true },
            where: { userId },
        });
        const newUsedStorage = (usedStorage._sum.size || 0) + sourceFile.size;
        const storageUsagePercentage = (newUsedStorage / Math.max(totalStorage, 1)) * 100;
        yield database_1.default.storageHistory.create({
            data: {
                userId,
                usedStorage: newUsedStorage,
                totalStorage,
                storageType: "file",
                storageLocation: copiedFile.filePath,
                storageUsagePercentage: Math.min(storageUsagePercentage, 100),
                storageLimit: totalStorage,
                overflowStorage: Math.max(0, newUsedStorage - totalStorage),
                notificationSent: storageUsagePercentage > 90,
            },
        });
        res.status(201).json(copiedFile);
    }
    catch (error) {
        console.error("Error copying file:", error);
        res.status(500).json({ error: "Error copying file" });
    }
});
exports.copyFile = copyFile;
const getFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { folderId } = req.query;
        const files = yield fileService.getFiles(userId, folderId);
        res.json(files);
    }
    catch (error) {
        next(error);
    }
});
exports.getFiles = getFiles;
const deleteFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { fileId } = req.params;
        yield fileService.deleteFile(userId, fileId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.deleteFile = deleteFile;
const getDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getDocuments(userId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getDocuments = getDocuments;
const getCustomDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getCustomDocuments(userId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getCustomDocuments = getCustomDocuments;
const getShared = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getShared(userId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getShared = getShared;
const getTrashed = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getTrashed(userId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getTrashed = getTrashed;
const getPdf = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const items = yield fileService.getPDFFiles(userId);
        if (!items) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(items);
    }
    catch (error) {
        next(error);
    }
});
exports.getPdf = getPdf;
const getVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const files = yield database_1.default.file.findMany({
            where: {
                fileType: "Video File",
                userId,
                trashed: false,
            },
        });
        if (!files) {
            return res.status(404).json({ message: "Video not found" });
        }
        res.json(files);
    }
    catch (error) {
        next(error);
    }
});
exports.getVideo = getVideo;
const getAudio = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const items = yield fileService.getAudioFiles(userId);
        if (!items) {
            return res.status(404).json({ message: "Audio not found" });
        }
        res.json(items);
    }
    catch (error) {
        next(error);
    }
});
exports.getAudio = getAudio;
const getWord = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getWordFiles(userId);
        if (!document) {
            return res.status(404).json({ message: "Word not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getWord = getWord;
const getPhotos = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getPhotos(userId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getPhotos = getPhotos;
const getExcelFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getExcelFiles(userId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getExcelFiles = getExcelFiles;
const getSharedWithMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const document = yield fileService.getSharedWithMe(userId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    }
    catch (error) {
        next(error);
    }
});
exports.getSharedWithMe = getSharedWithMe;
const renameFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { fileId } = req.params;
    const { newName } = req.body;
    try {
        const file = yield fileService.renameFile(fileId, userId, newName);
        res.json(file);
    }
    catch (error) {
        next(error);
    }
});
exports.renameFile = renameFile;
const getFileDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        const file = yield fileService.getFileDetails(fileId);
        res.json(file);
    }
    catch (error) {
        next(error);
    }
});
exports.getFileDetails = getFileDetails;
const lockFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = yield database_1.default.file.update({
            where: { id: req.params.id, userId: req.user.id },
            data: { locked: true },
        });
        res.json(file);
    }
    catch (error) {
        res.status(500).json({ error: "Error locking file" });
        next(error);
    }
});
exports.lockFile = lockFile;
const unlockFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = yield database_1.default.file.update({
            where: { id: req.params.id, userId: req.user.id },
            data: { locked: false },
        });
        res.json(file);
    }
    catch (error) {
        res.status(500).json({ error: "Error unlocking file" });
        next(error);
    }
});
exports.unlockFile = unlockFile;
const moveToTrash = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { fileId } = req.params;
        const file = yield fileService.moveToTrash(fileId, userId);
        res.json(file);
    }
    catch (error) {
        next(error);
    }
});
exports.moveToTrash = moveToTrash;
const shareLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const file = yield database_1.default.file.findUnique({
            where: { id: String(req.params.fileId) },
            include: { user: true },
        });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        // if (file.userId !== userId) {
        //     return res.status(403).json({ message: 'Access denied' })
        // }
        const fileLink = `${process.env.PUBLIC_APP_URL}/api/files/preview/${file.id}`;
        res.status(200).json({ link: fileLink });
    }
    catch (error) {
        console.error("Error getting file link:", error);
        res.status(500).json({ message: "Error getting file link" });
    }
});
exports.shareLink = shareLink;
const sharedFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const encodedFileId = (0, helpers_1.decodeFolder)(req.params.fileId);
        // Find the shared file or folder record
        const sharedItem = yield database_1.default.sharedFile.findFirst({
            where: { sharedUrl: encodedFileId },
        });
        if (!sharedItem) {
            console.log("File or folder not found.");
            return res.status(404).json({ message: "Item not found" });
        }
        // Check for expiration
        const currentDate = new Date();
        if (sharedItem.expirationDate && sharedItem.expirationDate < currentDate) {
            return res.status(400).json({ message: "The link has expired." });
        }
        // Check if the shared item is a file or folder
        if (sharedItem.shareableType) {
            if (sharedItem.shareableType === "File") {
                // Find the actual file in the database
                const file = yield database_1.default.file.findUnique({
                    where: { id: sharedItem.fileId },
                });
                if (!file) {
                    return res.status(400).json({ message: "File record not found." });
                }
                // Prepare data to be returned
                const data = {
                    name: file.name,
                    size: file.size,
                    mimeType: file.mimeType,
                    itemId: file.id,
                    isPasswordEnabled: sharedItem.isPasswordEnabled,
                    shareableType: "File",
                };
                return res.status(200).json(data);
            }
            if (sharedItem.shareableType === "Folder") {
                // Find the actual folder in the database
                const folder = yield database_1.default.folder.findUnique({
                    where: { id: sharedItem.folderId },
                });
                if (!folder) {
                    return res.status(400).json({ message: "Folder record not found." });
                }
                // Prepare data to be returned
                const data = {
                    name: folder.name,
                    size: folder.size,
                    itemId: folder.id,
                    isPasswordEnabled: sharedItem.isPasswordEnabled,
                    shareableType: "Folder",
                };
                return res.status(200).json(data);
            }
        }
        return res.status(400).json({ message: "Invalid shareable type" });
    }
    catch (error) {
        console.error("Error fetching shared file/folder:", error);
        return next(error);
    }
});
exports.sharedFile = sharedFile;
const copyLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { itemId } = req.params;
        const fileToShare = yield fileService.shareLink(userId, itemId);
        res.json(fileToShare.url);
    }
    catch (error) {
        next(error);
    }
});
exports.copyLink = copyLink;
const shareFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { fileId, sharedWith, password, expirationDate, shareWithMessage, isPasswordEnabled, isExpirationEnabled, } = req.body;
        const user = yield userService.getUserById(userId);
        if (user) {
            const fileToShare = yield fileService.shareFile(userId, fileId, password, sharedWith, shareWithMessage, isPasswordEnabled, expirationDate, isExpirationEnabled);
            if (fileToShare.url) {
                console.log(" ++++ shareFile user  fileToShare +++++ ");
                console.log(fileToShare);
                console.log(" ++++ shareFile user  fileToShare +++++ ");
                const emailParams = {
                    toEmail: sharedWith,
                    message: shareWithMessage,
                    fromEmail: user.email,
                    shareableLink: fileToShare.url,
                };
                yield (0, email_1.sendSharedLinkEmail)(emailParams);
            }
        }
        res.json("success");
    }
    catch (error) {
        next(error);
    }
});
exports.shareFile = shareFile;
//TODO
// export const getAllFiles = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const files = await prisma.file.findMany({
//             include: {
//                 owner: {
//                     select: {
//                         name: true,
//                     },
//                 },
//                 sharedWith: {
//                     select: {
//                         user: {
//                             select: {
//                                 name: true,
//                             },
//                         },
//                     },
//                 },
//             },
//         })
//         const formattedFiles = files.map((file) => ({
//             id: file.id,
//             name: file.name,
//             type: file.type,
//             size: file.size,
//             createdAt: file.createdAt,
//             updatedAt: file.updatedAt,
//             sharedWith: file.sharedWith.map((share) => share.user.name),
//             owner: file.owner.name,
//             mimeType: file.mimeType,
//         }))
//         res.json(formattedFiles)
//     } catch (error) {
//         console.error('Error fetching files:', error)
//         res.status(500).json({ error: 'Internal server error' })
//     }
// }
