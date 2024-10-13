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
exports.getFolderDetails = exports.getFolderFileCount1 = exports.getFolderFileCount = exports.shareFolder = exports.getFolderById = exports.renameFolder = exports.findOrCreateFolder = exports.createFolder = exports.getFoldersAndFilesByFolderId = exports.getRootFolder = exports.createNewFolder = void 0;
const database_1 = __importDefault(require("../config/database"));
const userService = __importStar(require("../services/userService"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const helpers_1 = require("../utils/helpers");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Helper function to determine the base folder path
// const getBaseFolderPath = (email: string): string => {
//   return process.env.NODE_ENV === "production"
//     ? path.join("/var/www/cefmdrive/storage", email)
//     : path.join(process.cwd(), "public", "File Manager", email);
// };
// Create new folder function
const createNewFolder = (userId, folderName, parentFolderId, ipAddress, userAgent, operatingSystem, browser, device) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getUserById(userId);
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
                return { success: false, message: "Root folder not found" };
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
                return { success: false, message: "Parent folder not found" };
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
            return { success: false, message: "Folder already exists" };
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
                ipAddress,
                userAgent,
                device,
                operatingSystem,
                browser,
                filePath: newFolderPath,
                fileSize: 0, // Folders don't have a size
                fileType: "folder",
            },
        });
        return {
            success: true,
            message: "Folder created successfully",
            folder: newFolder,
        };
    }
    catch (error) {
        console.error("Error creating folder:", error);
        return {
            success: false,
            message: "An error occurred while creating the folder",
        };
    }
});
exports.createNewFolder = createNewFolder;
//=================================================================================
const getRootFolder = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const folder = yield database_1.default.folder.findFirst({
        where: { parentId: null, userId },
    });
    return folder;
});
exports.getRootFolder = getRootFolder;
const getFoldersAndFilesByFolderId = (userId, parentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const folders = yield database_1.default.folder.findMany({
            where: {
                parentId,
                userId,
                trashed: false,
            },
            include: { files: true },
        });
        const files = yield database_1.default.file.findMany({
            where: {
                folderId: parentId,
                userId,
                trashed: false,
            },
        });
        const documents = yield database_1.default.document.findMany({
            where: {
                userId,
                trashed: false,
            },
        });
        return { folders, files, documents };
    }
    catch (error) {
        console.error("Error in getRootChildren:", error);
        throw error;
    }
});
exports.getFoldersAndFilesByFolderId = getFoldersAndFilesByFolderId;
// export const getRootChildren = async (
//   userId: string
// ): Promise<{ folders: Folder[]; files: File[]; documents: Document[] }> => {
//   try {
//     const user = await userService.getUserById(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }
//     const rootFolder = await prisma.folder.findFirst({
//       where: {
//         name: user?.email as string,
//         userId,
//         parentId: null,
//         trashed: false,
//       },
//     });
//     if (!rootFolder) {
//       throw new Error("Root folder not found for the specified user");
//     }
//     const folders = await prisma.folder.findMany({
//       where: { parentId: rootFolder.id, userId, trashed: false },
//     });
//     const files = await prisma.file.findMany({
//       where: { folderId: rootFolder.id, trashed: false },
//     });
//     const documents = await prisma.document.findMany({
//       where: { trashed: false },
//     });
//     return { folders, files, documents };
//   } catch (error) {
//     console.error("Error in getRootChildren:", error);
//     throw error;
//   }
// };
const createFolder = (userId, parentId, name) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.folder.create({
        data: {
            name,
            userId,
            parentId,
        },
    });
});
exports.createFolder = createFolder;
const findOrCreateFolder = (userId, parentId, name) => __awaiter(void 0, void 0, void 0, function* () {
    let folder = yield database_1.default.folder.findFirst({
        where: {
            name,
            userId,
            parentId,
        },
    });
    if (!folder) {
        folder = yield (0, exports.createFolder)(userId, parentId, name);
    }
    return folder;
});
exports.findOrCreateFolder = findOrCreateFolder;
const renameFolder = (id, userId, newName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const folder = yield database_1.default.folder.findUnique({
        where: { id: id },
    });
    if (!folder) {
        throw new Error(`Folder   not found.`);
    }
    // Ensure the new name does not conflict with existing folders in the same directory
    const existingFolder = yield database_1.default.folder.findFirst({
        where: { name: newName, id: { not: folder.id } },
    });
    if (existingFolder) {
        throw new Error(`A folder with the name "${newName}" already exists.`);
    }
    // Rename the folder in the filesystem
    const oldFolderPath = folder.folderPath;
    const newFolderPath = path_1.default.join(path_1.default.dirname(oldFolderPath), newName);
    yield fs_1.promises.rename(oldFolderPath, newFolderPath);
    // Update the folder metadata in the database
    yield database_1.default.folder.update({
        where: { id: id },
        data: {
            name: newName,
            folderPath: newFolderPath,
            folderUrl: (_a = folder === null || folder === void 0 ? void 0 : folder.folderUrl) === null || _a === void 0 ? void 0 : _a.replace(folder.name, newName),
        },
    });
    return `Folder  renamed to ${newName}`;
});
exports.renameFolder = renameFolder;
const getFolderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.folder.findUnique({
        where: { id },
    });
});
exports.getFolderById = getFolderById;
const shareFolder = (userId, folderId, password, sharedWith, shareWithMessage, isPasswordEnabled, expirationDate, isExpirationEnabled) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate the input
    if (!folderId || !sharedWith) {
        throw new Error("Missing required fields");
    }
    // Validate expirationDate if isExpirationEnabled is true
    let validExpirationDate = null;
    if (isExpirationEnabled && expirationDate) {
        validExpirationDate = new Date(expirationDate);
        if (isNaN(validExpirationDate.getTime())) {
            throw new Error("Invalid expiration date format");
        }
    }
    // Check if the file exists
    const existingFolder = yield database_1.default.folder.findUnique({
        where: { id: folderId },
    });
    if (!existingFolder) {
        throw new Error("FOlder does not exist");
    }
    let hashedPassword = null;
    if (isPasswordEnabled && password) {
        hashedPassword = yield bcrypt_1.default.hash(password, 10);
    }
    const uniqueId = (0, helpers_1.generateUniqueId)();
    yield database_1.default.sharedFile.create({
        data: {
            folderId: existingFolder.id,
            sharedWith,
            shareWithMessage,
            // sharedId: uniqueId,
            isPasswordEnabled,
            expirationDate: validExpirationDate,
            isExpirationEnabled,
            password: hashedPassword,
            userId: userId,
        },
    });
    // Update the file to mark it as shared
    yield database_1.default.folder.update({
        where: { id: existingFolder.id }, // Fixed to reference the correct ID
        data: { isShared: true },
    });
    // Record the file sharing activity
    yield database_1.default.fileActivity.create({
        data: {
            fileId: existingFolder.id,
            action: "shared Folder",
            userId,
        },
    });
    // Get the base URL from environment variables
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const encodedFileId = encodeURIComponent(uniqueId);
    // Create the full shared file URL
    const sharedFileUrl = `${baseUrl}/shared/${encodedFileId}`;
    return {
        url: sharedFileUrl,
        message: "FOlder shared successfully",
    };
});
exports.shareFolder = shareFolder;
const getFolderFileCount = (folderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.file.aggregate({
            where: {
                folderId,
            },
            _count: {
                id: true,
            },
            _sum: {
                size: true,
            },
        });
        const count = result._count.id;
        const totalSize = result._sum.size || 0;
        console.log("@@@@@@@@@@@@@@@@@@@@@count and size@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log(`Count: ${count}, Total Size: ${totalSize}`);
        console.log("@@@@@@@@@@@@@@@@@@@@@count and size@@@@@@@@@@@@@@@@@@@@@@@@@");
        return { count, totalSize };
    }
    catch (error) {
        console.error("Error getting folder file info:", error);
        throw error;
    }
});
exports.getFolderFileCount = getFolderFileCount;
// In your folder service file (e.g., folderService.ts)
const getFolderFileCount1 = (folderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield database_1.default.file.count({
            where: {
                folderId,
            },
        });
        console.log(" @@@@@@@@@@@@@@@@@@@@@@@count@@@@@@@@@@@@@@@@@@@@@@@@@@@ ");
        console.log(count);
        console.log(" @@@@@@@@@@@@@@@@@@@@@count@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ");
        return count;
    }
    catch (error) {
        console.error("Error counting files in folder:", error);
        throw error;
    }
});
exports.getFolderFileCount1 = getFolderFileCount1;
const getFolderDetails = (folderId) => __awaiter(void 0, void 0, void 0, function* () {
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
        throw new Error(`Folder   not found.`);
    }
    const totalFileSize = folder.files.reduce((acc, file) => acc + file.size, 0);
    const checkUser = yield database_1.default.user.findUnique({
        where: { id: folder.userId },
    });
    return {
        success: `Folder with ID ${folderId} details retrieved.`,
        folder: {
            id: folder.id,
            name: folder.name,
            totalFileSize,
            numberOfFiles: folder._count.files,
            uploadedBy: (checkUser === null || checkUser === void 0 ? void 0 : checkUser.name) || null,
            numberOfSubfolders: folder._count.children,
            files: folder.files,
        },
    };
});
exports.getFolderDetails = getFolderDetails;
