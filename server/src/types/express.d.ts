import { User } from '@prisma/client';

import { User } from '@prisma/client'; // Assuming you're using Prisma

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string?;
                userId: string;
            };
            token?: string;
        }
    }
}


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