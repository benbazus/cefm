"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const { combine, timestamp, label, printf } = winston_1.default.format;
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(label({ label: 'file-manager-app-logs' }), timestamp(), logFormat),
    transports: [
        new winston_1.default.transports.Console({
            handleExceptions: true,
        }),
        new winston_1.default.transports.DailyRotateFile({
            filename: './logs/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
        }),
        new winston_1.default.transports.Http({
            host: 'localhost',
            port: 8080,
        }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: './logs/exceptions.log' }),
    ],
    exitOnError: false,
});
exports.default = logger;
