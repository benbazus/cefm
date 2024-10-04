import { User } from '@prisma/client';


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


export interface UserInfo {
    ipAddress: string;
    userAgent: string;
    operatingSystem: string;
    browser: string;
    deviceType: string;
    deviceModel: string;
    deviceVendor: string;
    os: string;
}


export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string | null;
        role: 'USER' | 'ADMIN';
    };
    token?: string;
}