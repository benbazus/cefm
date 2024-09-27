

import express from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { auth } from '../middleware/auth';

const router = express.Router();


router.get('/recent-activity', auth, dashboardController.getRecentActivity)
router.get('/storage-info', auth, dashboardController.getStorageInfo);
router.get('/user-stats', auth, dashboardController.getUserStats);
router.get('/total-files', auth, dashboardController.getTotalFiles);
router.get('/type-distribution', auth, dashboardController.getFileTypeDistribution);
router.get('/history', auth, dashboardController.getStorageUsageHistory);
router.get('/uploads-per-day', auth, dashboardController.getFileUploadsPerDay);

export { router as dashBoardRouter };