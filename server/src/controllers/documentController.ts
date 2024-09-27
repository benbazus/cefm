
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendShareDocumentEmail, sendDocumentShareEmail } from '../utils/email';
import bcrypt from 'bcrypt';
import moment from 'moment';
import { generateRandomPassword } from '../utils/helpers';
import { DocumentAccess, Permission } from '@prisma/client';

import UAParser from 'ua-parser-js';
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
    };
}

export const shareDocument = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as { userId: string };
    const { documentId, email, message, date, permission, currentUrl, isPasswordEnabled } = req.body;

    try {
        let password;
        let hashedPassword;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const document = await prisma.document.findUnique({ where: { id: documentId } });

        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }

        if (isPasswordEnabled) {
            password = generateRandomPassword(10);
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await prisma.document.update({
            where: { id: documentId },
            data: {
                password: hashedPassword,
            },
        });

        await prisma.userPermission.create({
            data: {
                userId: userId,
                documentId: documentId,
                permission: permission,
            },
        });

        // Log the file activity
        await prisma.fileActivity.create({
            data: {
                userId: userId,
                documentId: documentId,
                activityType: "Document",
                action: `Shared document with ${email}`,
            },
        });

        await sendShareDocumentEmail(
            user?.email as string,
            email,
            message,
            document.title as string,
            password as string,
            date,
            permission,
            currentUrl
        );

        return res.json({ success: true, message: "Document shared successfully!" });
    } catch (error) {
        console.error("Error sharing document:", error);
        res.status(500).json({ error: "Failed to share document" });
        next(error);
    }
};

export const changeFileSharePermissionToUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user as { userId: string };
        const { documentId, permission } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const document = await prisma.document.findUnique({ where: { id: documentId } });

        const userPermission = await prisma.userPermission.findFirst({ where: { documentId: documentId } });

        if (userPermission) {
            await prisma.userPermission.update({
                where: { id: userPermission?.id },
                data: {
                    userId: user?.id,
                    documentId: document?.id,
                    permission: permission as Permission,
                    documentAccess: userPermission.documentAccess as DocumentAccess,
                },
            });
        }

        const documentUser = await prisma.documentUser.findFirst({ where: { userId, documentId } });

        await prisma.documentUser.update({
            where: { id: documentUser?.id, },
            data: {
                permission: permission as Permission,
                documentAccess: userPermission?.documentAccess as DocumentAccess,
            },
        });

        await prisma.fileActivity.create({
            data: {
                userId: userId,
                documentId: documentUser?.id,
                action: `Updated permission to ${permission} for document`,
            },
        });

        res.status(200).json({ message: 'Permission updated successfully' });
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ error: 'Failed to update permission' });
        next(error);
    }
};

export const shareDocumentToUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, message, documentId, permission, currentUrl, documentAccess } = req.body;
        const { userId } = req.user as { userId: string };

        console.log(' ++++++++shareDocumentToUser 0000000 +++++++++++++++ ')
        console.log(documentId)
        console.log(email)
        console.log(message)
        console.log(permission)
        console.log(currentUrl)
        console.log(documentAccess)
        console.log(' ++++++++shareDocumentToUser 0000000 +++++++++++++++ ')

        const document = await prisma.document.findUnique({ where: { id: documentId } });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check if the user exists, if not create a new user
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0], // Use the part before @ as the name
                },
            });
        }


        const documentUser = await prisma.documentUser.create({
            data: {
                userId,
                documentId: document.id,
                permission: permission as Permission,
                documentAccess: documentAccess as DocumentAccess,
            },
        });


        // Create UserPermission
        await prisma.userPermission.create({
            data: {
                userId: user.id,
                documentId: document.id,
                permission: permission as Permission,
                documentAccess: documentAccess as DocumentAccess,
            },
        });

        // Create SharedFile
        await prisma.sharedFile.create({
            data: {
                userId: user.id,
                sharedUrl: currentUrl,
                documentUserId: documentUser.id,
                shareableType: 'Document',
                sharedWith: email,
                shareWithMessage: message,
            },
        });

        // Log the file activity
        await prisma.fileActivity.create({
            data: {
                userId: user.id,
                documentId: documentUser.id,
                activityType: "Document",
                action: `Shared document with ${email}`,
            },
        });


        await sendDocumentShareEmail(
            user.name as string,
            user.email as string,
            email,
            message,
            currentUrl,
            permission,
            document.title as string
        );

        res.status(200).json({ message: 'Document shared successfully' });
    } catch (error) {
        console.error('Error sharing document:', error);
        res.status(500).json({ error: 'Failed to share document' });
        next(error);
    }
};

export const fetchDocumentUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { userId } = req.user as { userId: string };
        const { documentId } = req.params;

        const documentUsers = await prisma.documentUser.findMany({
            where: { documentId: documentId as string, userId: userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        const users = documentUsers.map((du) => ({
            id: du.user.id,
            name: du.user.name,
            email: du.user.email,
            permission: du.permission,
            sharedDate: du.createdAt ? moment(du.createdAt).format('DD MMM YYYY HH:mm:ss') : null,
        }));

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching document users:', error);
        res.status(500).json({ error: 'Failed to fetch document users' });
        next(error);
    }
};
