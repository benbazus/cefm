
import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';
import prisma from '../config/database';
import { exec } from 'child_process'
import util from 'util'
const execPromise = util.promisify(exec)



export const mapNetworkDrive = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as { userId: string };
    const { driveLetter, networkPath } = req.body

    if (!driveLetter || !networkPath) {
        return res.status(400).json({ message: 'Drive letter and network path are required' })
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Map the network drive
        const command = `net use ${driveLetter}: "${networkPath}" /persistent:yes`
        await execPromise(command)

        // Save the mapping to the database
        await prisma.networkDrive.create({
            data: {
                userId: user.id,
                driveLetter,
                networkPath,
            },
        })

        res.status(200).json({ message: 'Network drive mapped successfully' })
    } catch (error) {
        console.error('Error mapping network drive:', error)
        res.status(500).json({ message: 'Error mapping network drive' })

        next(error);
    }
}