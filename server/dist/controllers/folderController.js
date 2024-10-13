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
exports.getFolderVersions = exports.moveFolder = exports.copyFolder = exports.lockFolder = exports.unlockFolder = exports.getFileCount = exports.getFolderDetails = exports.getRootChildren = exports.getRootFolder = exports.getChildrenFoldersByParentFolderId = exports.downloadFolder = exports.createNewFolder = exports.renameFolder = exports.moveFolderToTrash = exports.restoreFolder = exports.deleteFolderPermanently = exports.getFoldersTree = void 0;
exports.getUserInfo = getUserInfo;
const folderService = __importStar(require("../services/folderService"));
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const path_1 = __importDefault(require("path"));
const helpers_1 = require("../utils/helpers");
const database_1 = __importDefault(require("../config/database"));
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const promises_2 = require("fs/promises");
const uuid_1 = require("uuid");
const promises_3 = require("fs/promises");
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
// Helper function to build folder hierarchy
const buildFolderTree = (folders, parentId) => {
    return folders
        .filter((folder) => folder.parentId === parentId)
        .map((folder) => ({
        id: folder.id,
        name: folder.name,
        children: buildFolderTree(folders, folder.id),
    }));
};
const getFoldersTree = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        // Fetch all folders for the user
        const folders = yield database_1.default.folder.findMany({
            where: { userId },
        });
        if (!folders || folders.length === 0) {
            return res.status(404).json({ error: "No folders found for this user" });
        }
        // Build the folder tree starting from the root (null parentId)
        const folderTree = buildFolderTree(folders, null);
        // Send response
        res.status(200).json(folderTree);
    }
    catch (error) {
        console.error("Error retrieving folders:", error);
        res.status(500).json({
            error: "Failed to retrieve folders",
            details: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.getFoldersTree = getFoldersTree;
const promises_4 = require("fs/promises");
const deleteFolderPermanently = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.params;
        const { userId } = req.user;
        // Find the folder
        const folder = yield database_1.default.folder.findUnique({
            where: { id: folderId, userId },
        });
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        // Check if the user has write permissions on the folder
        if (folder.folderPath) {
            try {
                yield (0, promises_4.access)(folder.folderPath, promises_4.constants.W_OK);
            }
            catch (error) {
                return res.status(403).json({
                    error: "Permission denied. You don't have write access to this folder.",
                });
            }
        }
        // Recursively delete all subfolders and files
        const deleteRecursive = (folderId) => __awaiter(void 0, void 0, void 0, function* () {
            // Delete all file activities related to files in this folder
            yield database_1.default.fileActivity.deleteMany({
                where: { File: { folderId } },
            });
            // Delete all files in the folder
            yield database_1.default.file.deleteMany({
                where: { folderId },
            });
            // Delete all folder activities related to this folder
            yield database_1.default.fileActivity.deleteMany({
                where: { folderId },
            });
            // Delete all folder versions related to this folder
            yield database_1.default.folderVersion.deleteMany({
                where: { folderId },
            });
            // Find all subfolders
            const subfolders = yield database_1.default.folder.findMany({
                where: { parentId: folderId },
            });
            // Recursively delete subfolders
            for (const subfolder of subfolders) {
                yield deleteRecursive(subfolder.id);
            }
            // Delete the folder itself
            yield database_1.default.folder.delete({
                where: { id: folderId },
            });
        });
        // Start the recursive deletion
        yield deleteRecursive(folderId);
        // Delete the folder from the file system
        if (folder.folderPath) {
            try {
                yield (0, promises_3.rm)(folder.folderPath, { recursive: true, force: true });
            }
            catch (error) {
                console.error("Error deleting folder from file system:", error);
                return res
                    .status(500)
                    .json({ error: "Failed to delete folder from file system" });
            }
        }
        // Log the activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                folderId,
                activityType: "Folder",
                action: "DELETE_PERMANENT",
                filePath: folder.folderPath || "",
                fileSize: 0,
                fileType: "folder",
            },
        });
        res
            .status(200)
            .json({ message: "Folder and its contents permanently deleted" });
    }
    catch (error) {
        console.error("Error deleting folder permanently:", error);
        res.status(500).json({
            error: "Failed to delete folder permanently",
            details: error instanceof Error ? error.message : String(error),
        });
        next(error);
    }
});
exports.deleteFolderPermanently = deleteFolderPermanently;
const restoreFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.params;
        const { userId } = req.user;
        // Find the folder
        const folder = yield database_1.default.folder.findUnique({
            where: { id: folderId, userId },
        });
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        if (!folder.trashed) {
            return res.status(400).json({ error: "Folder is not in trash" });
        }
        // Restore the folder
        const restoredFolder = yield database_1.default.folder.update({
            where: { id: folderId },
            data: { trashed: false },
        });
        // Log the activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                folderId: restoredFolder.id,
                activityType: "Folder",
                action: "RESTORE",
                filePath: restoredFolder.folderPath,
                fileSize: 0, // Folders don't have a size
                fileType: "folder",
            },
        });
        res
            .status(200)
            .json({ message: "Folder restored successfully", restoredFolder });
    }
    catch (error) {
        console.error("Error restoring folder:", error);
        res.status(500).json({
            error: "Failed to restore folder",
            details: error instanceof Error ? error.message : String(error),
        });
        next(error);
    }
});
exports.restoreFolder = restoreFolder;
const moveFolderToTrash = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.params;
        const { userId } = req.user;
        const folder = yield database_1.default.folder.findUnique({
            where: { id: folderId, userId },
        });
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        yield database_1.default.folder.update({
            where: { id: folderId },
            data: { trashed: true },
        });
        yield database_1.default.fileActivity.create({
            data: {
                action: "moveToTrash",
                userId,
                folderId,
                activityType: "Folder",
            },
        });
        res.status(200).json({ message: "Folder moved to trash successfully" });
    }
    catch (error) {
        console.error("Error moving folder to trash:", error);
        next(error);
    }
});
exports.moveFolderToTrash = moveFolderToTrash;
const renameFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { folderId } = req.params;
        const { newName } = req.body;
        const { userId } = req.user;
        // Validate input
        if (!newName ||
            typeof newName !== "string" ||
            newName.includes("/") ||
            newName.includes("\\")) {
            return res.status(400).json({ error: "Invalid folder name" });
        }
        // Find the folder
        const folder = yield database_1.default.folder.findUnique({
            where: { id: folderId, userId },
        });
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        // Construct new paths
        const oldPath = folder.folderPath;
        const newPath = path_1.default.join(path_1.default.dirname(oldPath), newName);
        const newUrl = (_a = folder.folderUrl) === null || _a === void 0 ? void 0 : _a.replace(encodeURIComponent(folder.name), encodeURIComponent(newName));
        const newLocation = (_b = folder.location) === null || _b === void 0 ? void 0 : _b.replace(folder.name, newName);
        // Ensure the user has write permissions
        try {
            yield (0, promises_2.chmod)(oldPath, 0o755);
        }
        catch (chmodError) {
            console.error("Error changing permissions:", chmodError);
            return res
                .status(500)
                .json({ error: "Failed to change folder permissions." });
        }
        // Rename the folder in the file system
        try {
            yield fs_1.promises.rename(oldPath, newPath);
        }
        catch (fsError) {
            console.error("File system error:", fsError);
            if (fsError.code === "EPERM") {
                return res.status(403).json({
                    error: "Permission denied. Unable to rename the folder.",
                    details: fsError.message,
                });
            }
            return res.status(500).json({
                error: `Failed to rename folder in the file system: ${fsError.message}`,
            });
        }
        const latestVersion = yield database_1.default.folderVersion.findFirst({
            where: { folderId: folder.id },
            orderBy: { versionNumber: "desc" },
        });
        const newVersionNumber = ((latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.versionNumber) || 0) + 1;
        // Create a folder version before updating
        yield database_1.default.folderVersion.create({
            data: {
                id: (0, uuid_1.v4)(),
                folderId: folder.id,
                name: folder.name,
                folderPath: folder.folderPath,
                folderUrl: folder.folderUrl,
                location: folder.location,
                versionNumber: newVersionNumber,
                userId: folder.userId,
                createdAt: new Date(),
            },
        });
        // Update the folder in the database
        const updatedFolder = yield database_1.default.folder.update({
            where: { id: folderId },
            data: {
                name: newName,
                folderPath: newPath,
                folderUrl: newUrl,
                location: newLocation,
                versionNumber: {
                    increment: 1,
                },
            },
        });
        // Log the activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                folderId: updatedFolder.id,
                activityType: "Folder",
                action: "RENAME",
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers["user-agent"] || "",
                device: "unknown", // Consider implementing a function to get device info
                operatingSystem: "unknown", // Same as above
                browser: "unknown", // Same as above
                filePath: newPath,
                fileSize: 0, // Folders don't have a size
                fileType: "folder",
            },
        });
        return res
            .status(200)
            .json({ message: "Folder renamed successfully", folder: updatedFolder });
    }
    catch (error) {
        console.error("Error renaming folder:", error);
        return res.status(500).json({
            error: `Failed to rename folder: ${error instanceof Error ? error.message : "An unexpected error occurred."}`,
            details: error instanceof Error ? error.stack : undefined,
        });
    }
});
exports.renameFolder = renameFolder;
const createNewFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderName, parentFolderId } = req.body;
        const { userId } = req.user;
        const userInfo = getUserInfo(req);
        const user = yield database_1.default.user.findUnique({ where: { id: userId } });
        if (!folderName ||
            typeof folderName !== "string" ||
            folderName.includes("/") ||
            folderName.includes("\\")) {
            return res.status(400).json({ error: "Invalid folder name" });
        }
        if (!user) {
            return { success: false, message: "User not found" };
        }
        const email = user === null || user === void 0 ? void 0 : user.email;
        const baseFolder = (0, helpers_1.getBaseFolderPath)(email);
        let newFolderPath;
        let newFolderUrl;
        let location;
        let finalParentFolderId = parentFolderId;
        let rootFolderUrl;
        if (!finalParentFolderId) {
            // Find the root folder
            const rootFolder = yield database_1.default.folder.findFirst({
                where: { name: email, userId: user.id },
            });
            if (!rootFolder) {
                return res.status(404).json({ message: "Root folder not found" });
            }
            if (process.env.NODE_ENV === "production") {
                rootFolderUrl = `${process.env.PUBLIC_APP_URL}/cefmdrive/storage/${encodeURIComponent(email)}/${encodeURIComponent(folderName)}`;
            }
            else {
                rootFolderUrl = `${process.env.PUBLIC_APP_URL}/Public/File Manager/${encodeURIComponent(email)}/${encodeURIComponent(folderName)}`;
            }
            finalParentFolderId = rootFolder.id;
            newFolderPath = path_1.default.join(baseFolder, folderName);
            newFolderUrl = rootFolderUrl;
            location = `/${folderName}`;
        }
        else {
            // Find parent folder and construct path based on it
            const parentFolder = yield database_1.default.folder.findUnique({
                where: { id: finalParentFolderId },
            });
            if (!parentFolder) {
                return res.status(404).json({ message: "Parent folder not found" });
            }
            newFolderPath = parentFolder.folderPath
                ? path_1.default.join(parentFolder.folderPath, folderName)
                : path_1.default.join(baseFolder, folderName);
            if (process.env.NODE_ENV === "production") {
                rootFolderUrl = `${process.env.PUBLIC_APP_URL}/cefmdrive/storage/${encodeURIComponent(email)}/${encodeURIComponent(folderName)}`;
            }
            else {
                rootFolderUrl = `${process.env.PUBLIC_APP_URL}/Public/File Manager/${encodeURIComponent(email)}/${encodeURIComponent(folderName)}`;
            }
            newFolderUrl = parentFolder.folderUrl
                ? `${parentFolder.folderUrl}/${encodeURIComponent(folderName)}`
                : rootFolderUrl;
            location = parentFolder.location
                ? `${parentFolder.location}/${folderName}`
                : `/${folderName}`;
        }
        // Check if the folder already exists
        try {
            yield fs_1.promises.access(newFolderPath);
            return res.status(301).json({ message: "Folder already exists" });
        }
        catch (error) {
            // Folder doesn't exist, so create it
            yield fs_1.promises.mkdir(newFolderPath, { recursive: true });
            // Optionally, set permissions if needed
            yield fs_1.promises.chmod(newFolderPath, 0o755); // Owner has full permissions, others can read and execute
        }
        // Create folder in the database
        const newFolder = yield database_1.default.folder.create({
            data: {
                name: folderName,
                parentId: finalParentFolderId,
                folderPath: newFolderPath,
                folderUrl: newFolderUrl,
                location,
                userId: user.id,
            },
        });
        // Log the activity in the database
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                folderId: newFolder.id,
                activityType: "Folder",
                action: "CREATE",
                ipAddress: userInfo.ipAddress,
                userAgent: userInfo.userAgent,
                device: userInfo.deviceType,
                operatingSystem: userInfo.operatingSystem,
                browser: userInfo.browser,
                filePath: newFolderPath,
                fileSize: 0, // Folders don't have a size
                fileType: "folder",
            },
        });
        res.status(201).json({ message: `${folderName} created successfully` });
    }
    catch (error) {
        next(error);
    }
});
exports.createNewFolder = createNewFolder;
const downloadFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { folderId } = req.body;
    try {
        const folder = yield database_1.default.folder.findUnique({
            where: { id: folderId },
        });
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        const folderPath = path_1.default.join(folder.folderPath);
        // Create a zip file
        const zipFileName = `${folder.name}.zip`;
        const zipFilePath = path_1.default.join(process.cwd(), zipFileName);
        const output = yield (0, fs_1.createWriteStream)(zipFilePath);
        const archive = (0, archiver_1.default)("zip");
        output.on("close", () => {
            console.log(`Zipped ${archive.pointer()} total bytes.`);
        });
        archive.on("error", (err) => {
            throw err;
        });
        // Pipe the zip stream to the output file
        archive.pipe(output);
        // Append files from the folder
        archive.directory(folderPath, false);
        yield archive.finalize();
        // Send the zip file as a response
        const zipFileStream = yield (0, fs_1.createReadStream)(zipFilePath);
        res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
        res.setHeader("Content-Type", "application/zip");
        res.send(zipFileStream);
    }
    catch (error) {
        next(error);
    }
});
exports.downloadFolder = downloadFolder;
const getChildrenFoldersByParentFolderId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { folderId } = req.params;
        const folder = yield folderService.getFoldersAndFilesByFolderId(userId, folderId);
        res.status(201).json(folder);
    }
    catch (error) {
        next(error);
    }
});
exports.getChildrenFoldersByParentFolderId = getChildrenFoldersByParentFolderId;
const getRootFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const folder = yield folderService.getRootFolder(userId);
        res.status(201).json(folder);
    }
    catch (error) {
        next(error);
    }
});
exports.getRootFolder = getRootFolder;
const getRootChildren = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const user = yield database_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });
        if (!user) {
            return res.status(201).json({ message: "User not found" });
        }
        const rootFolder = yield database_1.default.folder.findFirst({
            where: {
                name: user === null || user === void 0 ? void 0 : user.email,
                userId,
                parentId: null,
                trashed: false,
            },
        });
        if (!rootFolder) {
            return res
                .status(201)
                .json({ message: "Root folder not found for the specified user" });
        }
        const folders = yield database_1.default.folder.findMany({
            where: { parentId: rootFolder === null || rootFolder === void 0 ? void 0 : rootFolder.id, userId, trashed: false },
            include: {
                files: {
                    select: {
                        size: true,
                    },
                },
            },
        });
        // Calculate total file size for each folder
        const foldersWithSize = folders.map((folder) => (Object.assign(Object.assign({}, folder), { totalSize: folder.files.reduce((acc, file) => acc + file.size, 0), files: undefined })));
        const files = yield database_1.default.file.findMany({
            where: { folderId: rootFolder === null || rootFolder === void 0 ? void 0 : rootFolder.id, trashed: false },
        });
        const documents = yield database_1.default.document.findMany({
            where: { trashed: false },
        });
        res.status(201).json({ folders: foldersWithSize, files, documents });
    }
    catch (error) {
        next(error);
    }
});
exports.getRootChildren = getRootChildren;
const getFolderDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { folderId } = req.params;
        const folder = yield database_1.default.folder.findUnique({
            where: { id: folderId },
            include: {
                files: true,
                _count: {
                    select: {
                        files: true,
                        children: true,
                    },
                },
            },
        });
        if (!folder) {
            return res.status(500).json({ message: `Folder not found.` });
        }
        const totalFileSize = folder.files.reduce((acc, file) => acc + file.size, 0);
        const checkUser = yield database_1.default.user.findUnique({
            where: { id: folder.userId },
        });
        // Modify the location to show only from the email part and replace email with "ROOT"
        const modifiedLocation = folder.folderPath
            ? ((_a = folder.folderPath
                .split((checkUser === null || checkUser === void 0 ? void 0 : checkUser.email) || "")[1]) === null || _a === void 0 ? void 0 : _a.replace(/^[/\\]/, "")) || ""
            : "";
        const finalLocation = modifiedLocation
            ? `ROOT\\${modifiedLocation.replace(/\//g, "\\")}`
            : "ROOT";
        return res.json({
            id: folder.id,
            name: folder.name,
            totalFileSize: (0, helpers_1.formatSize)(totalFileSize),
            numberOfFiles: folder._count.files,
            location: finalLocation,
            uploadedBy: (checkUser === null || checkUser === void 0 ? void 0 : checkUser.name) || null,
            numberOfSubfolders: folder._count.children,
            createdAt: folder.createdAt.toISOString(),
            updatedAt: folder.updatedAt.toISOString(),
            ownerId: checkUser === null || checkUser === void 0 ? void 0 : checkUser.name,
            locked: folder.locked ? "Yes" : "No",
            isShared: folder.isShared ? "Yes" : "No",
            files: folder.files,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFolderDetails = getFolderDetails;
const getFileCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.params;
        const count = yield folderService.getFolderFileCount(folderId);
        res.json(count);
    }
    catch (error) {
        next(error);
    }
});
exports.getFileCount = getFileCount;
const unlockFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folder = yield database_1.default.folder.update({
            where: { id: req.params.id, userId: req.user.id },
            data: { locked: false },
        });
        res.json(folder);
    }
    catch (error) {
        res.status(500).json({ error: "Error unlocking folder" });
        next(error);
    }
});
exports.unlockFolder = unlockFolder;
const lockFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folder = yield database_1.default.folder.update({
            where: { id: req.params.id, userId: req.user.id },
            data: { locked: true },
        });
        res.json(folder);
    }
    catch (error) {
        res.status(500).json({ error: "Error locking folder" });
        next(error);
    }
});
exports.lockFolder = lockFolder;
const copyFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { folderId } = req.params;
        const sourceFolder = yield database_1.default.folder.findUnique({
            where: { id: folderId, userId },
            include: { files: true, children: true },
        });
        if (!sourceFolder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        const user = yield database_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        let totalCopiedSize = 0;
        const copyFolderRecursive = (folder, parentId, parentPath, isRoot) => __awaiter(void 0, void 0, void 0, function* () {
            const newFolderName = isRoot ? `Copy of ${folder.name}` : folder.name;
            const newFolderPath = path_1.default.join(parentPath, newFolderName);
            // Create the new folder in the file system
            yield (0, promises_1.mkdir)(newFolderPath, { recursive: true });
            // Set folder permissions (e.g., 0o755 for read, write, execute for owner, read and execute for others)
            yield (0, promises_2.chmod)(newFolderPath, 0o755);
            // Create the new folder in the database
            const newFolder = yield database_1.default.folder.create({
                data: {
                    name: newFolderName,
                    parentId,
                    userId,
                    folderPath: newFolderPath,
                    folderUrl: `${process.env.PUBLIC_APP_URL}/cefmdrive/storage/${encodeURIComponent(user.email)}/${encodeURIComponent(newFolderName)}`,
                    location: isRoot ? `/${newFolderName}` : folder.location,
                },
            });
            // Copy files if they exist
            if (Array.isArray(folder.files) && folder.files.length > 0) {
                for (const file of folder.files) {
                    const newFilePath = path_1.default.join(newFolderPath, file.name);
                    yield (0, promises_1.copyFile)(file.filePath, newFilePath);
                    // Set file permissions (e.g., 0o644 for read-write for owner, read for others)
                    yield (0, promises_2.chmod)(newFilePath, 0o644);
                    yield database_1.default.file.create({
                        data: {
                            name: file.name,
                            fileType: file.fileType,
                            size: file.size,
                            filePath: newFilePath,
                            fileUrl: `${newFolder.folderUrl}/${encodeURIComponent(file.name)}`,
                            mimeType: file.mimeType,
                            folderId: newFolder.id,
                            userId,
                        },
                    });
                    totalCopiedSize += file.size;
                }
            }
            // Recursively copy subfolders if they exist
            if (Array.isArray(folder.children) && folder.children.length > 0) {
                for (const child of folder.children) {
                    yield copyFolderRecursive(child, newFolder.id, newFolderPath, false);
                }
            }
            return newFolder;
        });
        const copiedFolder = yield copyFolderRecursive(sourceFolder, sourceFolder.parentId, path_1.default.dirname(sourceFolder.folderPath), true);
        // Log folder activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                folderId: copiedFolder.id,
                activityType: "Folder",
                action: "COPY FOLDER",
                filePath: copiedFolder.folderPath,
                fileSize: totalCopiedSize,
                fileType: "folder",
            },
        });
        // Update storage history
        const currentDate = new Date();
        const storageHistory = yield database_1.default.storageHistory.findFirst({
            where: {
                userId,
                createdAt: {
                    gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                    lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1),
                },
            },
        });
        if (storageHistory) {
            yield database_1.default.storageHistory.update({
                where: { id: storageHistory.id },
                data: {
                    usedStorage: {
                        increment: totalCopiedSize,
                    },
                },
            });
        }
        else {
            yield database_1.default.storageHistory.create({
                data: {
                    userId,
                    createdAt: currentDate,
                    usedStorage: totalCopiedSize,
                },
            });
        }
        res.status(201).json(copiedFolder);
    }
    catch (error) {
        console.error("Error copying folder:", error);
        res.status(500).json({ error: "Error copying folder" });
    }
});
exports.copyFolder = copyFolder;
const moveFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newParentId } = req.body;
        const { id } = req.params;
        const userId = req.user.id;
        // Get the current folder
        const currentFolder = yield database_1.default.folder.findUnique({
            where: { id, userId },
        });
        if (!currentFolder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        // Get the new parent folder
        const newParentFolder = yield database_1.default.folder.findUnique({
            where: { id: newParentId, userId },
        });
        if (!newParentFolder) {
            return res.status(404).json({ error: "New parent folder not found" });
        }
        // Calculate new paths
        const newFolderPath = path_1.default.join(newParentFolder.folderPath, currentFolder.name);
        const newFolderUrl = `${newParentFolder.folderUrl}/${encodeURIComponent(currentFolder.name)}`;
        const newLocation = `${newParentFolder.location}/${currentFolder.name}`;
        const latestVersion = yield database_1.default.folderVersion.findFirst({
            where: { folderId: newParentFolder.id },
            orderBy: { versionNumber: "desc" },
        });
        const newVersionNumber = ((latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.versionNumber) || 0) + 1;
        // Create a folder version before updating
        yield database_1.default.folderVersion.create({
            data: {
                id: (0, uuid_1.v4)(),
                folderId: currentFolder.id,
                name: currentFolder.name,
                folderPath: currentFolder.folderPath,
                folderUrl: currentFolder.folderUrl,
                location: currentFolder.location,
                versionNumber: newVersionNumber,
                userId,
                createdAt: new Date(),
            },
        });
        // Update the folder
        const updatedFolder = yield database_1.default.folder.update({
            where: { id, userId },
            data: {
                parentId: newParentId,
                folderPath: newFolderPath,
                folderUrl: newFolderUrl,
                location: newLocation,
                versionNumber: {
                    increment: 1,
                },
            },
        });
        // Log the activity
        yield database_1.default.fileActivity.create({
            data: {
                userId,
                folderId: updatedFolder.id,
                activityType: "Folder",
                action: "MOVE",
                filePath: newFolderPath,
                fileSize: 0, // Folders don't have a size
                fileType: "folder",
            },
        });
        res.json(updatedFolder);
    }
    catch (error) {
        console.error("Error moving folder:", error);
        res.status(500).json({ error: "Error moving folder" });
        next(error);
    }
});
exports.moveFolder = moveFolder;
// New function to get folder versions
const getFolderVersions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.params;
        const userId = req.user.id;
        const folderVersions = yield database_1.default.folderVersion.findMany({
            where: { folderId, userId },
            orderBy: { versionNumber: "desc" },
        });
        res.json(folderVersions);
    }
    catch (error) {
        console.error("Error getting folder versions:", error);
        res.status(500).json({ error: "Error getting folder versions" });
        next(error);
    }
});
exports.getFolderVersions = getFolderVersions;
