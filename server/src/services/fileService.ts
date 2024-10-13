import prisma from "../config/database";
import {
  File,
  FileActivity,
  Folder,
  Prisma,
  StorageHistory,
} from "@prisma/client";
import path from "path";
import bcrypt from "bcrypt";
import { promises as fs } from "fs";
import md5 from "md5";
import { config } from "../config/config";
import {
  decodeFolder,
  encodeFolderId,
  generateUniqueId,
} from "../utils/helpers";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

interface FileDetails {
  id: string;
  name: string;
  parentFolderName: string;
  size: number;
  uploadedBy: string | null;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

type Document = Prisma.DocumentGetPayload<{}>;

export const uploadFile = async (
  userId: string,
  folderId: string | undefined,
  file: Express.Multer.File
): Promise<File> => {
  const { originalname, mimetype, size } = file;

  console.log("File upload details:", { originalname, mimetype, size });

  const filePath = path.join(UPLOAD_DIR, file.filename);

  try {
    const uploadedFile = await prisma.file.create({
      data: {
        name: originalname,
        mimeType: mimetype,
        size,
        filePath,
        userId,
        folderId,
      },
    });

    return uploadedFile;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
};

export const saveFileData = async (
  originalname: string,
  folderId: string,
  mimetype: string,
  size: number,
  filePath: string,
  userId: string
): Promise<File> => {
  try {
    const uploadedFile = await prisma.file.create({
      data: {
        name: originalname,
        mimeType: mimetype,
        size,
        filePath,
        userId,
        folderId,
      },
    });

    return uploadedFile;
  } catch (error) {
    console.error("Error saving file data:", error);
    throw new Error("Failed to save file data");
  }
};

export const getFilesActivities = async (
  userId: string,
  folderId?: string
): Promise<FileActivity[]> => {
  try {
    const whereClause = {
      userId,
      ...(folderId && { folderId }),
    };

    const userFileActivities = await prisma.fileActivity.findMany({
      where: whereClause,
      include: {
        user: true,
        File: true,
        Folder: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return userFileActivities;
  } catch (error) {
    console.error("Error fetching file activities:", error);
    throw new Error("Failed to fetch file activities");
  }
};

export const getFileActivities = async (
  userId: string,
  fileId: string
): Promise<FileActivity[]> => {
  try {
    const fileActivities = await prisma.fileActivity.findMany({
      where: { fileId },
      include: { user: true },
    });

    return fileActivities;
  } catch (error) {
    console.error("Error fetching file activities:", error);
    throw new Error("Failed to fetch file activities");
  }
};

export const updatefileActivities = async (fileId: string): Promise<void> => {
  try {
    await prisma.fileActivity.update({
      where: { id: fileId },
      data: { action: "download" },
    });
  } catch (error) {
    console.error("Error updating file activity:", error);
    throw new Error("Failed to update file activity");
  }
};

export const deleteFileActivities = async (fileId: string): Promise<void> => {
  try {
    await prisma.fileActivity.delete({ where: { id: fileId } });
  } catch (error) {
    console.error("Error deleting file activity:", error);
    throw new Error("Failed to delete file activity");
  }
};

export const getStorageHistories = async (
  userId: string
): Promise<StorageHistory[]> => {
  try {
    const userStorageHistories = await prisma.storageHistory.findMany({
      where: { userId },
      include: { user: true },
    });
    return userStorageHistories;
  } catch (error) {
    console.error("Error fetching storage histories:", error);
    throw new Error("Failed to fetch storage histories");
  }
};

export const getStorageHistory = async (
  userId: string
): Promise<StorageHistory | null> => {
  try {
    const storageHistoryForUserAndType = await prisma.storageHistory.findFirst({
      where: { userId, storageType: "file" },
    });
    return storageHistoryForUserAndType;
  } catch (error) {
    console.error("Error fetching storage history:", error);
    throw new Error("Failed to fetch storage history");
  }
};

export const updateStorageHistory = async (userId: string): Promise<void> => {
  try {
    await prisma.storageHistory.create({
      data: {
        userId,
        usedStorage: 100,
        totalStorage: 10, // config.totalStorage,
        storageType: "file",
        storageLocation: "local",
      },
    });
  } catch (error) {
    console.error("Error updating storage history:", error);
    throw new Error("Failed to update storage history");
  }
};

export const deleteStorageHistory = async (fileId: string): Promise<void> => {
  try {
    await prisma.storageHistory.delete({ where: { id: fileId } });
  } catch (error) {
    console.error("Error deleting storage history:", error);
    throw new Error("Failed to delete storage history");
  }
};

export const getFiles = async (
  userId: string,
  folderId?: string
): Promise<File[]> => {
  try {
    return prisma.file.findMany({
      where: { userId, folderId },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    throw new Error("Failed to fetch files");
  }
};

export const checkPassword = async (
  password: string,
  itemId: string
): Promise<string> => {
  try {
    const encodedItemId = decodeFolder(itemId);

    const sharedFile = await prisma.sharedFile.findFirst({
      where: { sharedUrl: encodedItemId },
      select: { password: true },
    });

    if (!sharedFile || !sharedFile.password) {
      throw new Error("File not found or password not set");
    }

    const passwordMatch = await bcrypt.compare(password, sharedFile.password);

    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    return "Password verified successfully.";
  } catch (error) {
    console.error("Error checking password:", error);
    throw error;
  }
};

export async function deleteFile(
  fileId: string,
  userId: string
): Promise<string> {
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { user: true },
    });

    if (!file) {
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      throw new Error("You do not have permission to delete this file");
    }

    const filePath = path.join(
      process.env.FILE_STORAGE_PATH!,
      file.filePath as string
    );
    await fs.unlink(filePath);

    await prisma.file.delete({ where: { id: fileId } });

    await prisma.fileActivity.deleteMany({ where: { fileId } });

    return "File deleted successfully";
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export const getDocuments = async (
  userId: string
): Promise<{ files: File[] }> => {
  try {
    const files = await prisma.file.findMany({
      where: {
        fileType: "Adobe Portable Document Format (PDF)",
        userId,
        trashed: false,
      },
    });

    return { files };
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error("Failed to fetch documents");
  }
};

export const getCustomDocuments = async (
  userId: string
): Promise<{ documents: Document[] }> => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId,
        trashed: false,
      },
    });

    return { documents };
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error("Failed to fetch documents");
  }
};

export const getShared = async (
  userId: string
): Promise<{ folders: Folder[]; files: File[] }> => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId, trashed: false, isShared: true },
    });

    const files = await prisma.file.findMany({
      where: { userId, trashed: false, isShared: true },
    });

    return { folders, files };
  } catch (error) {
    console.error("Error fetching shared items:", error);
    throw new Error("Failed to fetch shared items");
  }
};

export const getTrashed = async (
  userId: string
): Promise<{ folders: Folder[]; files: File[]; documents: Document[] }> => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId, trashed: true },
    });

    const files = await prisma.file.findMany({
      where: { userId, trashed: true },
    });

    const documents = await prisma.document.findMany({
      where: { userId, trashed: true },
    });

    return { folders, files, documents };
  } catch (error) {
    console.error("Error fetching trashed items:", error);
    throw new Error("Failed to fetch trashed items");
  }
};

export const getPhotos = async (userId: string): Promise<{ files: File[] }> => {
  try {
    const files = await prisma.file.findMany({
      where: {
        fileType: { in: ["PNG Image", "JPEG Image"] },
        userId,
        trashed: false,
      },
    });

    return { files };
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw new Error("Failed to fetch photos");
  }
};

export const getExcelFiles = async (
  userId: string
): Promise<{ files: File[] }> => {
  try {
    const files = await prisma.file.findMany({
      where: {
        fileType: "Microsoft Excel Spreadsheet",
        userId,
        trashed: false,
      },
    });
    return { files };
  } catch (error) {
    console.error("Error fetching Excel files:", error);
    throw new Error("Failed to fetch Excel files");
  }
};

export const getAudioFiles = async (
  userId: string
): Promise<{ files: File[] }> => {
  try {
    const files = await prisma.file.findMany({
      where: {
        fileType: "Audio File",
        userId,
        trashed: false,
      },
    });
    return { files };
  } catch (error) {
    console.error("Error fetching Audio files:", error);
    throw new Error("Failed to fetch Audio files");
  }
};

export const getPPFiles = async (
  userId: string
): Promise<{ files: File[] }> => {
  try {
    const files = await prisma.file.findMany({
      where: {
        fileType: "Microsoft PowerPoint Presentation",
        userId,
        trashed: false,
      },
    });
    return { files };
  } catch (error) {
    console.error("Error fetching Audio files:", error);
    throw new Error("Failed to fetch Audio files");
  }
};

// export const getVideoFiles = async (
//   userId: string
// ): Promise<{ files: File[] }> => {
//   try {
//     const files = await prisma.file.findMany({
//       where: {
//         fileType: "Video File",
//         userId,
//         trashed: false,
//       },
//     });
//     return { files };
//   } catch (error) {
//     console.error("Error fetching Video files:", error);
//     throw new Error("Failed to fetch Video files");
//   }
// };

export const getPDFFiles = async (
  userId: string
): Promise<{ files: File[] }> => {
  try {
    const files = await prisma.file.findMany({
      where: {
        fileType: "Adobe Portable Document Format (PDF)",
        userId,
        trashed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { files };
  } catch (error) {
    console.error("Error fetching pdf files:", error);
    throw new Error("Failed to fetch pdf files");
  }
};

export const getWordFiles = async (
  userId: string
): Promise<{ files: File[] }> => {
  try {
    const files = await prisma.file.findMany({
      where: {
        fileType: "Microsoft Word Document",
        userId,
        trashed: false,
      },
    });
    return { files };
  } catch (error) {
    console.error("Error fetching pdf files:", error);
    throw new Error("Failed to fetch pdf files");
  }
};

export const getSharedWithMe = async (userId: string): Promise<File[]> => {
  try {
    return prisma.file.findMany({
      where: {
        userId,
        trashed: false,
        isShared: true,
      },
    });
  } catch (error) {
    console.error("Error fetching shared files:", error);
    throw new Error("Failed to fetch shared files");
  }
};

export const renameFile = async (
  fileId: string,
  userId: string,
  newName: string
): Promise<string> => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { folder: true },
    });

    if (!file) {
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      throw new Error("You do not have permission to rename this file");
    }

    const existingFile = await prisma.file.findFirst({
      where: {
        name: newName,
        folderId: file.folderId,
        id: { not: fileId },
      },
    });

    if (existingFile) {
      throw new Error("A file with this name already exists in the folder");
    }

    const oldPath = file.filePath as string;
    const newPath = path.join(path.dirname(oldPath), newName);

    await fs.rename(oldPath, newPath);

    console.log("File renamed:", { oldPath, newPath });

    await prisma.file.update({
      where: { id: fileId },
      data: {
        name: newName,
        filePath: newPath,
        fileUrl: file.fileUrl?.replace(file.name, newName),
      },
    });

    await prisma.fileActivity.create({
      data: {
        userId: userId,
        fileId: fileId,
        action: "rename",
      },
    });

    return `File renamed to ${newName}`;
  } catch (error) {
    console.error("Error renaming file:", error);
    throw error;
  }
};

export const restoreFile = async (
  id: string,
  type: "file" | "folder"
): Promise<string> => {
  try {
    if (type === "folder") {
      const folder = await prisma.folder.findUnique({ where: { id } });
      if (!folder) {
        throw new Error("Folder not found");
      }
      await prisma.folder.update({
        where: { id },
        data: { trashed: false },
      });
      return "Folder restored successfully";
    }

    if (type === "file") {
      const file = await prisma.file.findUnique({ where: { id } });
      if (!file) {
        throw new Error("File not found");
      }
      await prisma.file.update({
        where: { id },
        data: { trashed: false },
      });
      return "File restored successfully";
    }

    throw new Error("Invalid type specified");
  } catch (error) {
    console.error("Error restoring item:", error);
    throw error;
  }
};

export const moveToTrash = async (
  id: string,
  userId: string
): Promise<string> => {
  try {
    const file = await prisma.file.findUnique({ where: { id } });

    const folder = await prisma.folder.findUnique({ where: { id } });

    const document = await prisma.document.findUnique({ where: { id } });

    if (!file && !folder && !document) {
      throw new Error("File not found");
    }

    if (folder) {
      await prisma.folder.update({
        where: { id },
        data: { trashed: true },
      });
    }

    if (file) {
      await prisma.file.update({
        where: { id },
        data: { trashed: true },
      });
    }

    if (document) {
      await prisma.document.update({
        where: { id },
        data: { trashed: true },
      });
    }
    await prisma.fileActivity.create({
      data: { action: "moveToTrash", userId: userId },
    });

    return "File moved to trash successfully";
  } catch (error) {
    console.error("Error moving file to trash:", error);
    throw error;
  }
};

export const getFileDetails = async (itemId: string): Promise<FileDetails> => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: itemId },
      include: { folder: true },
    });

    if (!file) {
      throw new Error(`File with ID ${itemId} not found`);
    }

    const user = await prisma.user.findUnique({
      where: { id: file.userId },
    });

    return {
      id: file.id,
      name: file.name,
      parentFolderName: file.folder?.name || "Root Folder",
      size: file.size,
      uploadedBy: user?.name || null,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching file details:", error);
    throw error;
  }
};

export const shareLink = async (
  userId: string,
  itemId: string
): Promise<{ url: string }> => {
  let sharedFileUrl: string | null = null;

  const existingFile = await prisma.file.findUnique({ where: { id: itemId } });
  const existingFolder = await prisma.folder.findUnique({
    where: { id: itemId },
  });

  if (!existingFile && !existingFolder) {
    throw new Error("File or folder does not exist");
  }

  const shareableId: string = uuidv4();

  if (existingFile) {
    // Share file logic
    await prisma.sharedFile.create({
      data: {
        fileId: existingFile.id,
        sharedUrl: shareableId,
        shareableType: "File",
        userId,
      },
    });

    await prisma.file.update({
      where: { id: existingFile.id },
      data: { isShared: true },
    });

    await prisma.fileActivity.create({
      data: {
        fileId: existingFile.id,
        action: "copied file link",
        userId,
      },
    });

    // Get the base URL from environment variables
    const baseUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173";
    const encodedFileId = encodeFolderId(shareableId);
    sharedFileUrl = `${baseUrl}/sharedFile/${encodedFileId}`;
  }

  if (existingFolder) {
    // Share folder logic
    await prisma.sharedFile.create({
      data: {
        sharedUrl: shareableId,
        shareableType: "Folder",
        folderId: existingFolder.id,
        userId,
      },
    });

    await prisma.folder.update({
      where: { id: existingFolder.id },
      data: { isShared: true },
    });

    await prisma.fileActivity.create({
      data: {
        folderId: existingFolder.id,
        action: "copied folder link",
        userId,
      },
    });

    // Get the base URL from environment variables
    const baseUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173";
    const encodedFolderId = encodeFolderId(shareableId);
    sharedFileUrl = `${baseUrl}/sharedFile/${encodedFolderId}`;
  }
  return { url: sharedFileUrl as string };
};

export const shareFile = async (
  userId: string,
  itemId: string,
  password: string,
  sharedWith: string,
  shareWithMessage: string,
  isPasswordEnabled: boolean,
  expirationDate: Date,
  isExpirationEnabled: boolean
): Promise<{ url: string; message: string }> => {
  let sharedFileUrl: string | null = null;
  let validExpirationDate: Date | null = null;

  // Validate expirationDate if isExpirationEnabled is true
  if (isExpirationEnabled && expirationDate) {
    validExpirationDate = new Date(expirationDate);
    if (isNaN(validExpirationDate.getTime())) {
      throw new Error("Invalid expiration date format");
    }
  }

  // Check if the file or folder exists
  const existingFile = await prisma.file.findUnique({ where: { id: itemId } });
  const existingFolder = await prisma.folder.findUnique({
    where: { id: itemId },
  });

  if (!existingFile && !existingFolder) {
    throw new Error("File or folder does not exist");
  }

  // Hash the password if enabled
  let hashedPassword: string | null = null;
  if (isPasswordEnabled && password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }
  const shareableId: string = uuidv4();

  if (existingFile) {
    // Share file logic
    await prisma.sharedFile.create({
      data: {
        fileId: existingFile.id,
        sharedUrl: shareableId,
        shareableType: "File",
        sharedWith,
        shareWithMessage,
        isPasswordEnabled,
        expirationDate: validExpirationDate,
        isExpirationEnabled,
        password: hashedPassword,
        userId,
      },
    });

    await prisma.file.update({
      where: { id: existingFile.id },
      data: { isShared: true },
    });

    await prisma.fileActivity.create({
      data: {
        fileId: existingFile.id,
        action: "shared file",
        userId,
      },
    });

    // Get the base URL from environment variables
    const baseUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173";
    const encodedFileId = encodeFolderId(shareableId);
    sharedFileUrl = `${baseUrl}/sharedFile/${encodedFileId}`;
  }

  if (existingFolder) {
    // Share folder logic
    await prisma.sharedFile.create({
      data: {
        sharedUrl: shareableId,
        shareableType: "Folder",
        folderId: existingFolder.id,
        sharedWith,
        shareWithMessage,
        isPasswordEnabled,
        expirationDate: validExpirationDate,
        isExpirationEnabled,
        password: hashedPassword,
        userId,
      },
    });

    await prisma.folder.update({
      where: { id: existingFolder.id },
      data: { isShared: true },
    });

    await prisma.fileActivity.create({
      data: {
        folderId: existingFolder.id,
        action: "shared folder",
        userId,
      },
    });

    // Get the base URL from environment variables
    const baseUrl = process.env.PUBLIC_APP_URL || "http://localhost:5173";
    const encodedFolderId = encodeFolderId(shareableId);
    sharedFileUrl = `${baseUrl}/sharedFile/${encodedFolderId}`;
  }

  // Return the shared file/folder URL and a success message
  return {
    url: sharedFileUrl as string,
    message: existingFile
      ? "File shared successfully"
      : "Folder shared successfully",
  };
};

export const getFileById = async (id: string): Promise<File | null> => {
  return prisma.file.findUnique({
    where: { id },
  });
};

export const handleChunkUpload = async (
  name: string,
  currentChunkIndex: number,
  totalChunks: number,
  data: string,
  ip: string
): Promise<string | { finalFilename: string }> => {
  const firstChunk = currentChunkIndex === 0;
  const lastChunk = currentChunkIndex === totalChunks - 1;
  const ext = name.split(".").pop() || "";
  const buffer = Buffer.from(data.split(",")[1], "base64");
  const tmpFilename = `tmp_${md5(name + ip)}.${ext}`;
  const tmpFilePath = `${config.UPLOAD_DIR}/${tmpFilename}`;

  try {
    // If it's the first chunk, check and delete any existing temporary file asynchronously
    if (firstChunk) {
      try {
        await fs.access(tmpFilePath); // Check if the file exists
        await fs.unlink(tmpFilePath); // If it exists, delete it
      } catch (error) {
        //if (error?.code !== 'ENOENT') {
        //    throw error; // Only throw an error if it's not a "file not found" error
        //}
      }
    }

    // Append the current chunk to the temporary file
    await fs.appendFile(tmpFilePath, buffer);

    // If it's the last chunk, rename the temporary file to its final name
    if (lastChunk) {
      const finalFilename = `${md5(Date.now().toString()).substr(0, 6)}.${ext}`;
      const finalFilePath = `${config.UPLOAD_DIR}/${finalFilename}`;

      await fs.rename(tmpFilePath, finalFilePath);
      return { finalFilename };
    }

    return "ok";
  } catch (error) {
    console.error("Error handling chunk upload:", error);
    throw new Error("Failed to handle chunk upload");
  }
};
