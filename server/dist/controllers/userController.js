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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const userService = __importStar(require("../services/userService"));
// const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
// export const limitStorageUsage = async (req: Request, res: Response, next: NextFunction) => {
//     const { name, email, password, role } = req.body;
//     const user = await prisma.user.findUnique({
//         where: { email: req.user.email },
//         include: { files: true },
//     });
//     const totalSize = user?.files.reduce((acc, file) => acc + file.size, 0) || 0;
//     if (totalSize >= MAX_TOTAL_SIZE) {
//         return res.status(403).json({ message: 'Storage limit exceeded (2GB)' });
//     }
//     next();
// };
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userService.getUsers();
        res.send(users);
    }
    catch (error) {
        next(error);
    }
});
exports.getUsers = getUsers;
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        yield userService.createUser(name, email, password, role);
        res.json('user created successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.createUser = createUser;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        yield userService.updateUser(id, name, email, role);
        res.json('user updated successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield userService.deleteUser(id);
        res.send({ message: 'User deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(req.user);
    }
    catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
});
exports.getMe = getMe;
