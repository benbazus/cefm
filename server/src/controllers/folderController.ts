import { Request, Response, NextFunction } from 'express';
import * as folderService from '../services/folderService';
import UAParser from 'ua-parser-js';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import archiver from 'archiver';

interface UserInfo {
    ipAddress: string;
    userAgent: string;
    operatingSystem: string;
    browser: string;
    deviceType: string;
    deviceModel: string;
    deviceVendor: string;
    os: string;
}

export function getUserInfo(req: Request): UserInfo {
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    return {
        ipAddress: req.ip || req.connection.remoteAddress as string,
        userAgent: req.headers['user-agent'] || '',
        operatingSystem: result.os.name || 'Unknown',
        browser: result.browser.name || 'Unknown',
        deviceType: result.device.type || 'unknown',
        deviceModel: result.device.model || 'unknown',
        deviceVendor: result.device.vendor || 'unknown',
        os: result.os.name || 'unknown',
        //browser: result.browser.name || 'unknown'
    };
}

export const createNewFolder = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { folderName, parentFolderId } = req.body;
        const { userId } = req.user as { userId: string };

        const userInfo = getUserInfo(req);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });



        if (!folderName || typeof folderName !== 'string' || folderName.includes('/') || folderName.includes('\\')) {
            return res.status(400).json({ error: 'Invalid folder name' });
        }

        const folder = await folderService.createNewFolder(userId, folderName, parentFolderId, userInfo.ipAddress,
            userInfo.userAgent, userInfo.operatingSystem, userInfo.browser, userInfo.deviceType);

        res.status(201).json(`${folderName} created successfully`);

    } catch (error) {
        next(error);
    }
}

export const downloadFolder = async (req: Request, res: Response, next: NextFunction) => {

    const { folderId } = req.body;

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        if (!folder) {
            return res.status(404).json('Folder not found');
        }

        const folderPath = path.join(folder.folderPath as string);

        // Create a zip file
        const zipFileName = `${folder.name}.zip`;
        const zipFilePath = path.join(process.cwd(), zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip');

        output.on('close', () => {
            console.log(`Zipped ${archive.pointer()} total bytes.`);
        });

        archive.on('error', (err) => {
            throw err;
        });

        // Pipe the zip stream to the output file
        archive.pipe(output);

        // Append files from the folder
        archive.directory(folderPath, false);
        await archive.finalize();

        // Send the zip file as a response
        const zipFileStream = fs.createReadStream(zipFilePath);


        // const contentDisposition = file.mimeType.startsWith('image/') ? 'inline' : 'attachment';

        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        res.setHeader('Content-Type', 'application/zip');
        res.send(zipFileStream);

    } catch (error) {
        next(error);
    }
}

export const getChildrenFoldersByParentFolderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const { folderId } = req.params;
        const folder = await folderService.getFoldersAndFilesByFolderId(userId, folderId);

        res.status(201).json(folder);

    } catch (error) {
        next(error);
    }

}

export const getRootFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };

        const folder = await folderService.getRootFolder(userId);

        res.status(201).json(folder);

    } catch (error) {
        next(error);
    }
};

export const getRootChildren = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { userId } = req.user as { userId: string };

        const result = await folderService.getRootChildren(userId);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}


export const getFolderDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { folderId } = req.params;
        const folder = await folderService.getFolderDetails(folderId);
        res.json(folder);
    } catch (error) {
        next(error);
    }
};


export const getFileCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { folderId } = req.params;
        const count = await folderService.getFolderFileCount(folderId);
        res.json(count);
    } catch (error) {
        next(error);
    }
};



