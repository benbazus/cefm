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
exports.generateUniqueId = exports.formatSize = exports.zipFolder = exports.generateOtp = exports.generateRandomPassword = exports.scanFileWithClamAV = exports.checkFileSignature = exports.isValidFile = exports.getBaseFolderPath = exports.createWriteStream = void 0;
exports.encodeFolderId = encodeFolderId;
exports.decodeFolder = decodeFolder;
const archiver_1 = __importDefault(require("archiver"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const child_process_1 = require("child_process");
const createWriteStream = (zipFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fs_extra_1.default.createWriteStream(zipFilePath);
});
exports.createWriteStream = createWriteStream;
const getBaseFolderPath = (email) => {
    return process.env.NODE_ENV === "production"
        ? path_1.default.join("/var/www/cefmdrive/storage", email)
        : path_1.default.join(process.cwd(), "public", "File Manager", email);
};
exports.getBaseFolderPath = getBaseFolderPath;
const isValidFile = (file) => {
    const extension = path_1.default.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    // Allowed file extensions
    const allowedExtensions = [
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg",
        ".docx",
        ".doc",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".aac",
        ".txt",
        ".zip",
        ".mp4",
        ".mov",
        ".avi",
        ".mkv",
        ".webm",
        ".mp3",
        ".wav",
        ".m4a",
        ".ogg",
    ];
    // Allowed MIME types
    const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "text/plain",
        "application/zip",
        "video/mp4",
        "video/x-msvideo",
        "video/x-matroska",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "audio/aac",
        "audio/flac",
        "audio/ogg",
        "audio/mp4",
    ];
    return (allowedExtensions.includes(extension) && allowedMimeTypes.includes(mimeType));
};
exports.isValidFile = isValidFile;
const checkFileSignature = (filePath) => {
    const buffer = fs_extra_1.default.readFileSync(filePath);
    const signature = buffer.toString("hex", 0, 4); // Read first 4 bytes
    // Check signatures for various formats
    switch (signature) {
        case "25504446": // PDF
            return true;
        case "d0cf11e0": // DOC, XLS (OLE Compound Document)
            return true;
        case "504b0304": // ZIP, DOCX, XLSX, PPTX
            return true;
        case "ffd8ffe0": // JPEG
            return true;
        case "89504e47": // PNG
            return true;
        case "000001ba": // MPEG Video
            return true;
        case "000001bc": // MPEG Video
            return true;
        default:
            return false; // Invalid or unknown format
    }
};
exports.checkFileSignature = checkFileSignature;
const scanFileWithClamAV = (filePath) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`clamscan ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error scanning file: ${stderr}`));
            }
            else {
                resolve(stdout.includes("OK"));
            }
        });
    });
};
exports.scanFileWithClamAV = scanFileWithClamAV;
const generateRandomPassword = (length) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};
exports.generateRandomPassword = generateRandomPassword;
const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    return { otp, otpExpires };
};
exports.generateOtp = generateOtp;
function getDetailedDeviceInfo(userAgent) {
    const parser = new ua_parser_js_1.default(userAgent);
    const result = parser.getResult();
    const isMobile = /Mobi/i.test(userAgent);
    const isTablet = /Tablet|iPad/i.test(userAgent);
    return {
        deviceType: isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop",
        os: result.os.name || "unknown",
        browser: result.browser.name || "unknown",
        deviceModel: result.device.model || "unknown",
        deviceVendor: result.device.vendor || "unknown",
    };
}
function getUserDevice(userAgent) {
    const parser = new ua_parser_js_1.default(userAgent);
    const result = parser.getResult();
    return {
        deviceType: result.device.type || "unknown",
        deviceModel: result.device.model || "unknown",
        deviceVendor: result.device.vendor || "unknown",
        os: result.os.name || "unknown",
        browser: result.browser.name || "unknown",
    };
}
function getDeviceType(userAgent) {
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") ||
        ua.includes("android") ||
        ua.includes("iphone")) {
        return "Mobile";
    }
    else if (ua.includes("ipad") || ua.includes("tablet")) {
        return "Tablet";
    }
    else {
        return "Desktop";
    }
}
function getDeviceInfo(userAgent) {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const osRegex = /(Android|iPhone OS|Mac OS X|Windows NT|Linux)/i;
    const browserRegex = /(Chrome|Firefox|Safari|Opera|Edge|MSIE)/i;
    return {
        isMobile: mobileRegex.test(userAgent),
        os: (userAgent.match(osRegex) || [])[1] || "unknown",
        browser: (userAgent.match(browserRegex) || [])[1] || "unknown",
    };
}
const zipFolder = (folderPath) => {
    const archive = (0, archiver_1.default)("zip", {
        zlib: { level: 9 },
    });
    const stream = fs_extra_1.default.createWriteStream(path_1.default.join(folderPath, "..", "temp.zip"));
    return new Promise((resolve, reject) => {
        archive
            .directory(folderPath, false)
            .on("error", (err) => reject(err))
            .pipe(stream);
        stream.on("close", () => resolve(fs_extra_1.default.createReadStream(path_1.default.join(folderPath, "..", "temp.zip"))));
        archive.finalize();
    });
};
exports.zipFolder = zipFolder;
const formatSize = (size) => {
    if (!size)
        return "N/A";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};
exports.formatSize = formatSize;
const generateUniqueId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    // Generate the first 10 characters
    for (let i = 0; i < 10; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Add the separator '#'
    id += "#";
    // Generate the last 10 characters
    for (let i = 0; i < 10; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
};
exports.generateUniqueId = generateUniqueId;
// Encode a folder ID
function encodeFolderId(folderId) {
    return btoa(folderId);
}
// Decode a folder ID
function decodeFolder(encodedFolderId) {
    return atob(encodedFolderId);
}
