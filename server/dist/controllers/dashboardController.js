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
exports.getUserStats = exports.getFileUploadsPerDay = exports.getStorageUsageHistory = exports.getFileTypeDistribution = exports.getStorageInfo = exports.getRecentActivity = exports.getTotalFiles = void 0;
const dashboardService = __importStar(require("../services/dashboardService"));
const getTotalFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const totalCount = yield dashboardService.getTotalFiles(userId);
        res.status(200).json(totalCount);
    }
    catch (error) {
        next(error);
    }
});
exports.getTotalFiles = getTotalFiles;
const getRecentActivity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const formattedActivity = yield dashboardService.recentActivity(userId);
        res.status(200).json(formattedActivity);
    }
    catch (error) {
        next(error);
    }
});
exports.getRecentActivity = getRecentActivity;
const getStorageInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const storageInfo = yield dashboardService.storageInfo(userId);
        res.status(200).json(storageInfo);
    }
    catch (error) {
        next(error);
    }
});
exports.getStorageInfo = getStorageInfo;
const getFileTypeDistribution = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const items = yield dashboardService.getFileTypeDistribution(userId);
        res.status(200).json(items);
    }
    catch (error) {
        next(error);
    }
});
exports.getFileTypeDistribution = getFileTypeDistribution;
const getStorageUsageHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const items = yield dashboardService.getStorageUsageHistory(userId);
        res.status(200).json(items);
    }
    catch (error) {
        next(error);
    }
});
exports.getStorageUsageHistory = getStorageUsageHistory;
const getFileUploadsPerDay = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const items = yield dashboardService.getFileUploadsPerDay(userId);
        res.status(200).json(items);
    }
    catch (error) {
        next(error);
    }
});
exports.getFileUploadsPerDay = getFileUploadsPerDay;
const getUserStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const userStats = yield dashboardService.userStats(userId);
        res.status(200).json(userStats);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserStats = getUserStats;
