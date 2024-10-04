
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import prisma from '../config/database';



// const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

// export const limitStorageUsage = async (req: Request, res: Response, next: NextFunction) => {

//     const { name, email, password, role } = req.body;

//     const user = await prisma.user.findUnique({
//         where: { email: req.user.email },
//         include: { files: true },
//     });

//     const totalSize = user?.files.reduce((acc, file) => acc + file.size, 0) || 0;

//     if (totalSize >= MAX_TOTAL_SIZE) {
//         return res.status(403).json({ message: 'Storage limit exceeded (2GB)' });
//     }

//     next();
// };


export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await userService.getUsers();
        res.send(users);

    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        await userService.createUser(name, email, password, role);

        res.json('user created successfully');
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        await userService.updateUser(id, name, email, role);

        res.json('user updated successfully');

    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);

        res.send({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {

        res.send(req.user);

    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

