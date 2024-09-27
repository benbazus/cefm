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
exports.mapNetworkDrive = void 0;
const database_1 = __importDefault(require("../config/database"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
const mapNetworkDrive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { driveLetter, networkPath } = req.body;
    if (!driveLetter || !networkPath) {
        return res.status(400).json({ message: 'Drive letter and network path are required' });
    }
    try {
        const user = yield database_1.default.user.findUnique({ where: { id: userId }, });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Map the network drive
        const command = `net use ${driveLetter}: "${networkPath}" /persistent:yes`;
        yield execPromise(command);
        // Save the mapping to the database
        yield database_1.default.networkDrive.create({
            data: {
                userId: user.id,
                driveLetter,
                networkPath,
            },
        });
        res.status(200).json({ message: 'Network drive mapped successfully' });
    }
    catch (error) {
        console.error('Error mapping network drive:', error);
        res.status(500).json({ message: 'Error mapping network drive' });
        next(error);
    }
});
exports.mapNetworkDrive = mapNetworkDrive;
