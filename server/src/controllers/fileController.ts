
import { Request, Response, NextFunction } from 'express';
import * as fileService from './../services/fileService';
import * as folderService from '../services/folderService';
import * as userService from '../services/userService';
import prisma from '../config/database';
import archiver from 'archiver';
import path from 'path';
import busboy from 'busboy';
import { File, Prisma, User } from '@prisma/client';
import { config } from '../config/config';
import { zipFolder as createZipFolder } from './../utils/zipFolder';
import { sendSharedLinkEmail } from '../utils/email';
import { checkFileSignature, decodeFolder, formatSize, isValidFile, scanFileWithClamAV } from '../utils/helpers';
import logger from '../utils/logger';
import { getFileById } from './../services/fileService';
import UAParser from 'ua-parser-js';
import mime from 'mime-types';

import sharp from 'sharp';

import { fromPath } from 'pdf2pic';

import fs from 'fs-extra';

import { promisify } from 'util';
import { exec } from 'child_process';

import { createReadStream, createWriteStream } from 'fs';
import { pipeline as streamPipeline } from 'stream';
import { UserInfo } from '../types/express';



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


export const handleFileUpload = async (req: Request, res: Response) => {
    try {

        const files = req.files as Express.Multer.File[];
        const parentId = req.body.parentId;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedFiles = files.map(file => {
            const filePath = file.path.replace(config.uploadDir, '').replace(/\\/g, '/');
            const dirPath = path.dirname(filePath);

            // Create directories if they don't exist
            if (dirPath !== '/') {
                fs.mkdirSync(path.join(config.uploadDir, dirPath), { recursive: true });
            }

            return {
                originalName: file.originalname,
                fileName: file.filename,
                path: filePath,
                size: file.size,
                mimeType: file.mimetype,
                parentId: parentId
            };
        });


        res.status(200).json({
            message: 'Files uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Error in file upload:', error);
        res.status(500).json({ message: 'Error uploading files', error: (error as Error).message });
    }
};

export const fileUpload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {


    const bb = busboy({ headers: req.headers });
    const uploadPromises: Promise<any>[] = [];

    const { userId } = req.user as { userId: string };
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];


    let folderId: string | null = null;
    let baseFolderPath = '';
    let fileRelativePath = '';

    bb.on('field', (name, val) => {
        if (name === 'folderId') {
            folderId = val;
        }
        if (name === 'relativePath') {
            fileRelativePath = val;
        }
    });

    try {
        bb.on('file', async (name, file, info) => {
            const { filename, mimeType } = info;

            const relativePath = fileRelativePath ? fileRelativePath.split('/') : [];
            relativePath.pop();

            if (folderId) {
                const folderResponse = await folderService.getFolderById(folderId);
                if (folderResponse) {
                    baseFolderPath = folderResponse.folderPath as string;
                }
            }

            const user = await userService.getUserById(userId) as User;


            if (!baseFolderPath) {
                baseFolderPath = path.join(process.cwd(), 'public', 'File Manager', user?.email as string);
            }

            const fullPath = path.join(baseFolderPath, ...relativePath, filename);
            const fileUrl = `${process.env.PUBLIC_APP_URL}/File Manager/${encodeURIComponent(userId)}/${encodeURIComponent(filename)}`;

            const writeStream = fs.createWriteStream(fullPath);
            file.pipe(writeStream);

            const uploadPromise = new Promise((resolve, reject) => {
                writeStream.on('finish', async () => {
                    try {
                        const stats = await fs.promises.stat(fullPath);
                        const fileData = await prisma.file.create({
                            data: {
                                name: filename,
                                filePath: fullPath,
                                fileUrl: fileUrl,
                                mimeType: mimeType,
                                size: stats.size,
                                userId: userId,
                                folderId: folderId,
                            },
                        });
                        resolve(fileData);
                    } catch (error) {
                        reject(error);
                    }
                });

                writeStream.on('error', (error) => {
                    reject(error);
                });
            });

            uploadPromises.push(uploadPromise);
        });

        bb.on('finish', async () => {
            try {
                const results = await Promise.all(uploadPromises);
                res.json({ message: 'Files uploaded successfully', files: results });
            } catch (error) {
                console.error('Error uploading files:', error);
                res.status(500).json({ error: 'Error uploading files' });
            }
        });

        req.pipe(bb);
    } catch (error) {
        next(error);
    }
};

export const fileUpload11 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const bb = busboy({ headers: req.headers });
    const uploadPromises: Promise<any>[] = []; // Store promises for file uploads

    const { userId } = req.user as { userId: string }; // Ensure userId is defined
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];


    console.log(" ++++++++++++ fileUpload +++++++++++++++++++ ");
    console.log({ userId });
    console.log(" +++++++++++ fileUpload ++++++++++++++++++++ ");



    let folderId: string | null = null; // Initialize folderId
    let baseFolderPath = '';
    let fileRelativePath = '';

    // Handle fields from the form
    bb.on('field', (name, val) => {
        if (name === 'folderId') {
            folderId = val;
        }
        if (name === 'relativePath') {
            fileRelativePath = val;
        }
    });

    try {
        // Handle file uploads
        bb.on('file', async (name, file, info) => {
            const { filename, mimeType } = info;

            // Use the received relative path or create an empty array if undefined
            const relativePath = fileRelativePath ? fileRelativePath.split('/') : [];
            relativePath.pop(); // Remove filename from path

            // Determine base folder path
            if (folderId) {
                const folderResponse = await folderService.getFolderById(folderId);
                if (folderResponse) {
                    baseFolderPath = folderResponse.folderPath as string;
                }
            }

            const user = await userService.getUserById(userId) as User;

            console.log(" ++++++++++++ fileUpload user+++++++++++++++++++ ");
            console.log(user);
            console.log(" +++++++++++ fileUpload user++++++++++++++++++++ ");


            // // Set base folder path if not provided
            if (!baseFolderPath) {
                baseFolderPath = path.join(process.cwd(), 'public', 'File Manager', user?.email as string);
            }

            const fullPath = path.join(baseFolderPath, ...relativePath, filename);
            const fileUrl = `${process.env.PUBLIC_APP_URL}/File Manager/${encodeURIComponent(userId)}/${encodeURIComponent(filename)}`;


            // Stream file to disk
            const writeStream = fs.createWriteStream(fullPath);
            file.pipe(writeStream);

            // Handle file upload completion and save data to DB
            const uploadPromise = new Promise((resolve, reject) => {
                writeStream.on('finish', async () => {
                    try {

                        //const stats = await fs.stat(fullPath);
                        // const fileData = await prisma.file.create({
                        //     data: {
                        //         name: filename,
                        //         filePath: fullPath,
                        //         fileUrl: fileUrl,
                        //         mimeType: mimeType,
                        //         userId: userId,
                        //         folderId: folderId,
                        //     },
                        // });

                        // resolve(fileData);
                    } catch (error) {
                        reject(error);
                    }
                });

                writeStream.on('error', (error) => {
                    reject(error);
                });
            });

            uploadPromises.push(uploadPromise);
        });

        // When all files have been processed
        bb.on('finish', async () => {
            try {
                const results = await Promise.all(uploadPromises);
                res.json({ message: 'Files uploaded successfully', files: results });
            } catch (error) {
                console.error('Error uploading files:', error);
                res.status(500).json({ error: 'Error uploading files' });
            }
        });

        // Start the Busboy process
        req.pipe(bb);
    } catch (error) {
        next(error);
    }
}

export const checkPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { password, fileId } = req.body;

        if (!password || !fileId) {
            return res.status(400).json('Missing required password or fileId');
        }

        const uploadedFile = await fileService.checkPassword(password, fileId);
        res.status(201).json(uploadedFile);
    } catch (error) {
        next(error);
    }
}

export const uploadFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const { parentFolderId } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ message: 'No folder uploaded' });
        }

        const uploadedFolder = await folderService.createFolder(userId, parentFolderId, req.body.folderName);

        for (const [path, fileArray] of Object.entries(files)) {
            const file = fileArray[0];
            const pathParts = path.split('/');
            pathParts.pop();

            let currentFolderId = uploadedFolder.id;
            for (const folderName of pathParts) {
                const folder = await folderService.findOrCreateFolder(userId, currentFolderId, folderName);
                currentFolderId = folder.id;
            }

            await fileService.uploadFile(userId, currentFolderId, file);
        }

        res.status(201).json(uploadedFolder);
    } catch (error) {
        next(error);
    }
};

export const uploadFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const { folderId } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedFiles: File[] = [];
        for (const file of files) {
            const uploadedFile = await fileService.uploadFile(userId, folderId, file);
            uploadedFiles.push(uploadedFile as File);
        }

        res.status(201).json(uploadedFiles);
    } catch (error) {
        next(error);
    }
};

export const uploadFilee = async (file: Express.Multer.File) => {




    const uploadPath = path.join(__dirname, '../../uploads', file.originalname);
    fs.writeFileSync(uploadPath, file.buffer);
    return uploadPath;
};



export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bb = busboy({ headers: req.headers });
        const uploadPromises: Promise<any>[] = [];
        const { userId } = req.user as { userId: string };

        const userInfo = getUserInfo(req);

        const ipAddress = userInfo.ipAddress;
        const userAgent = userInfo.userAgent;
        const device = userInfo.deviceType;
        const operatingSystem = userInfo.operatingSystem;
        const browser = userInfo.browser;

        let folderId: string | null = null;
        let baseFolderPath = '';
        let fileRelativePath = '';

        bb.on('field', (name, val) => {
            if (name === 'folderId') {
                folderId = val;
            }
            if (name === 'relativePath') {
                fileRelativePath = val;
            }
        });

        bb.on('file', async (name, fileStream, info) => {
            const { filename, mimeType } = info;

            const relativePath = fileRelativePath ? fileRelativePath.split('/') : [];
            relativePath.pop();

            if (folderId) {
                const folderResponse = await folderService.getFolderById(folderId);
                if (folderResponse) {
                    baseFolderPath = folderResponse.folderPath as string;
                }
            }


            const user = await prisma.user.findUnique({ where: { id: userId } });

            // const user = await userService.getUserById(userId);
            if (!baseFolderPath) {
                baseFolderPath = path.join(process.cwd(), 'public', 'File Manager', user?.email as string);
            }

            const fullPath = path.join(baseFolderPath, ...relativePath, filename);
            const fileUrl = `${process.env.PUBLIC_APP_URL}/File Manager/${encodeURIComponent(user?.email as string)}/${encodeURIComponent(filename)}`;

            const writeStream = fs.createWriteStream(fullPath);
            fileStream.pipe(writeStream);

            uploadPromises.push(new Promise(async (resolve, reject) => {
                writeStream.on('finish', async () => {
                    try {
                        const stats = await fs.promises.stat(fullPath);



                        //TODO
                        // Check if the file is valid
                        // if (!isValidFile(filename)) {
                        //     fs.unlinkSync(fullPath);

                        //     return reject(new Error('Invalid file type.'));
                        // }

                        // Validate file signature
                        // if (!checkFileSignature(fullPath)) {
                        //     fs.unlinkSync(fullPath);
                        //     return reject(new Error('Invalid file signature.'));
                        // }

                        // Scan the file with ClamAV for viruses
                        // const isClean = await scanFileWithClamAV(fullPath);
                        //  if (!isClean) {
                        //     fs.unlinkSync(fullPath);
                        //     return reject(new Error('File contains malware.'));
                        // }



                        // Check storage usage before saving the file
                        const currentStorage = await prisma.storageHistory.findFirst({
                            where: { userId: userId },
                            orderBy: { createdAt: 'desc' },
                        });

                        const newUsedStorage = (currentStorage?.usedStorage || 0) + stats.size;
                        const maxStorageSize = user?.maxStorageSize as number || 0;

                        if (newUsedStorage > maxStorageSize) {
                            fs.unlinkSync(fullPath);
                            return reject(new Error('Storage limit exceeded. File not saved.'));
                        }

                        // Determine file type
                        let fileType = '';
                        const extension = path.extname(filename).toLowerCase();
                        const mimeTypes: { [key: string]: string } = {
                            '.pdf': 'Adobe Portable Document Format (PDF)',
                            '.xlsx': 'Microsoft Excel Spreadsheet (XLSX)',
                            '.xls': 'Microsoft Excel Spreadsheet (XLS)',
                            '.png': 'PNG Image',
                            '.jpg': 'JPEG Image',
                            '.jpeg': 'JPEG Image',
                            '.doc': 'Microsoft Word Document',
                            '.docx': 'Microsoft Word Document',
                            '.ppt': 'Microsoft PowerPoint Presentation',
                            '.pptx': 'Microsoft PowerPoint Presentation',
                            '.txt': 'Plain Text File',
                            '.zip': 'ZIP Archive',
                            '.mp4': 'Video File',
                            '.mov': 'Video File',
                            '.avi': 'Video File',
                            '.mkv': 'Video File',
                            '.webm': 'Video File',
                            '.mp3': 'Audio File',
                            '.wav': 'Audio File',
                            '.aac': 'Audio File',
                            '.flac': 'Audio File',
                            '.ogg': 'Audio File',
                            '.m4a': 'Audio File',
                        };
                        fileType = mimeTypes[extension] || mimeType;

                        if (!folderId) {
                            const folder = await prisma.folder.findFirst({ where: { name: user?.email as string } });
                            folderId = folder?.id || null;
                        }

                        const fileData = await prisma.file.create({
                            data: {
                                name: filename,
                                filePath: fullPath,
                                fileUrl: fileUrl,
                                mimeType: mimeType,
                                size: stats.size,
                                userId: userId,
                                folderId: folderId,
                                fileType: fileType,
                            },
                        });

                        // Log the file activity
                        await prisma.fileActivity.create({
                            data: {
                                userId,
                                fileId: fileData.id,
                                activityType: 'File',
                                action: 'CREATE FILE',
                                ipAddress,
                                userAgent,
                                device,
                                operatingSystem,
                                browser,
                                filePath: fullPath,
                                fileSize: stats.size,
                                fileType: fileType,
                            },
                        });

                        // Update storage history
                        const totalStorage = user?.maxStorageSize || 0;
                        const storageUsagePercentage = (newUsedStorage / Math.max(totalStorage, 1)) * 100;
                        const overflowStorage = Math.max(0, newUsedStorage - totalStorage);

                        await prisma.storageHistory.create({
                            data: {
                                userId: userId,
                                usedStorage: newUsedStorage,
                                totalStorage: totalStorage,
                                storageType: 'file',
                                storageLocation: baseFolderPath,
                                storageUsagePercentage: Math.min(storageUsagePercentage, 100),
                                storageLimit: totalStorage,
                                overflowStorage: overflowStorage,
                                notificationSent: storageUsagePercentage > 90,
                            },
                        });

                        resolve(fileData);
                    } catch (error) {
                        reject(error);
                    }
                });

                writeStream.on('error', (error) => {
                    reject(error);
                });
            }));
        });

        bb.on('finish', async () => {
            try {
                const results = await Promise.all(uploadPromises);
                res.json({ message: 'Files uploaded successfully', files: results });
            } catch (error: any) {
                if (error.message === 'Storage limit exceeded. File not saved.') {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'Error uploading files' });
                }
            }
        });

        req.pipe(bb);

    } catch (error) {
        next(error);
    }
};



export const uploadFile1 = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const bb = busboy({ headers: req.headers });
        const uploadPromises: Promise<any>[] = [];
        const { userId } = req.user as { userId: string };

        const userInfo = getUserInfo(req);

        const ipAddress = userInfo.ipAddress;
        const userAgent = userInfo.userAgent;
        const device = userInfo.deviceType;
        const operatingSystem = userInfo.operatingSystem;
        const browser = userInfo.browser;


        console.log(" ============BBBBB================= ")
        console.log(userId)
        console.log(" ===========BBBBBBBBBBB================== ")

        let folderId: string | null = null;
        let baseFolderPath = '';
        let fileRelativePath = '';

        bb.on('field', (name, val) => {
            if (name === 'folderId') {
                folderId = val;
            }
            if (name === 'relativePath') {
                fileRelativePath = val;
            }
        });


        bb.on('file', async (name, file, info) => {
            const { filename, mimeType } = info;

            const relativePath = fileRelativePath ? fileRelativePath.split('/') : [];
            relativePath.pop();

            if (folderId) {
                const folderResponse = await folderService.getFolderById(folderId);
                if (folderResponse) {
                    baseFolderPath = folderResponse.folderPath as string;
                }
            }

            const user = await userService.getUserById(userId) as User;



            if (!baseFolderPath) {
                baseFolderPath = path.join(process.cwd(), 'public', 'File Manager', user?.email as string);
            }

            const fullPath = path.join(baseFolderPath, ...relativePath, filename);
            const fileUrl = `${process.env.PUBLIC_APP_URL}/File Manager/${encodeURIComponent(user.email as string)}/${encodeURIComponent(filename)}`;



            const writeStream = fs.createWriteStream(fullPath);
            file.pipe(writeStream);



            const uploadPromise = new Promise((resolve, reject) => {
                writeStream.on('finish', async () => {
                    try {

                        console.log(" +++++ 000 fileUpload user 000 +++++ ");
                        console.log(folderId);
                        console.log(userId);
                        console.log(fullPath);
                        console.log(fileUrl);
                        console.log(" +++++ 000 fileUpload user 000 ++++ ");

                        const stats = await fs.promises.stat(fullPath);
                        const fileData = await prisma.file.create({
                            data: {
                                name: filename,
                                filePath: fullPath,
                                fileUrl: fileUrl,
                                mimeType: mimeType,
                                size: stats.size,
                                userId: userId,
                                folderId: folderId,
                                fileType: '', //Add appropriate file Type here
                            },
                        });
                        resolve(fileData);


                        await prisma.fileActivity.create({
                            data: {
                                userId,
                                fileId: fileData.id,
                                activityType: 'File',
                                action: 'CREATE FILE',
                                ipAddress,
                                userAgent,
                                device,
                                operatingSystem,
                                browser,
                                filePath: `${fullPath}`,
                                fileSize: stats.size,
                                fileType: 'File',
                            },
                        });


                        await prisma.storageHistory.create({
                            data: {
                                userId: userId,
                                usedStorage: 100,
                                totalStorage: 1000,
                                storageType: 'file',
                                storageLocation: 'storageLocation',
                                storageUsagePercentage: 10,
                                storageLimit: 1000,
                                overflowStorage: 10,
                                notificationSent: false
                            },
                        });


                    } catch (error) {
                        reject(error);
                    }
                });

                writeStream.on('error', (error) => {
                    reject(error);
                });
            });

            uploadPromises.push(uploadPromise);
        });

        bb.on('finish', async () => {
            try {
                const results = await Promise.all(uploadPromises);
                res.json({ message: 'Files uploaded successfully', files: results });
            } catch (error) {
                console.error('Error uploading files:', error);
                res.status(500).json({ error: 'Error uploading files' });
            }
        });

        req.pipe(bb);

    } catch (error) {
        next(error);
    }
};



export const downloadFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.info('Starting file download process', { fileId: req.params.itemId });

        const fileId = req.params.itemId as string;

        // Fetch the file from the database
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            logger.error('File not found in the database', { fileId });
            return res.status(404).json({ message: 'File not found.' });
        }

        const filePath = path.join(file.filePath as string);

        // Check if file exists on the server
        if (!fs.existsSync(filePath)) {
            logger.error('File not found on the server', { filePath });
            return res.status(404).json({ message: 'File not found on the server.' });
        }

        // // Log the file download action in fileActivity
        // await prisma.fileActivity.create({
        //     data: {
        //         userId: 'userId', // Replace this with dynamic userId from your auth system
        //         fileId: fileId,
        //         action: 'download file',
        //     },
        // });

        logger.info('File download action logged', { fileId });

        // Read the file stream
        const fileStream = fs.createReadStream(filePath);

        // Set appropriate headers
        const contentDisposition = file.mimeType.startsWith('image/') ? 'inline' : 'attachment';
        res.setHeader('Content-Disposition', `${contentDisposition}; filename="${encodeURIComponent(file.name)}"`);
        res.setHeader('Content-Type', file.mimeType);

        // Pipe the file stream to the response
        fileStream.pipe(res);

        fileStream.on('end', () => {
            logger.info('File download successful', { fileId });
        });

        fileStream.on('error', (err) => {
            logger.error('Error while downloading file', { fileId, error: err.message });
            next(err);
        });

    } catch (error) {
        logger.error('Error in downloadFiles function', { error: (error as Error).message });
        next(error);
    }
};





export const downloadFile = async (req: Request, res: Response) => {
    const fileId = req.params.itemId as string;

    try {
        const file = await getFileById(fileId);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = file.filePath as string;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on the server' });
        }

        // Determine the MIME type
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';

        // Get the file name and encode it for the Content-Disposition header
        const fileName = encodeURIComponent(path.basename(filePath));

        // Set the appropriate headers
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            res.status(500).json({ error: 'Error streaming file' });
        });

        fileStream.pipe(res);

    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




export const createDocument = async (req: Request, res: Response) => {

    const fileId = req.params.itemId as string;

    try {

        res.status(201).json('Document created successfully!!!!!!');
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const downloadFolder = async (req: Request, res: Response) => {

    const folderId = req.params.itemId as string;

    try {
        const folder = await folderService.getFolderById(folderId);

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderPath = folder.folderPath as string;

        if (!fs.existsSync(folderPath)) {
            logger.error(`Folder does not exist on the server, ${folderPath}`);
            return res.status(500).json({ error: 'Folder does not exist on the file system' });
        }

        const zipStream = await createZipFolder(folderPath);

        zipStream.pipe(res);

    } catch (error) {
        console.error('Error downloading folder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const downloadFolders = async (req: Request, res: Response, next: NextFunction) => {
    const folderId = req.params.itemId as string;

    logger.info('Request to download folder', { folderId });

    try {
        // Fetch folder data from the database
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        if (!folder) {
            logger.error('Folder not found in the database', { folderId });
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Define the folder path based on folderPath stored in the database
        const folderPath = path.join(folder.folderPath as string);

        logger.info('Folder path resolved', { folderId, folderPath });


        // Check if the folder exists on the file system
        if (!fs.existsSync(folderPath)) {
            logger.error('Folder does not exist on the server', { folderPath });
            return res.status(404).json({ message: 'Folder does not exist on the server' });
        }

        // Create a zip file
        const zipFileName = `${folder.name}.zip`;
        const zipFilePath = path.join(process.cwd(), zipFileName);
        // const zipFilePath = path.join(folderPath, zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            logger.info(`Zipped ${archive.pointer()} total bytes.`, { zipFileName, folderId });
        });

        archive.on('error', (err) => {
            logger.error('Error occurred while zipping folder', { error: err.message });
            throw err;
        });

        // Pipe the zip stream to the output file
        archive.pipe(output);

        // Append the folder and its subfolders/files to the archive
        archive.directory(folderPath, false);



        // Finalize the archive to finish the zip creation
        await archive.finalize();

        // Wait until the zip file is ready before streaming it to the client
        output.on('finish', async () => {
            logger.info('ZIP file creation completed', { zipFilePath });

            // Set response headers for downloading the zip file
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

            // Stream the zip file to the client
            const zipFileStream = fs.createReadStream(zipFilePath);
            zipFileStream.pipe(res);

            // Cleanup the zip file after download
            zipFileStream.on('end', () => {
                logger.info('ZIP file streamed to client, deleting file', { zipFilePath });
                fs.unlinkSync(zipFilePath); // Delete the zip file from the server after streaming
            });

            // try {
            //     // Log the file download action in fileActivity
            //     await prisma.fileActivity.create({
            //         data: {
            //             userId: req.userId, // Make sure userId is dynamically passed from authentication
            //             fileId: folderId,
            //             action: 'download folder',
            //         },
            //     });
            // } catch (activityError) {
            //     logger.error('Error logging file activity', { error: activityError });
            // }
        });

    } catch (error) {
        logger.error('An error occurred while downloading the folder', { error: (error as Error).message });
        next(error);
    }
};

export const deletePermanently = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as { userId: string };
    const { fileType, fileId } = req.params


    try {



        const document = await prisma.document.findUnique({ where: { id: fileId }, });
        if (document) {


            if (!document) {
                return res.status(404).json({ error: `File with ID ${fileId} not found.` });
            }

            await prisma.document.delete({
                where: { id: fileId },
            });

            return res.status(404).json({ success: `File with ID ${fileId} deleted permanently.` });
        }



        if (fileType === 'Folder') {

            // console.log(' +++++++++++++++type FOLDER+++++++++++++++++++++++ ')
            //  console.log({ id, type })
            // console.log(' +++++++++++++++++type+++++++++++++++++++++ ')

            const folder = await prisma.folder.findUnique({
                where: { id: fileId },
            });

            if (!folder) {
                return res.status(404).json({ error: `Folder with ID ${fileId} not found.` });
            }

            // Define folder path
            const folderPath = path.join(folder.folderPath as string);

            // Delete folder from the file system
            await fs.rm(folderPath, { recursive: true, force: true });

            // Delete folder from database
            await prisma.folder.delete({ where: { id: fileId }, });

            return res.status(201).json({ success: `Folder with ID ${fileId} deleted permanently.` });
        }

        if (fileType === 'File') {


            const file = await prisma.file.findUnique({ where: { id: fileId }, });

            if (!file) {
                return res.status(404).json({ error: `File with ID ${fileId} not found.` });
            }

            // Define file path
            const filePath = path.join(file.filePath as string);

            // Delete file from the file system
            await fs.unlink(filePath);

            // Delete file from database
            await prisma.file.delete({
                where: { id: fileId },
            });

            return res.status(404).json({ success: `File with ID ${fileId} deleted permanently.` });
        }

    } catch (error) {
        logger.error('An error occurred while downloading the folder', { error });
        next(error);
    }
};

export const restoreFile = async (req: Request, res: Response, next: NextFunction) => {

    const { fileType, fileId } = req.params


    try {

        if (fileType === 'Folder') {
            const folder = await prisma.folder.findUnique({
                where: { id: fileId },
            });

            if (!folder) {
                return { error: `folder with ID ${fileId} not found.` };
            }

            const updatedFolder = await prisma.folder.update({
                where: { id: fileId },
                data: { trashed: false },
            });

            return { success: `Folder with ID ${fileId} restored`, updatedFolder };

        }

        if (fileType === 'File') {
            const file = await prisma.file.findUnique({
                where: { id: fileId },
            });

            if (!file) {
                return { error: `File with ID ${fileId} not found.` };
            }

            const updatedFile = await prisma.file.update({
                where: { id: fileId },
                data: { trashed: false },
            });

            return { success: `File with ID ${fileId} restored`, updatedFile };
        }


    } catch (error) {
        console.error(`Error restoring file with ID ${fileId} :`, error);
        throw new Error(`Failed to restore file with ID ${fileId} .`);
    }
};



const generatePreview = async (filePath: string, mimeType: string, email: string): Promise<string | null> => {
    try {
        const previewDir = path.join(process.cwd(), 'public', 'File Manager', email, 'previews');

        // Ensure the preview directory exists using async methods
        await fs.mkdir(previewDir, { recursive: true });

        const previewFileName = `${path.basename(filePath, path.extname(filePath))}_preview.png`;
        const previewPath = path.join(previewDir, previewFileName);

        if (mimeType.startsWith('image/')) {
            // Handle image preview generation using async/await
            await sharp(filePath)
                .resize({ width: 200, height: 200, fit: 'inside' })
                .toFile(previewPath);
        } else if (mimeType === 'application/pdf') {
            // Handle PDF preview generation
            const options = {
                density: 100,
                saveFilename: path.basename(filePath, path.extname(filePath)),
                savePath: previewDir,
                format: 'png',
                width: 200,
                height: 200,
            };

            const pdfConverter = fromPath(filePath, options);
            await pdfConverter(1); // Convert first page to image

            // Handle the generated PDF image file
            const generatedFileName = `${options.saveFilename}.1.png`;
            const generatedFilePath = path.join(previewDir, generatedFileName);

            // Rename the generated PDF preview to match our naming convention
            await fs.rename(generatedFilePath, previewPath);
        } else {
            // Return null for unsupported file types
            return null;
        }

        // Return the path to the generated preview image
        return `/previews/${previewFileName}`;
    } catch (error) {
        console.error('Error generating preview:', error);
        return null;
    }
};


const generatePreview4 = async (filePath: string, mimeType: string, email: string): Promise<string | null> => {
    const previewDir = path.join(process.cwd(), 'public', 'File Manager', email, 'previews');
    if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(previewDir, { recursive: true });
    }

    const previewFileName = `${path.basename(filePath, path.extname(filePath))}_preview.png`;
    const previewPath = path.join(previewDir, previewFileName);



    try {
        if (mimeType.startsWith('image/')) {
            // Create a readable stream from the original file and a writable stream to the preview file
            const readStream = createReadStream(filePath);
            const writeStream = createWriteStream(previewPath);

            // Pipe the original image to the preview image
            await promisify(streamPipeline)(readStream, writeStream);
        } else if (mimeType === 'application/pdf') {
            // For PDF files, directly copy the first page as the preview
            const readStream = createReadStream(filePath);
            const writeStream = createWriteStream(previewPath);

            await promisify(streamPipeline)(readStream, writeStream);
        } else {
            return null; // No preview for unsupported file types
        }

        console.log(" ============generate R E T U R N Preview================= ");
        console.log(previewFileName);
        console.log(previewPath);
        console.log(`/previews/${previewFileName}`);
        console.log(" ============generate R E T U R N Preview================= ");


        const route = `/File Manager/${email}/previews/${previewFileName}`;
        return route;
        // return `/${previewDir}/${previewFileName}`;
    } catch (error) {
        console.error('Error generating preview:', error);
        return null;
    }
};

const execAsync = promisify(exec);

const generatePreview2 = async (filePath: string, mimeType: string, email: string): Promise<string | null> => {
    const previewDir = path.join(process.cwd(), 'public', 'File Manager', email, 'previews');
    await fs.ensureDir(previewDir);

    const previewFileName = `${path.basename(filePath, path.extname(filePath))}_preview.png`;
    const previewPath = path.join(previewDir, previewFileName);

    console.log(" ============generatePreview================= ");
    console.log(previewFileName);
    console.log(previewPath);
    console.log(" ===========generatePreview================== ");

    try {
        if (mimeType.startsWith('image/')) {
            await generateImagePreview(filePath, previewPath);
        } else if (mimeType === 'application/pdf') {
            await generatePdfPreview(filePath, previewPath);
        } else {
            return null; // No preview for unsupported file types
        }

        return `/previews/${previewFileName}`;
    } catch (error) {
        console.error('Error generating preview:', error);
        return null;
    }
};

const generateImagePreview = async (filePath: string, previewPath: string): Promise<void> => {
    await sharp(filePath)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .toFile(previewPath);
};

const generatePdfPreview = async (filePath: string, previewPath: string): Promise<void> => {
    const tempOutputPath = `${previewPath}.temp.png`;

    try {
        // Use ImageMagick to convert PDF to PNG
        await execAsync(`magick convert -density 150 -quality 90 -background white -alpha remove "${filePath}[0]" -resize 200x200 "${tempOutputPath}"`);

        // Use sharp to ensure the output is in PNG format and to apply any additional processing if needed
        await sharp(tempOutputPath)
            .png()
            .toFile(previewPath);
    } finally {
        // Clean up the temporary file
        await fs.remove(tempOutputPath);
    }
};

const generatePreview1 = async (filePath: string, mimeType: string, email: string): Promise<string | null> => {
    const previewDir = path.join(process.cwd(), 'public', 'File Manager', email, 'previews');
    if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(previewDir, { recursive: true });
    }

    const previewFileName = `${path.basename(filePath, path.extname(filePath))}_preview.png`;
    const previewPath = path.join(previewDir, previewFileName);


    console.log(" ============generatePreview================= ")
    console.log(previewFileName)
    console.log(previewPath)
    console.log(" ===========generatePreview================== ")

    try {
        if (mimeType.startsWith('image/')) {
            await sharp(filePath)
                .resize(200, 200, { fit: 'inside' })
                .toFile(previewPath);
        } else if (mimeType === 'application/pdf') {
            const options = {
                density: 100,
                saveFilename: path.basename(filePath, path.extname(filePath)),
                savePath: previewDir,
                format: "png",
                width: 200,
                height: 200
            };
            const convert = fromPath(filePath, options);
            const pageToConvertAsImage = 1;
            await convert(pageToConvertAsImage);

            // Rename the generated file to match our naming convention
            const generatedFileName = `${options.saveFilename}.1.png`;
            const generatedFilePath = path.join(previewDir, generatedFileName);
            fs.renameSync(generatedFilePath, previewPath);
        } else {
            return null; // No preview for unsupported file types
        }

        return `/previews/${previewFileName}`;
    } catch (error) {
        console.error('Error generating preview:', error);
        return null;
    }
};

// const generatePreview = async (filePath: string, mimeType: string): Promise<string | null> => {
//     const previewDir = path.join(process.cwd(), 'public', 'previews');
//     if (!fs.existsSync(previewDir)) {
//         fs.mkdirSync(previewDir, { recursive: true });
//     }

//     const previewFileName = `${path.basename(filePath, path.extname(filePath))}_preview.png`;
//     const previewPath = path.join(previewDir, previewFileName);

//     try {
//         if (mimeType.startsWith('image/')) {
//             await sharp(filePath)
//                 .resize(200, 200, { fit: 'inside' })
//                 .toFile(previewPath);
//         } else if (mimeType === 'application/pdf') {
//             const pdfBytes = await fs.promises.readFile(filePath);
//             const pdfDoc = await PDFDocument.load(pdfBytes);
//             const firstPage = pdfDoc.getPages()[0];
//             const pngImage = await firstPage.exportAsPNG({ scale: 0.5 });
//             await sharp(pngImage)
//                 .resize(200, 200, { fit: 'inside' })
//                 .toFile(previewPath);
//         } else {
//             return null; // No preview for unsupported file types
//         }

//         return `/previews/${previewFileName}`;
//     } catch (error) {
//         console.error('Error generating preview:', error);
//         return null;
//     }
// };

export const previewFile = async (req: Request, res: Response, next: NextFunction) => {

    try {




        //   const file = await prisma.file.findUnique({ where: { id: req.params.fileId }, });


        // if (!file) {
        //     return res.status(404).json({ error: 'File not found' });
        // }


        const file = await prisma.file.findUnique({
            where: { id: String(req.params.fileId) },
            include: { user: true },
        })

        if (!file) {
            return res.status(404).json({ message: 'File not found' })
        }

        // if (file.userId !== userId) {
        //     return res.status(403).json({ message: 'Access denied' })
        // }

        if (!fs.existsSync(file.filePath as string)) {
            return res.status(404).json({ error: 'File not found on the server' });
        }

        //const filePath = path.join(process.cwd(), file.filePath as string)
        const filePath = path.join(file.filePath as string)
        const fileContent = fs.readFileSync(filePath)

        res.setHeader('Content-Type', file.mimeType)
        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`)
        res.send(fileContent)

        // const filePath = file.filePath as string;

        // // Set appropriate headers for preview
        // res.setHeader('Content-Type', file.mimeType);
        // res.sendFile(filePath);

        // res.json(file);

    } catch (error) {
        next(error);
    }
}

export const downloadFolders1 = async (req: Request, res: Response, next: NextFunction) => {
    const fileId = req.query.fileId as string;
    //const { userId } = req.user as { userId: string };

    console.log(" ++++++ downloadFolders ++++++++++ ")
    console.log(req.params.itemId)
    console.log(" +++++ downloadFolders +++++++++++ ")


    const file = await prisma.file.findUnique({
        where: { id: fileId },
    });

    if (!file) {
        throw new Error('File not found.');
    }

    const filePath = path.join(file.filePath as string);

    if (!fs.existsSync(filePath)) {
        throw new Error('File not found on server');
    }

    await prisma.fileActivity.create({
        data: {
            //  userId: userId,
            fileId: fileId,
            action: 'download',
        },
    });

    const fileBuffer = fs.readFileSync(filePath);

    const contentDisposition = file.mimeType.startsWith('image/') ? 'inline' : 'attachment';

    res.setHeader('Content-Disposition', `${contentDisposition}; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.send(fileBuffer);
};

export const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const { folderId } = req.query;

        const files = await fileService.getFiles(userId, folderId as string | undefined);
        res.json(files);
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const { fileId } = req.params;

        await fileService.deleteFile(userId, fileId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const document = await fileService.getDocuments(userId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }
}

export const getCustomDocuments = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const document = await fileService.getCustomDocuments(userId);


        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }
}

export const getShared = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const document = await fileService.getShared(userId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }
}

export const getTrashed = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const document = await fileService.getTrashed(userId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }

}

export const getPdf = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const items = await fileService.getPDFFiles(userId);
        if (!items) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(items);
    } catch (error) {
        next(error);
    }
}

export const getVideo = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const items = await fileService.getVideoFiles(userId);
        if (!items) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json(items);
    } catch (error) {
        next(error);
    }
}

export const getAudio = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const items = await fileService.getAudioFiles(userId);
        if (!items) {
            return res.status(404).json({ message: 'Audio not found' });
        }
        res.json(items);
    } catch (error) {
        next(error);
    }
}

export const getWord = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const document = await fileService.getWordFiles(userId);
        if (!document) {
            return res.status(404).json({ message: 'Word not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }
}

export const getPhotos = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    try {

        const document = await fileService.getPhotos(userId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }
}

export const getExcelFiles = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as { userId: string };

    try {

        const document = await fileService.getExcelFiles(userId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }

}

export const getSharedWithMe = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as { userId: string };

    try {

        const document = await fileService.getSharedWithMe(userId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        next(error);
    }

}

export const renameFile = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };
    const { fileId } = req.params;
    const { newName } = req.body;

    try {



        const file = await fileService.renameFile(fileId, userId, newName);

        res.json(file);

    } catch (error) {
        next(error);
    }
};

export const getFileDetails = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { fileId } = req.params;


        const file = await fileService.getFileDetails(fileId);



        res.json(file);
    } catch (error) {
        next(error);
    }
};

export const moveToTrash = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { userId } = req.user as { userId: string };
        const { fileId } = req.params;

        const file = await fileService.moveToTrash(fileId, userId);

        res.json(file);
    } catch (error) {
        next(error);
    }
};

export const shareLink = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.user as { userId: string };



    try {
        const file = await prisma.file.findUnique({
            where: { id: String(req.params.fileId) },
            include: { user: true },
        })

        if (!file) {
            return res.status(404).json({ message: 'File not found' })
        }

        // if (file.userId !== userId) {
        //     return res.status(403).json({ message: 'Access denied' })
        // }

        const fileLink = `${process.env.PUBLIC_APP_URL}/api/files/preview/${file.id}`
        res.status(200).json({ link: fileLink })
    } catch (error) {
        console.error('Error getting file link:', error)
        res.status(500).json({ message: 'Error getting file link' })
    }
}

interface ShareableLinkEmailParams {
    toEmail: string;
    message?: string;
    fromEmail: string;
    shareableLink: string;
}

export const sharedFile = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const encodedFileId = decodeFolder(req.params.fileId);


        // Find the shared file or folder record
        const sharedItem = await prisma.sharedFile.findFirst({
            where: { sharedUrl: encodedFileId },
        });

        if (!sharedItem) {
            console.log('File or folder not found.');
            return res.status(404).json({ message: 'Item not found' });
        }


        // Check for expiration
        const currentDate = new Date();
        if (sharedItem.expirationDate && sharedItem.expirationDate < currentDate) {
            return res.status(400).json({ message: 'The link has expired.' });
        }

        // Check if the shared item is a file or folder
        if (sharedItem.shareableType) {
            if (sharedItem.shareableType === "File") {
                // Find the actual file in the database
                const file = await prisma.file.findUnique({
                    where: { id: sharedItem.fileId as string },
                });

                if (!file) {
                    return res.status(400).json({ message: 'File record not found.' });
                }

                // Prepare data to be returned
                const data = {
                    name: file.name,
                    size: file.size,
                    mimeType: file.mimeType,
                    itemId: file.id,
                    isPasswordEnabled: sharedItem.isPasswordEnabled,
                    shareableType: "File"
                };
                return res.status(200).json(data);
            }

            if (sharedItem.shareableType === "Folder") {
                // Find the actual folder in the database
                const folder = await prisma.folder.findUnique({
                    where: { id: sharedItem.folderId as string },
                });

                if (!folder) {
                    return res.status(400).json({ message: 'Folder record not found.' });
                }

                // console.log('++++++++++++Folder+++++++++++++++++++++');
                // console.log(folder);
                // console.log('++++++++++++Folder+++++++++++++++++++++');

                // Prepare data to be returned
                const data = {
                    name: folder.name,
                    size: folder.size,
                    // mimeType: folder.mimeType,
                    itemId: folder.id,
                    isPasswordEnabled: sharedItem.isPasswordEnabled,
                    shareableType: "Folder"
                };
                return res.status(200).json(data);
            }
        }

        // If shareableType is not recognized
        return res.status(400).json({ message: 'Invalid shareable type' });

    } catch (error) {
        console.error('Error fetching shared file/folder:', error);
        return next(error); // Pass the error to the error handling middleware
    }
};



export const copyLink = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { userId } = req.user as { userId: string };
        const { itemId } = req.params;

        const fileToShare = await fileService.shareLink(userId, itemId);

        res.json(fileToShare.url);
    } catch (error) {
        next(error);
    }
};



export const shareFile = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { userId } = req.user as { userId: string };
        const { fileId, sharedWith, password, expirationDate, shareWithMessage, isPasswordEnabled, isExpirationEnabled } = req.body;


        const user = await userService.getUserById(userId);
        if (user) {

            const fileToShare = await fileService.shareFile(userId, fileId, password, sharedWith, shareWithMessage, isPasswordEnabled, expirationDate, isExpirationEnabled);
            if (fileToShare.url) {


                console.log(" ++++ shareFile user  fileToShare +++++ ")
                console.log(fileToShare)
                console.log(" ++++ shareFile user  fileToShare +++++ ")


                const emailParams = {
                    toEmail: sharedWith,
                    message: shareWithMessage,
                    fromEmail: user.email,
                    shareableLink: fileToShare.url
                } as ShareableLinkEmailParams

                await sendSharedLinkEmail(emailParams);
            }
        }


        res.json('success');
    } catch (error) {
        next(error);
    }
};


//TODO
// export const getAllFiles = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const files = await prisma.file.findMany({
//             include: {
//                 owner: {
//                     select: {
//                         name: true,
//                     },
//                 },
//                 sharedWith: {
//                     select: {
//                         user: {
//                             select: {
//                                 name: true,
//                             },
//                         },
//                     },
//                 },
//             },
//         })

//         const formattedFiles = files.map((file) => ({
//             id: file.id,
//             name: file.name,
//             type: file.type,
//             size: file.size,
//             createdAt: file.createdAt,
//             updatedAt: file.updatedAt,
//             sharedWith: file.sharedWith.map((share) => share.user.name),
//             owner: file.owner.name,
//             mimeType: file.mimeType,
//         }))

//         res.json(formattedFiles)
//     } catch (error) {
//         console.error('Error fetching files:', error)
//         res.status(500).json({ error: 'Internal server error' })
//     }
// }