import { Request, Response, NextFunction } from "express";
import * as fileService from "../services/fileService";
import * as folderService from "../services/folderService";
import * as userService from "../services/userService";

import fs from "fs";
import path from "path";
import busboy from "busboy";

import { User } from "@prisma/client";
import md5 from "md5";
import { stat } from "fs/promises";
import prisma from "../config/database";

// Helper to get file details using promisified stat
const getFileDetails = (filePath: string) => stat(filePath);

// Function to generate a unique alphanumeric ID
const uniqueAlphaNumericId = (() => {
  const heyStack = "0123456789abcdefghijklmnopqrstuvwxyz";
  const randomInt = () => Math.floor(Math.random() * heyStack.length);

  return (length = 24) =>
    Array.from({ length }, () => heyStack[randomInt()]).join("");
})();

// Function to generate the file path based on fileName and fileId
const getFilePath = (fileName: string, fileId: string) =>
  `./uploads/file-${fileId}-${fileName}`;

export const uploadRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.body || !req.body.fileName) {
    res.status(400).json({ message: 'Missing "fileName"' });
  } else {
    const fileId = uniqueAlphaNumericId();
    fs.createWriteStream(getFilePath(req.body.fileName, fileId), {
      flags: "w",
    });
    res.status(200).json({ fileId });
  }
};

// // Upload Request Handler
// export const uploadRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { fileName } = req.body;
//         const { userId } = req.user as { userId: string };

//         if (!fileName || !userId) {
//             res.status(400).json({ message: 'Missing "fileName" or "userId"' });
//         }

//         const fileId = uniqueAlphaNumericId();
//         const filePath = getFilePath(fileName, fileId);

//         // Create an empty file
//         await fs.writeFile(filePath, '');

//         // Save file metadata to the database
//         await fileService.saveFileMetadata(fileName, filePath, 0, 'unknown', userId); // 0 size for an empty file, will be updated later

//         res.status(200).json({ fileId });
//     } catch (error) {
//         next(error);
//     }
// };

export const uploadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.query && req.query.fileName && req.query.fileId) {
    getFileDetails(
      getFilePath(req?.query?.fileName as string, req.query.fileId as string)
    )
      .then((stats) => {
        res.status(200).json({ totalChunkUploaded: stats.size });
      })
      .catch((err) => {
        console.error("failed to read file", err);
        res
          .status(400)
          .json({
            message: "No file with such credentials",
            credentials: req.query,
          });
      });
  }
};

export const fileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const contentRange = req.headers["content-range"];

  if (!contentRange) {
    res.status(400).json({ message: "Missing required headers" });
  }

  const match = contentRange?.match(/bytes=(\d+)-(\d+)\/(\d+)/);
  if (!match) {
    res.status(400).json({ message: 'Invalid "Content-Range" format' });
  }

  // const [_, rangeStartStr, rangeEndStr, fileSizeStr] = match;
  // const rangeStart = Number(rangeStartStr);
  // const rangeEnd = Number(rangeEndStr);
  // const fileSize = Number(fileSizeStr);

  // if (rangeStart >= fileSize || rangeStart >= rangeEnd || rangeEnd > fileSize) {
  //     res.status(400).json({ message: 'Invalid "Content-Range" provided' });
  // }

  //============================================================

  const bb = busboy({ headers: req.headers });
  const uploadPromises: Promise<any>[] = [];
  const { userId } = req.user as { userId: string };

  console.log(" ++++++++++++ fileUpload +++++++++++++++++++ ");
  console.log({ userId });
  console.log(" +++++++++++ fileUpload ++++++++++++++++++++ ");

  let folderId: string | null = null;
  let baseFolderPath = "";
  let fileRelativePath = "";

  bb.on("field", (name, val) => {
    if (name === "folderId") {
      folderId = val;
    }
    if (name === "relativePath") {
      fileRelativePath = val;
    }
  });

  try {
    bb.on("file", async (name, file, info) => {
      const { filename, mimeType } = info;

      const relativePath = fileRelativePath ? fileRelativePath.split("/") : [];
      relativePath.pop();

      if (folderId) {
        const folderResponse = await folderService.getFolderById(folderId);
        if (folderResponse) {
          baseFolderPath = folderResponse.folderPath as string;
        }
      }

      const user = (await userService.getUserById(userId)) as User;

      if (!baseFolderPath) {
        baseFolderPath = path.join(
          process.cwd(),
          "public",
          "File Manager",
          user?.email as string
        );
      }

      const fullPath = path.join(baseFolderPath, ...relativePath, filename);
      const fileUrl = `${
        process.env.PUBLIC_APP_URL
      }/File Manager/${encodeURIComponent(userId)}/${encodeURIComponent(
        filename
      )}`;

      const writeStream = fs.createWriteStream(fullPath);
      file.pipe(writeStream);

      const uploadPromise = new Promise((resolve, reject) => {
        writeStream.on("finish", async () => {
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

        writeStream.on("error", (error) => {
          reject(error);
        });
      });

      uploadPromises.push(uploadPromise);
    });

    bb.on("finish", async () => {
      try {
        const results = await Promise.all(uploadPromises);
        res.json({ message: "Files uploaded successfully", files: results });
      } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ error: "Error uploading files" });
      }
    });

    req.pipe(bb);
  } catch (error) {
    next(error);
  }
};

// export const uploadChunk = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//         const { name, currentChunkIndex, totalChunks } = req.query;

//         const data = req.body.toString();

//         console.log(" +++++++++++++++uploadChunk+++++++++++++++++ ")
//         console.log(name)
//         console.log(currentChunkIndex)
//         console.log(totalChunks)
//         console.log({ data })
//         console.log(" +++++++++++++++uploadChunk+++++++++++++++++ ")

//         //const { name, size, currentChunkIndex, totalChunks } = req.query;

//         if (typeof name !== 'string' || typeof currentChunkIndex !== 'string' || typeof totalChunks !== 'string') {
//             res.status(400).json({ error: 'Invalid query parameters' });
//             return;
//         }

//         const firstChunk = parseInt(currentChunkIndex) === 0;
//         const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
//         const ext = name.split('.').pop() || '';
//         const buffer = Buffer.from(data.split(',')[1], 'base64');
//         const tmpFilename = `tmp_${md5(name + ip)}.${ext}`;
//         const tmpFilePath = `${config.UPLOAD_DIR}/${tmpFilename}`;

//         // If it's the first chunk, check and delete any existing temporary file asynchronously
//         if (firstChunk) {
//             try {
//                 await fs.access(tmpFilePath); // Check if the file exists
//                 await fs.unlink(tmpFilePath); // If it exists, delete it
//             } catch (error) {
//                 //if (error?.code !== 'ENOENT') {
//                 //    throw error; // Only throw an error if it's not a "file not found" error
//                 //}
//             }
//         }

//         // Append the current chunk to the temporary file
//         await fs.appendFile(tmpFilePath, buffer);

//         // If it's the last chunk, rename the temporary file to its final name
//         if (lastChunk) {
//             const finalFilename = `${md5(Date.now().toString()).substr(0, 6)}.${ext}`;
//             const finalFilePath = `${config.UPLOAD_DIR}/${finalFilename}`;

//             await fs.rename(tmpFilePath, finalFilePath);
//             return { finalFilename };
//         }

//         res.json();

//     } catch (error) {
//         next(error);
//     }
// }
