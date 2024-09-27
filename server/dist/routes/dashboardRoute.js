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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashBoardRouter = void 0;
const express_1 = __importDefault(require("express"));
const dashboardController = __importStar(require("../controllers/dashboardController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.dashBoardRouter = router;
router.get('/recent-activity', auth_1.auth, dashboardController.getRecentActivity);
router.get('/storage-info', auth_1.auth, dashboardController.getStorageInfo);
router.get('/user-stats', auth_1.auth, dashboardController.getUserStats);
router.get('/total-files', auth_1.auth, dashboardController.getTotalFiles);
router.get('/type-distribution', auth_1.auth, dashboardController.getFileTypeDistribution);
router.get('/history', auth_1.auth, dashboardController.getStorageUsageHistory);
router.get('/uploads-per-day', auth_1.auth, dashboardController.getFileUploadsPerDay);
