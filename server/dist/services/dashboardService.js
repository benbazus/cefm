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
exports.getFileUploadsPerDay = exports.getFileTypeDistribution = exports.getStorageUsageHistory = exports.userStats = exports.storageInfo = exports.recentActivity = exports.getTotalFiles = void 0;
const database_1 = __importDefault(require("../config/database"));
const getTotalFiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const totalFiles = yield database_1.default.file.count({ where: { userId } });
    return totalFiles;
});
exports.getTotalFiles = getTotalFiles;
const recentActivity = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recentActivities = yield database_1.default.fileActivity.findMany({
            take: 10,
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                File: {
                    select: {
                        name: true,
                    },
                },
                Folder: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        // Ensure that we return an array of RecentActivity
        return recentActivities.map((activity) => {
            var _a, _b;
            return ({
                id: activity.id,
                fileName: ((_a = activity.File) === null || _a === void 0 ? void 0 : _a.name) || ((_b = activity.Folder) === null || _b === void 0 ? void 0 : _b.name) || "Unknown File",
                action: activity.action,
                timestamp: activity.createdAt, // Keep as Date type
            });
        });
    }
    catch (error) {
        console.error("Error fetching recent activity:", error);
        throw new Error("Failed to fetch recent activity");
    }
});
exports.recentActivity = recentActivity;
const storageInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.default.user.findFirst({ where: { id: userId } });
    if (user) {
        const maxStorageSize = user.maxStorageSize;
        const totalUsed = yield database_1.default.file.aggregate({
            _sum: {
                size: true,
            },
            where: {
                userId: userId,
                trashed: false,
            },
        });
        const documentUsage = yield database_1.default.file.aggregate({
            _sum: {
                size: true,
            },
            where: {
                userId: userId,
                trashed: false,
                mimeType: {
                    startsWith: "application/",
                },
            },
        });
        const imageUsage = yield database_1.default.file.aggregate({
            _sum: {
                size: true,
            },
            where: {
                userId: userId,
                trashed: false,
                mimeType: {
                    startsWith: "image/",
                },
            },
        });
        const mediaUsage = yield database_1.default.file.aggregate({
            _sum: {
                size: true,
            },
            where: {
                userId: userId,
                trashed: false,
                mimeType: {
                    startsWith: "video/",
                },
            },
        });
        return {
            used: totalUsed._sum.size || 0,
            total: maxStorageSize || 0,
            date: "",
            documentUsage: documentUsage._sum.size || 0,
            imageUsage: imageUsage._sum.size || 0,
            mediaUsage: mediaUsage._sum.size || 0,
        };
    }
    else {
        return null;
    }
});
exports.storageInfo = storageInfo;
const userStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const totalCount = yield database_1.default.user.count({
        where: {
            id: userId,
            lastActive: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in the last 30 days
            },
        },
    });
    return { totalCount };
});
exports.userStats = userStats;
const getStorageUsageHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const history = yield database_1.default.storageHistory.findMany({
        where: { userId },
        orderBy: { timestamp: "asc" },
    });
    if (history.length === 0) {
        return null;
    }
    return history.map((entry) => ({
        used: entry.usedStorage,
        date: entry.timestamp.toISOString().split("T")[0],
        total: entry.totalStorage,
        documentUsage: 0,
        imageUsage: 0,
        mediaUsage: 0,
    }));
});
exports.getStorageUsageHistory = getStorageUsageHistory;
const getFileTypeDistribution = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const distribution = yield database_1.default.file.groupBy({
        by: ["fileType"],
        _count: { id: true },
        where: { userId },
    });
    const labels = distribution
        .map((item) => item.fileType)
        .filter((fileType) => fileType !== null && fileType !== undefined);
    const data = distribution.map((item) => item._count.id);
    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
                borderColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
                borderWidth: 1,
            },
        ],
    };
});
exports.getFileTypeDistribution = getFileTypeDistribution;
const getFileUploadsPerDay = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const uploads = yield database_1.default.$queryRaw `
        SELECT
            TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') as date,
            COUNT(id) as count
        FROM "files"
        WHERE "userId" = ${userId}
        AND "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt");
    `;
    const labels = uploads.map((upload) => upload.date);
    const data = uploads.map((upload) => Number(upload.count));
    return {
        labels,
        datasets: [
            {
                label: "File Uploads",
                data,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    };
});
exports.getFileUploadsPerDay = getFileUploadsPerDay;
