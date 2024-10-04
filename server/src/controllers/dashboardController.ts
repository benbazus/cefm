import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';

export const getTotalFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const totalCount = await dashboardService.getTotalFiles(userId);
        res.status(200).json(totalCount);
    } catch (error) {
        next(error);
    }
}

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const formattedActivity = await dashboardService.recentActivity(userId);
        res.status(200).json(formattedActivity);
    } catch (error) {
        next(error);
    }
}

export const getStorageInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const storageInfo = await dashboardService.storageInfo(userId);
        res.status(200).json(storageInfo);
    } catch (error) {
        next(error);
    }
}

export const getFileTypeDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const items = await dashboardService.getFileTypeDistribution(userId);
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}

export const getStorageUsageHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {


        const { userId } = req.user as { userId: string };
        const items = await dashboardService.getStorageUsageHistory(userId);
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}

export const getFileUploadsPerDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const items = await dashboardService.getFileUploadsPerDay(userId);
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const userStats = await dashboardService.userStats(userId);
        res.status(200).json(userStats);
    } catch (error) {
        next(error);
    }
}