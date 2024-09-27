"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipFolder = void 0;
const archiver_1 = __importDefault(require("archiver"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const zipFolder = (folderPath) => {
    const archive = (0, archiver_1.default)('zip', {
        zlib: { level: 9 },
    });
    const stream = fs_extra_1.default.createWriteStream(path_1.default.join(folderPath, '..', 'temp.zip'));
    return new Promise((resolve, reject) => {
        archive
            .directory(folderPath, false)
            .on('error', (err) => reject(err))
            .pipe(stream);
        stream.on('close', () => resolve(fs_extra_1.default.createReadStream(path_1.default.join(folderPath, '..', 'temp.zip'))));
        archive.finalize();
    });
};
exports.zipFolder = zipFolder;
