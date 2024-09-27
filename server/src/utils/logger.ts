import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        label({ label: 'file-manager-app-logs' }),
        timestamp(),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
        }),
        new winston.transports.DailyRotateFile({
            filename: './logs/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
        }),
        new winston.transports.Http({
            host: 'localhost',
            port: 8080,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: './logs/exceptions.log' }),
    ],
    exitOnError: false,
});

export default logger;