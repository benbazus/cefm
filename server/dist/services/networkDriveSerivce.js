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
exports.listFiles = listFiles;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
function listFiles(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, currentPath = '') {
        const user = yield database_1.default.user.findUnique({
            where: { id: userId },
            include: { networkDrives: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const localFiles = yield listLocalFiles(currentPath);
        const networkFiles = yield listNetworkFiles(user.networkDrives, currentPath);
        return [...localFiles, ...networkFiles];
    });
}
function listLocalFiles(currentPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseDir = process.env.LOCAL_STORAGE_PATH || '/app/storage';
        const fullPath = path_1.default.join(baseDir, currentPath);
        const entries = yield promises_1.default.readdir(fullPath, { withFileTypes: true });
        return entries.map((entry) => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            path: path_1.default.join(currentPath, entry.name),
            type: 'local',
        }));
    });
}
function listNetworkFiles(networkDrives, currentPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const networkFiles = [];
        for (const drive of networkDrives) {
            const fullPath = path_1.default.join(drive.networkPath, currentPath);
            try {
                const entries = yield promises_1.default.readdir(fullPath, { withFileTypes: true });
                networkFiles.push(...entries.map((entry) => ({
                    name: entry.name,
                    isDirectory: entry.isDirectory(),
                    path: path_1.default.join(drive.driveLetter + ':', currentPath, entry.name),
                    type: 'network',
                    driveLetter: drive.driveLetter,
                })));
            }
            catch (error) {
                console.error(`Error reading network drive ${drive.driveLetter}:`, error);
            }
        }
        return networkFiles;
    });
}
