import fs from 'fs/promises'
import path from 'path'
import prisma from '../config/database'
import { NetworkDrive } from '@prisma/client'


export async function listFiles(userId: string, currentPath: string = '') {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { networkDrives: true },
    })

    if (!user) {
        throw new Error('User not found')
    }

    const localFiles = await listLocalFiles(currentPath)
    const networkFiles = await listNetworkFiles(user.networkDrives, currentPath)

    return [...localFiles, ...networkFiles]
}

async function listLocalFiles(currentPath: string) {
    const baseDir = process.env.LOCAL_STORAGE_PATH || '/app/storage'
    const fullPath = path.join(baseDir, currentPath)

    const entries = await fs.readdir(fullPath, { withFileTypes: true })
    return entries.map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        path: path.join(currentPath, entry.name),
        type: 'local',
    }))
}

async function listNetworkFiles(networkDrives: NetworkDrive[], currentPath: string) {
    const networkFiles = []

    for (const drive of networkDrives) {
        const fullPath = path.join(drive.networkPath, currentPath)
        try {
            const entries = await fs.readdir(fullPath, { withFileTypes: true })
            networkFiles.push(
                ...entries.map((entry) => ({
                    name: entry.name,
                    isDirectory: entry.isDirectory(),
                    path: path.join(drive.driveLetter + ':', currentPath, entry.name),
                    type: 'network',
                    driveLetter: drive.driveLetter,
                }))
            )
        } catch (error) {
            console.error(`Error reading network drive ${drive.driveLetter}:`, error)
        }
    }

    return networkFiles
}