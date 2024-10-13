import { Request, Response, NextFunction } from "express";
import * as folderService from "../services/folderService";
import UAParser from "ua-parser-js";
import path from "path";
import { formatSize, getBaseFolderPath } from "../utils/helpers";
import prisma from "../config/database";
import archiver from "archiver";
import { createReadStream, createWriteStream, promises as fs } from "fs";
import { copyFile, mkdir } from "fs/promises";
import { chmod } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { rm } from "fs/promises";

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
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  return {
    ipAddress: req.ip || (req.connection.remoteAddress as string),
    userAgent: req.headers["user-agent"] || "",
    operatingSystem: result.os.name || "Unknown",
    browser: result.browser.name || "Unknown",
    deviceType: result.device.type || "unknown",
    deviceModel: result.device.model || "unknown",
    deviceVendor: result.device.vendor || "unknown",
    os: result.os.name || "unknown",
    //browser: result.browser.name || 'unknown'
  };
}

// Helper function to build folder hierarchy
const buildFolderTree = (folders: any[], parentId: string | null): any[] => {
  return folders
    .filter((folder) => folder.parentId === parentId)
    .map((folder) => ({
      id: folder.id,
      name: folder.name,
      children: buildFolderTree(folders, folder.id),
    }));
};

export const getFoldersTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user as { userId: string };

    // Fetch all folders for the user
    const folders = await prisma.folder.findMany({
      where: { userId },
    });

    if (!folders || folders.length === 0) {
      return res.status(404).json({ error: "No folders found for this user" });
    }

    // Build the folder tree starting from the root (null parentId)
    const folderTree = buildFolderTree(folders, null);

    // Send response
    res.status(200).json(folderTree);
  } catch (error) {
    console.error("Error retrieving folders:", error);
    res.status(500).json({
      error: "Failed to retrieve folders",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

import { access, constants } from "fs/promises";

export const deleteFolderPermanently = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params;
    const { userId } = req.user as { userId: string };

    // Find the folder
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Check if the user has write permissions on the folder
    if (folder.folderPath) {
      try {
        await access(folder.folderPath, constants.W_OK);
      } catch (error) {
        return res.status(403).json({
          error:
            "Permission denied. You don't have write access to this folder.",
        });
      }
    }

    // Recursively delete all subfolders and files
    const deleteRecursive = async (folderId: string) => {
      // Delete all file activities related to files in this folder
      await prisma.fileActivity.deleteMany({
        where: { File: { folderId } },
      });

      // Delete all files in the folder
      await prisma.file.deleteMany({
        where: { folderId },
      });

      // Delete all folder activities related to this folder
      await prisma.fileActivity.deleteMany({
        where: { folderId },
      });

      // Delete all folder versions related to this folder
      await prisma.folderVersion.deleteMany({
        where: { folderId },
      });

      // Find all subfolders
      const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId },
      });

      // Recursively delete subfolders
      for (const subfolder of subfolders) {
        await deleteRecursive(subfolder.id);
      }

      // Delete the folder itself
      await prisma.folder.delete({
        where: { id: folderId },
      });
    };

    // Start the recursive deletion
    await deleteRecursive(folderId);

    // Delete the folder from the file system
    if (folder.folderPath) {
      try {
        await rm(folder.folderPath, { recursive: true, force: true });
      } catch (error) {
        console.error("Error deleting folder from file system:", error);
        return res
          .status(500)
          .json({ error: "Failed to delete folder from file system" });
      }
    }

    // Log the activity
    await prisma.fileActivity.create({
      data: {
        userId,
        folderId,
        activityType: "Folder",
        action: "DELETE_PERMANENT",
        filePath: folder.folderPath || "",
        fileSize: 0,
        fileType: "folder",
      },
    });

    res
      .status(200)
      .json({ message: "Folder and its contents permanently deleted" });
  } catch (error) {
    console.error("Error deleting folder permanently:", error);
    res.status(500).json({
      error: "Failed to delete folder permanently",
      details: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
};

export const restoreFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params;
    const { userId } = req.user as { userId: string };

    // Find the folder
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    if (!folder.trashed) {
      return res.status(400).json({ error: "Folder is not in trash" });
    }

    // Restore the folder
    const restoredFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { trashed: false },
    });

    // Log the activity
    await prisma.fileActivity.create({
      data: {
        userId,
        folderId: restoredFolder.id,
        activityType: "Folder",
        action: "RESTORE",
        filePath: restoredFolder.folderPath,
        fileSize: 0, // Folders don't have a size
        fileType: "folder",
      },
    });

    res
      .status(200)
      .json({ message: "Folder restored successfully", restoredFolder });
  } catch (error) {
    console.error("Error restoring folder:", error);
    res.status(500).json({
      error: "Failed to restore folder",
      details: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
};

export const moveFolderToTrash = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params;
    const { userId } = req.user as { userId: string };

    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    await prisma.folder.update({
      where: { id: folderId },
      data: { trashed: true },
    });

    await prisma.fileActivity.create({
      data: {
        action: "moveToTrash",
        userId,
        folderId,
        activityType: "Folder",
      },
    });

    res.status(200).json({ message: "Folder moved to trash successfully" });
  } catch (error) {
    console.error("Error moving folder to trash:", error);
    next(error);
  }
};

export const renameFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params;
    const { newName } = req.body;
    const { userId } = req.user as { userId: string };

    // Validate input
    if (
      !newName ||
      typeof newName !== "string" ||
      newName.includes("/") ||
      newName.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid folder name" });
    }

    // Find the folder
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Construct new paths
    const oldPath = folder.folderPath as string;
    const newPath = path.join(path.dirname(oldPath), newName);
    const newUrl = folder.folderUrl?.replace(
      encodeURIComponent(folder.name),
      encodeURIComponent(newName)
    );
    const newLocation = folder.location?.replace(folder.name, newName);

    // Ensure the user has write permissions
    try {
      await chmod(oldPath, 0o755);
    } catch (chmodError) {
      console.error("Error changing permissions:", chmodError);
      return res
        .status(500)
        .json({ error: "Failed to change folder permissions." });
    }

    // Rename the folder in the file system
    try {
      await fs.rename(oldPath, newPath);
    } catch (fsError: any) {
      console.error("File system error:", fsError);
      if (fsError.code === "EPERM") {
        return res.status(403).json({
          error: "Permission denied. Unable to rename the folder.",
          details: fsError.message,
        });
      }
      return res.status(500).json({
        error: `Failed to rename folder in the file system: ${fsError.message}`,
      });
    }

    const latestVersion = await prisma.folderVersion.findFirst({
      where: { folderId: folder.id },
      orderBy: { versionNumber: "desc" },
    });
    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create a folder version before updating
    await prisma.folderVersion.create({
      data: {
        id: uuidv4(),
        folderId: folder.id,
        name: folder.name,
        folderPath: folder.folderPath,
        folderUrl: folder.folderUrl,
        location: folder.location,
        versionNumber: newVersionNumber,
        userId: folder.userId,
        createdAt: new Date(),
      },
    });

    // Update the folder in the database
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        name: newName,
        folderPath: newPath,
        folderUrl: newUrl,
        location: newLocation,
        versionNumber: {
          increment: 1,
        },
      },
    });

    // Log the activity
    await prisma.fileActivity.create({
      data: {
        userId,
        folderId: updatedFolder.id,
        activityType: "Folder",
        action: "RENAME",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"] || "",
        device: "unknown", // Consider implementing a function to get device info
        operatingSystem: "unknown", // Same as above
        browser: "unknown", // Same as above
        filePath: newPath,
        fileSize: 0, // Folders don't have a size
        fileType: "folder",
      },
    });

    return res
      .status(200)
      .json({ message: "Folder renamed successfully", folder: updatedFolder });
  } catch (error) {
    console.error("Error renaming folder:", error);

    return res.status(500).json({
      error: `Failed to rename folder: ${
        error instanceof Error ? error.message : "An unexpected error occurred."
      }`,
      details: error instanceof Error ? error.stack : undefined,
    });
  }
};

export const createNewFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderName, parentFolderId } = req.body;
    const { userId } = req.user as { userId: string };

    const userInfo = getUserInfo(req);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (
      !folderName ||
      typeof folderName !== "string" ||
      folderName.includes("/") ||
      folderName.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid folder name" });
    }

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const email = user?.email as string;

    const baseFolder = getBaseFolderPath(email);

    let newFolderPath: string;
    let newFolderUrl: string;
    let location: string;
    let finalParentFolderId = parentFolderId;
    let rootFolderUrl: string;

    if (!finalParentFolderId) {
      // Find the root folder
      const rootFolder = await prisma.folder.findFirst({
        where: { name: email, userId: user.id },
      });

      if (!rootFolder) {
        return res.status(404).json({ message: "Root folder not found" });
      }

      if (process.env.NODE_ENV === "production") {
        rootFolderUrl = `${
          process.env.PUBLIC_APP_URL
        }/cefmdrive/storage/${encodeURIComponent(email)}/${encodeURIComponent(
          folderName
        )}`;
      } else {
        rootFolderUrl = `${
          process.env.PUBLIC_APP_URL
        }/Public/File Manager/${encodeURIComponent(email)}/${encodeURIComponent(
          folderName
        )}`;
      }
      finalParentFolderId = rootFolder.id;
      newFolderPath = path.join(baseFolder, folderName);
      newFolderUrl = rootFolderUrl;
      location = `/${folderName}`;
    } else {
      // Find parent folder and construct path based on it
      const parentFolder = await prisma.folder.findUnique({
        where: { id: finalParentFolderId },
      });

      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }

      newFolderPath = parentFolder.folderPath
        ? path.join(parentFolder.folderPath, folderName)
        : path.join(baseFolder, folderName);

      if (process.env.NODE_ENV === "production") {
        rootFolderUrl = `${
          process.env.PUBLIC_APP_URL
        }/cefmdrive/storage/${encodeURIComponent(email)}/${encodeURIComponent(
          folderName
        )}`;
      } else {
        rootFolderUrl = `${
          process.env.PUBLIC_APP_URL
        }/Public/File Manager/${encodeURIComponent(email)}/${encodeURIComponent(
          folderName
        )}`;
      }

      newFolderUrl = parentFolder.folderUrl
        ? `${parentFolder.folderUrl}/${encodeURIComponent(folderName)}`
        : rootFolderUrl;

      location = parentFolder.location
        ? `${parentFolder.location}/${folderName}`
        : `/${folderName}`;
    }

    // Check if the folder already exists
    try {
      await fs.access(newFolderPath);
      return res.status(301).json({ message: "Folder already exists" });
    } catch (error) {
      // Folder doesn't exist, so create it
      await fs.mkdir(newFolderPath, { recursive: true });
      // Optionally, set permissions if needed
      await fs.chmod(newFolderPath, 0o755); // Owner has full permissions, others can read and execute
    }

    // Create folder in the database
    const newFolder = await prisma.folder.create({
      data: {
        name: folderName,
        parentId: finalParentFolderId,
        folderPath: newFolderPath,
        folderUrl: newFolderUrl,
        location,
        userId: user.id,
      },
    });

    // Log the activity in the database
    await prisma.fileActivity.create({
      data: {
        userId,
        folderId: newFolder.id,
        activityType: "Folder",
        action: "CREATE",
        ipAddress: userInfo.ipAddress,
        userAgent: userInfo.userAgent,
        device: userInfo.deviceType,
        operatingSystem: userInfo.operatingSystem,
        browser: userInfo.browser,
        filePath: newFolderPath,
        fileSize: 0, // Folders don't have a size
        fileType: "folder",
      },
    });

    res.status(201).json({ message: `${folderName} created successfully` });
  } catch (error) {
    next(error);
  }
};

export const downloadFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { folderId } = req.body;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const folderPath = path.join(folder.folderPath as string);

    // Create a zip file
    const zipFileName = `${folder.name}.zip`;
    const zipFilePath = path.join(process.cwd(), zipFileName);
    const output = await createWriteStream(zipFilePath);
    const archive = archiver("zip");

    output.on("close", () => {
      console.log(`Zipped ${archive.pointer()} total bytes.`);
    });

    archive.on("error", (err) => {
      throw err;
    });

    // Pipe the zip stream to the output file
    archive.pipe(output);

    // Append files from the folder
    archive.directory(folderPath, false);
    await archive.finalize();

    // Send the zip file as a response
    const zipFileStream = await createReadStream(zipFilePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFileName}"`
    );
    res.setHeader("Content-Type", "application/zip");
    res.send(zipFileStream);
  } catch (error) {
    next(error);
  }
};

export const getChildrenFoldersByParentFolderId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user as { userId: string };
    const { folderId } = req.params;
    const folder = await folderService.getFoldersAndFilesByFolderId(
      userId,
      folderId
    );

    res.status(201).json(folder);
  } catch (error) {
    next(error);
  }
};

export const getRootFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user as { userId: string };

    const folder = await folderService.getRootFolder(userId);

    res.status(201).json(folder);
  } catch (error) {
    next(error);
  }
};

export const getRootChildren = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return res.status(201).json({ message: "User not found" });
    }

    const rootFolder = await prisma.folder.findFirst({
      where: {
        name: user?.email as string,
        userId,
        parentId: null,
        trashed: false,
      },
    });

    if (!rootFolder) {
      return res
        .status(201)
        .json({ message: "Root folder not found for the specified user" });
    }

    const folders = await prisma.folder.findMany({
      where: { parentId: rootFolder?.id as string, userId, trashed: false },
      include: {
        files: {
          select: {
            size: true,
          },
        },
      },
    });

    // Calculate total file size for each folder
    const foldersWithSize = folders.map((folder) => ({
      ...folder,
      totalSize: folder.files.reduce((acc, file) => acc + file.size, 0),
      files: undefined, // Remove the files array from the response
    }));

    const files = await prisma.file.findMany({
      where: { folderId: rootFolder?.id as string, trashed: false },
    });

    const documents = await prisma.document.findMany({
      where: { trashed: false },
    });

    res.status(201).json({ folders: foldersWithSize, files, documents });
  } catch (error) {
    next(error);
  }
};

export const getFolderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        files: true,
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
    });

    if (!folder) {
      return res.status(500).json({ message: `Folder not found.` });
    }

    const totalFileSize = folder.files.reduce(
      (acc, file) => acc + file.size,
      0
    );

    const checkUser = await prisma.user.findUnique({
      where: { id: folder.userId },
    });

    // Modify the location to show only from the email part and replace email with "ROOT"
    const modifiedLocation = folder.folderPath
      ? folder.folderPath
          .split(checkUser?.email || "")[1]
          ?.replace(/^[/\\]/, "") || ""
      : "";
    const finalLocation = modifiedLocation
      ? `ROOT\\${modifiedLocation.replace(/\//g, "\\")}`
      : "ROOT";

    return res.json({
      id: folder.id,
      name: folder.name,
      totalFileSize: formatSize(totalFileSize),
      numberOfFiles: folder._count.files,
      location: finalLocation,
      uploadedBy: checkUser?.name || null,
      numberOfSubfolders: folder._count.children,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      ownerId: checkUser?.name,
      locked: folder.locked ? "Yes" : "No",
      isShared: folder.isShared ? "Yes" : "No",
      files: folder.files,
    });
  } catch (error) {
    next(error);
  }
};

export const getFileCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params;
    const count = await folderService.getFolderFileCount(folderId);
    res.json(count);
  } catch (error) {
    next(error);
  }
};

export const unlockFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const folder = await prisma.folder.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { locked: false },
    });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: "Error unlocking folder" });
    next(error);
  }
};

export const lockFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const folder = await prisma.folder.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { locked: true },
    });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: "Error locking folder" });
    next(error);
  }
};

export const copyFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { folderId } = req.params;

    const sourceFolder = await prisma.folder.findUnique({
      where: { id: folderId, userId },
      include: { files: true, children: true },
    });

    if (!sourceFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let totalCopiedSize = 0;

    const copyFolderRecursive = async (
      folder: any,
      parentId: string | null,
      parentPath: string,
      isRoot: boolean
    ) => {
      const newFolderName = isRoot ? `Copy of ${folder.name}` : folder.name;
      const newFolderPath = path.join(parentPath, newFolderName);

      // Create the new folder in the file system
      await mkdir(newFolderPath, { recursive: true });

      // Set folder permissions (e.g., 0o755 for read, write, execute for owner, read and execute for others)
      await chmod(newFolderPath, 0o755);

      // Create the new folder in the database
      const newFolder = await prisma.folder.create({
        data: {
          name: newFolderName,
          parentId,
          userId,
          folderPath: newFolderPath,
          folderUrl: `${
            process.env.PUBLIC_APP_URL
          }/cefmdrive/storage/${encodeURIComponent(
            user.email as string
          )}/${encodeURIComponent(newFolderName)}`,
          location: isRoot ? `/${newFolderName}` : folder.location,
        },
      });

      // Copy files if they exist
      if (Array.isArray(folder.files) && folder.files.length > 0) {
        for (const file of folder.files) {
          const newFilePath = path.join(newFolderPath, file.name);
          await copyFile(file.filePath, newFilePath);

          // Set file permissions (e.g., 0o644 for read-write for owner, read for others)
          await chmod(newFilePath, 0o644);

          await prisma.file.create({
            data: {
              name: file.name,
              fileType: file.fileType,
              size: file.size,
              filePath: newFilePath,
              fileUrl: `${newFolder.folderUrl}/${encodeURIComponent(
                file.name
              )}`,
              mimeType: file.mimeType,
              folderId: newFolder.id,
              userId,
            },
          });

          totalCopiedSize += file.size;
        }
      }

      // Recursively copy subfolders if they exist
      if (Array.isArray(folder.children) && folder.children.length > 0) {
        for (const child of folder.children) {
          await copyFolderRecursive(child, newFolder.id, newFolderPath, false);
        }
      }

      return newFolder;
    };

    const copiedFolder = await copyFolderRecursive(
      sourceFolder,
      sourceFolder.parentId,
      path.dirname(sourceFolder.folderPath as string),
      true
    );

    // Log folder activity
    await prisma.fileActivity.create({
      data: {
        userId,
        folderId: copiedFolder.id,
        activityType: "Folder",
        action: "COPY FOLDER",
        filePath: copiedFolder.folderPath,
        fileSize: totalCopiedSize,
        fileType: "folder",
      },
    });

    // Update storage history
    const currentDate = new Date();
    const storageHistory = await prisma.storageHistory.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
          ),
          lt: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + 1
          ),
        },
      },
    });

    if (storageHistory) {
      await prisma.storageHistory.update({
        where: { id: storageHistory.id },
        data: {
          usedStorage: {
            increment: totalCopiedSize,
          },
        },
      });
    } else {
      await prisma.storageHistory.create({
        data: {
          userId,
          createdAt: currentDate,
          usedStorage: totalCopiedSize,
        },
      });
    }

    res.status(201).json(copiedFolder);
  } catch (error) {
    console.error("Error copying folder:", error);
    res.status(500).json({ error: "Error copying folder" });
  }
};

export const moveFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newParentId } = req.body;
    const { id } = req.params;
    const userId = req.user!.id;

    // Get the current folder
    const currentFolder = await prisma.folder.findUnique({
      where: { id, userId },
    });

    if (!currentFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Get the new parent folder
    const newParentFolder = await prisma.folder.findUnique({
      where: { id: newParentId, userId },
    });

    if (!newParentFolder) {
      return res.status(404).json({ error: "New parent folder not found" });
    }

    // Calculate new paths
    const newFolderPath = path.join(
      newParentFolder.folderPath as string,
      currentFolder.name
    );
    const newFolderUrl = `${newParentFolder.folderUrl}/${encodeURIComponent(
      currentFolder.name
    )}`;
    const newLocation = `${newParentFolder.location}/${currentFolder.name}`;

    const latestVersion = await prisma.folderVersion.findFirst({
      where: { folderId: newParentFolder.id },
      orderBy: { versionNumber: "desc" },
    });
    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create a folder version before updating
    await prisma.folderVersion.create({
      data: {
        id: uuidv4(),
        folderId: currentFolder.id,
        name: currentFolder.name,
        folderPath: currentFolder.folderPath,
        folderUrl: currentFolder.folderUrl,
        location: currentFolder.location,
        versionNumber: newVersionNumber,
        userId,
        createdAt: new Date(),
      },
    });

    // Update the folder
    const updatedFolder = await prisma.folder.update({
      where: { id, userId },
      data: {
        parentId: newParentId,
        folderPath: newFolderPath,
        folderUrl: newFolderUrl,
        location: newLocation,
        versionNumber: {
          increment: 1,
        },
      },
    });

    // Log the activity
    await prisma.fileActivity.create({
      data: {
        userId,
        folderId: updatedFolder.id,
        activityType: "Folder",
        action: "MOVE",
        filePath: newFolderPath,
        fileSize: 0, // Folders don't have a size
        fileType: "folder",
      },
    });

    res.json(updatedFolder);
  } catch (error) {
    console.error("Error moving folder:", error);
    res.status(500).json({ error: "Error moving folder" });
    next(error);
  }
};

// New function to get folder versions
export const getFolderVersions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params;
    const userId = req.user!.id;

    const folderVersions = await prisma.folderVersion.findMany({
      where: { folderId, userId },
      orderBy: { versionNumber: "desc" },
    });

    res.json(folderVersions);
  } catch (error) {
    console.error("Error getting folder versions:", error);
    res.status(500).json({ error: "Error getting folder versions" });
    next(error);
  }
};
