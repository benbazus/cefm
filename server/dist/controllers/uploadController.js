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
exports.fileUpload = exports.uploadStatus = exports.uploadRequest = void 0;
const folderService = __importStar(require("../services/folderService"));
const userService = __importStar(require("../services/userService"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const busboy_1 = __importDefault(require("busboy"));
const promises_1 = require("fs/promises");
const database_1 = __importDefault(require("../config/database"));
// Helper to get file details using promisified stat
const getFileDetails = (filePath) => (0, promises_1.stat)(filePath);
// Function to generate a unique alphanumeric ID
const uniqueAlphaNumericId = (() => {
    const heyStack = "0123456789abcdefghijklmnopqrstuvwxyz";
    const randomInt = () => Math.floor(Math.random() * heyStack.length);
    return (length = 24) => Array.from({ length }, () => heyStack[randomInt()]).join("");
})();
// Function to generate the file path based on fileName and fileId
const getFilePath = (fileName, fileId) => `./uploads/file-${fileId}-${fileName}`;
const uploadRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body || !req.body.fileName) {
        res.status(400).json({ message: 'Missing "fileName"' });
    }
    else {
        const fileId = uniqueAlphaNumericId();
        fs_1.default.createWriteStream(getFilePath(req.body.fileName, fileId), {
            flags: "w",
        });
        res.status(200).json({ fileId });
    }
});
exports.uploadRequest = uploadRequest;
// // Upload Request Handler
// export const uploadRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { fileName } = req.body;
//         const { userId } = req.user as { userId: string };
//         if (!fileName || !userId) {
//             res.status(400).json({ message: 'Missing "fileName" or "userId"' });
//         }
//         const fileId = uniqueAlphaNumericId();
//         const filePath = getFilePath(fileName, fileId);
//         // Create an empty file
//         await fs.writeFile(filePath, '');
//         // Save file metadata to the database
//         await fileService.saveFileMetadata(fileName, filePath, 0, 'unknown', userId); // 0 size for an empty file, will be updated later
//         res.status(200).json({ fileId });
//     } catch (error) {
//         next(error);
//     }
// };
const uploadStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req.query && req.query.fileName && req.query.fileId) {
        getFileDetails(getFilePath((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.fileName, req.query.fileId))
            .then((stats) => {
            res.status(200).json({ totalChunkUploaded: stats.size });
        })
            .catch((err) => {
            console.error("failed to read file", err);
            res
                .status(400)
                .json({
                message: "No file with such credentials",
                credentials: req.query,
            });
        });
    }
});
exports.uploadStatus = uploadStatus;
const fileUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const contentRange = req.headers["content-range"];
    if (!contentRange) {
        res.status(400).json({ message: "Missing required headers" });
    }
    const match = contentRange === null || contentRange === void 0 ? void 0 : contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);
    if (!match) {
        res.status(400).json({ message: 'Invalid "Content-Range" format' });
    }
    // const [_, rangeStartStr, rangeEndStr, fileSizeStr] = match;
    // const rangeStart = Number(rangeStartStr);
    // const rangeEnd = Number(rangeEndStr);
    // const fileSize = Number(fileSizeStr);
    // if (rangeStart >= fileSize || rangeStart >= rangeEnd || rangeEnd > fileSize) {
    //     res.status(400).json({ message: 'Invalid "Content-Range" provided' });
    // }
    //============================================================
    const bb = (0, busboy_1.default)({ headers: req.headers });
    const uploadPromises = [];
    const { userId } = req.user;
    console.log(" ++++++++++++ fileUpload +++++++++++++++++++ ");
    console.log({ userId });
    console.log(" +++++++++++ fileUpload ++++++++++++++++++++ ");
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
            const writeStream = fs_1.default.createWriteStream(fullPath);
            file.pipe(writeStream);
            const uploadPromise = new Promise((resolve, reject) => {
                writeStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        const stats = yield fs_1.default.promises.stat(fullPath);
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
// export const uploadChunk = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//         const { name, currentChunkIndex, totalChunks } = req.query;
//         const data = req.body.toString();
//         console.log(" +++++++++++++++uploadChunk+++++++++++++++++ ")
//         console.log(name)
//         console.log(currentChunkIndex)
//         console.log(totalChunks)
//         console.log({ data })
//         console.log(" +++++++++++++++uploadChunk+++++++++++++++++ ")
//         //const { name, size, currentChunkIndex, totalChunks } = req.query;
//         if (typeof name !== 'string' || typeof currentChunkIndex !== 'string' || typeof totalChunks !== 'string') {
//             res.status(400).json({ error: 'Invalid query parameters' });
//             return;
//         }
//         const firstChunk = parseInt(currentChunkIndex) === 0;
//         const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
//         const ext = name.split('.').pop() || '';
//         const buffer = Buffer.from(data.split(',')[1], 'base64');
//         const tmpFilename = `tmp_${md5(name + ip)}.${ext}`;
//         const tmpFilePath = `${config.UPLOAD_DIR}/${tmpFilename}`;
//         // If it's the first chunk, check and delete any existing temporary file asynchronously
//         if (firstChunk) {
//             try {
//                 await fs.access(tmpFilePath); // Check if the file exists
//                 await fs.unlink(tmpFilePath); // If it exists, delete it
//             } catch (error) {
//                 //if (error?.code !== 'ENOENT') {
//                 //    throw error; // Only throw an error if it's not a "file not found" error
//                 //}
//             }
//         }
//         // Append the current chunk to the temporary file
//         await fs.appendFile(tmpFilePath, buffer);
//         // If it's the last chunk, rename the temporary file to its final name
//         if (lastChunk) {
//             const finalFilename = `${md5(Date.now().toString()).substr(0, 6)}.${ext}`;
//             const finalFilePath = `${config.UPLOAD_DIR}/${finalFilename}`;
//             await fs.rename(tmpFilePath, finalFilePath);
//             return { finalFilename };
//         }
//         res.json();
//     } catch (error) {
//         next(error);
//     }
// }
