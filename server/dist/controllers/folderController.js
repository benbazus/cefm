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
exports.moveFolder = exports.copyFolder = exports.lockFolder = exports.unlockFolder = exports.getFileCount = exports.getFolderDetails = exports.getRootChildren = exports.getRootFolder = exports.getChildrenFoldersByParentFolderId = exports.downloadFolder = exports.createNewFolder = void 0;
exports.getUserInfo = getUserInfo;
const folderService = __importStar(require("../services/folderService"));
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../config/database"));
const archiver_1 = __importDefault(require("archiver"));
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
const createNewFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderName, parentFolderId } = req.body;
        const { userId } = req.user;
        const userInfo = getUserInfo(req);
        const user = yield database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!folderName ||
            typeof folderName !== "string" ||
            folderName.includes("/") ||
            folderName.includes("\\")) {
            return res.status(400).json({ error: "Invalid folder name" });
        }
        const folder = yield folderService.createNewFolder(userId, folderName, parentFolderId, userInfo.ipAddress, userInfo.userAgent, userInfo.operatingSystem, userInfo.browser, userInfo.deviceType);
        res.status(201).json(`${folderName} created successfully`);
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
            return res.status(404).json("Folder not found");
        }
        const folderPath = path_1.default.join(folder.folderPath);
        // Create a zip file
        const zipFileName = `${folder.name}.zip`;
        const zipFilePath = path_1.default.join(process.cwd(), zipFileName);
        const output = fs_1.default.createWriteStream(zipFilePath);
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
        const zipFileStream = fs_1.default.createReadStream(zipFilePath);
        // const contentDisposition = file.mimeType.startsWith('image/') ? 'inline' : 'attachment';
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
        const result = yield folderService.getRootChildren(userId);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.getRootChildren = getRootChildren;
const getFolderDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.params;
        const folder = yield folderService.getFolderDetails(folderId);
        res.json(folder);
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
        const { newParentId } = req.body;
        const sourceFolder = yield database_1.default.folder.findUnique({
            where: { id: req.params.id, userId: req.user.id },
            include: { files: true, children: true },
        });
        if (!sourceFolder) {
            return res.status(404).json({ error: "Folder not found" });
        }
        const copyFolder = (folder, parentId) => __awaiter(void 0, void 0, void 0, function* () {
            const newFolder = yield database_1.default.folder.create({
                data: {
                    name: folder.name,
                    parentId,
                    userId: req.user.id,
                },
            });
            for (const file of folder.files) {
                yield database_1.default.file.create({
                    data: {
                        name: file.name,
                        fileType: file.type,
                        size: file.size,
                        fileUrl: file.url,
                        folderId: newFolder.id,
                        userId: req.user.id,
                        mimeType: file.mimeType,
                    },
                });
            }
            for (const child of folder.children) {
                yield copyFolder(child, newFolder.id);
            }
            return newFolder;
        });
        const copiedFolder = yield copyFolder(sourceFolder, newParentId);
        res.status(201).json(copiedFolder);
    }
    catch (error) {
        res.status(500).json({ error: "Error copying folder" });
        next(error);
    }
});
exports.copyFolder = copyFolder;
const moveFolder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newParentId } = req.body;
        const folder = yield database_1.default.folder.update({
            where: { id: req.params.id, userId: req.user.id },
            data: { parentId: newParentId },
        });
        res.json(folder);
    }
    catch (error) {
        res.status(500).json({ error: "Error moving folder" });
        next(error);
    }
});
exports.moveFolder = moveFolder;
