import prisma from "../config/database";
import { File, Folder, Prisma } from "@prisma/client";
import * as userService from "../services/userService";
import path from "path";
import { promises as fs } from "fs";
import { generateUniqueId, getBaseFolderPath } from "../utils/helpers";
import bcrypt from "bcrypt";

interface FolderDetails {
  success: string;
  folder: {
    id: string;
    name: string;
    totalFileSize: number;
    numberOfFiles: number;
    uploadedBy: string | null;
    numberOfSubfolders: number;
    files: any[];
  };
}

interface CreateFolderResult {
  success: boolean;
  message: string;
  folder?: any;
}

// Helper function to determine the base folder path
// const getBaseFolderPath = (email: string): string => {
//   return process.env.NODE_ENV === "production"
//     ? path.join("/var/www/cefmdrive/storage", email)
//     : path.join(process.cwd(), "public", "File Manager", email);
// };

// Create new folder function
export const createNewFolder = async (
  userId: string,
  folderName: string,
  parentFolderId: string | null,
  ipAddress: string,
  userAgent: string,
  operatingSystem: string,
  browser: string,
  device: string
): Promise<CreateFolderResult> => {
  try {
    const user = await userService.getUserById(userId);
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
        return { success: false, message: "Root folder not found" };
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
        return { success: false, message: "Parent folder not found" };
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
      return { success: false, message: "Folder already exists" };
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
        ipAddress,
        userAgent,
        device,
        operatingSystem,
        browser,
        filePath: newFolderPath,
        fileSize: 0, // Folders don't have a size
        fileType: "folder",
      },
    });

    return {
      success: true,
      message: "Folder created successfully",
      folder: newFolder,
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    return {
      success: false,
      message: "An error occurred while creating the folder",
    };
  }
};

//=================================================================================
export const getRootFolder = async (userId: string): Promise<Folder> => {
  const folder = await prisma.folder.findFirst({
    where: { parentId: null, userId },
  });
  return folder as Folder;
};

type Document = Prisma.DocumentGetPayload<{}>;

export const getFoldersAndFilesByFolderId = async (
  userId: string,
  parentId: string
): Promise<{ folders: Folder[]; files: File[]; documents: Document[] }> => {
  try {
    const user = await userService.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const folders = await prisma.folder.findMany({
      where: {
        parentId,
        userId,
        trashed: false,
      },
      include: { files: true },
    });

    const files = await prisma.file.findMany({
      where: {
        folderId: parentId,
        userId,
        trashed: false,
      },
    });
    const documents = await prisma.document.findMany({
      where: {
        userId,
        trashed: false,
      },
    });

    return { folders, files, documents };
  } catch (error) {
    console.error("Error in getRootChildren:", error);
    throw error;
  }
};

// export const getRootChildren = async (
//   userId: string
// ): Promise<{ folders: Folder[]; files: File[]; documents: Document[] }> => {
//   try {
//     const user = await userService.getUserById(userId);

//     if (!user) {
//       throw new Error("User not found");
//     }

//     const rootFolder = await prisma.folder.findFirst({
//       where: {
//         name: user?.email as string,
//         userId,
//         parentId: null,
//         trashed: false,
//       },
//     });

//     if (!rootFolder) {
//       throw new Error("Root folder not found for the specified user");
//     }

//     const folders = await prisma.folder.findMany({
//       where: { parentId: rootFolder.id, userId, trashed: false },
//     });

//     const files = await prisma.file.findMany({
//       where: { folderId: rootFolder.id, trashed: false },
//     });

//     const documents = await prisma.document.findMany({
//       where: { trashed: false },
//     });

//     return { folders, files, documents };
//   } catch (error) {
//     console.error("Error in getRootChildren:", error);
//     throw error;
//   }
// };

export const createFolder = async (
  userId: string,
  parentId: string | undefined,
  name: string
): Promise<Folder> => {
  return prisma.folder.create({
    data: {
      name,
      userId,
      parentId,
    },
  });
};

export const findOrCreateFolder = async (
  userId: string,
  parentId: string | undefined,
  name: string
): Promise<Folder> => {
  let folder = await prisma.folder.findFirst({
    where: {
      name,
      userId,
      parentId,
    },
  });

  if (!folder) {
    folder = await createFolder(userId, parentId, name);
  }

  return folder;
};

export const renameFolder = async (
  id: string,
  userId: string,
  newName: string
): Promise<string> => {
  const folder = await prisma.folder.findUnique({
    where: { id: id },
  });

  if (!folder) {
    throw new Error(`Folder   not found.`);
  }

  // Ensure the new name does not conflict with existing folders in the same directory
  const existingFolder = await prisma.folder.findFirst({
    where: { name: newName, id: { not: folder.id } },
  });

  if (existingFolder) {
    throw new Error(`A folder with the name "${newName}" already exists.`);
  }

  // Rename the folder in the filesystem
  const oldFolderPath = folder.folderPath as string;
  const newFolderPath = path.join(path.dirname(oldFolderPath), newName);

  await fs.rename(oldFolderPath, newFolderPath);

  // Update the folder metadata in the database
  await prisma.folder.update({
    where: { id: id },
    data: {
      name: newName,
      folderPath: newFolderPath,
      folderUrl: folder?.folderUrl?.replace(folder.name, newName),
    },
  });

  return `Folder  renamed to ${newName}`;
};

export const getFolderById = async (id: string): Promise<Folder | null> => {
  return prisma.folder.findUnique({
    where: { id },
  });
};

export const shareFolder = async (
  userId: string,
  folderId: string,
  password: string,
  sharedWith: string,
  shareWithMessage: string,
  isPasswordEnabled: boolean,
  expirationDate: Date,
  isExpirationEnabled: boolean
): Promise<{ url: string; message: string }> => {
  // Validate the input
  if (!folderId || !sharedWith) {
    throw new Error("Missing required fields");
  }

  // Validate expirationDate if isExpirationEnabled is true
  let validExpirationDate: Date | null = null;

  if (isExpirationEnabled && expirationDate) {
    validExpirationDate = new Date(expirationDate);

    if (isNaN(validExpirationDate.getTime())) {
      throw new Error("Invalid expiration date format");
    }
  }

  // Check if the file exists
  const existingFolder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  if (!existingFolder) {
    throw new Error("FOlder does not exist");
  }

  let hashedPassword: string | null = null;

  if (isPasswordEnabled && password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const uniqueId = generateUniqueId();

  await prisma.sharedFile.create({
    data: {
      folderId: existingFolder.id,
      sharedWith,
      shareWithMessage,
      // sharedId: uniqueId,
      isPasswordEnabled,
      expirationDate: validExpirationDate,
      isExpirationEnabled,
      password: hashedPassword,
      userId: userId,
    },
  });

  // Update the file to mark it as shared
  await prisma.folder.update({
    where: { id: existingFolder.id }, // Fixed to reference the correct ID
    data: { isShared: true },
  });

  // Record the file sharing activity
  await prisma.fileActivity.create({
    data: {
      fileId: existingFolder.id,
      action: "shared Folder",
      userId,
    },
  });

  // Get the base URL from environment variables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const encodedFileId = encodeURIComponent(uniqueId);

  // Create the full shared file URL
  const sharedFileUrl = `${baseUrl}/shared/${encodedFileId}`;

  return {
    url: sharedFileUrl,
    message: "FOlder shared successfully",
  };
};

interface FolderFileInfo {
  count: number;
  totalSize: number;
}

export const getFolderFileCount = async (
  folderId: string
): Promise<FolderFileInfo> => {
  try {
    const result = await prisma.file.aggregate({
      where: {
        folderId,
      },
      _count: {
        id: true,
      },
      _sum: {
        size: true,
      },
    });

    const count = result._count.id;
    const totalSize = result._sum.size || 0;

    console.log("@@@@@@@@@@@@@@@@@@@@@count and size@@@@@@@@@@@@@@@@@@@@@@@@@");
    console.log(`Count: ${count}, Total Size: ${totalSize}`);
    console.log("@@@@@@@@@@@@@@@@@@@@@count and size@@@@@@@@@@@@@@@@@@@@@@@@@");

    return { count, totalSize };
  } catch (error) {
    console.error("Error getting folder file info:", error);
    throw error;
  }
};

// In your folder service file (e.g., folderService.ts)
export const getFolderFileCount1 = async (
  folderId: string
): Promise<number> => {
  try {
    const count = await prisma.file.count({
      where: {
        folderId,
      },
    });

    console.log(" @@@@@@@@@@@@@@@@@@@@@@@count@@@@@@@@@@@@@@@@@@@@@@@@@@@ ");
    console.log(count);
    console.log(" @@@@@@@@@@@@@@@@@@@@@count@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ");

    return count;
  } catch (error) {
    console.error("Error counting files in folder:", error);
    throw error;
  }
};

export const getFolderDetails = async (
  folderId: string
): Promise<FolderDetails> => {
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
    throw new Error(`Folder   not found.`);
  }

  const totalFileSize = folder.files.reduce((acc, file) => acc + file.size, 0);

  const checkUser = await prisma.user.findUnique({
    where: { id: folder.userId },
  });

  return {
    success: `Folder with ID ${folderId} details retrieved.`,
    folder: {
      id: folder.id,
      name: folder.name,
      totalFileSize,
      numberOfFiles: folder._count.files,
      uploadedBy: checkUser?.name || null,
      numberOfSubfolders: folder._count.children,
      files: folder.files,
    },
  };
};
