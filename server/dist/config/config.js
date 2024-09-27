"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    uploadDir: process.env.UPLOAD_DIR || path_1.default.join(__dirname, '..', 'uploads'),
    defaultUploadDir: path_1.default.resolve(process.env.DEFAULT_UPLOAD_DIR || 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB by default
    UPLOAD_DIR: './uploads/',
    CHUNK_SIZE: 10 * 1024 * 1024, // 10MB
};
