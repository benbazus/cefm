import archiver from "archiver";
import fs from "fs-extra";
import path from "path";
import UAParser from "ua-parser-js";

import { exec } from "child_process";

interface File {
  originalname: string;
  mimetype: string;
}

export const createWriteStream = async (zipFilePath: string) => {
  return await fs.createWriteStream(zipFilePath);
};

export const getBaseFolderPath = (email: string): string => {
  return process.env.NODE_ENV === "production"
    ? path.join("/var/www/cefmdrive/storage", email)
    : path.join(process.cwd(), "public", "File Manager", email);
};

export const isValidFile = (file: File): boolean => {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Allowed file extensions
  const allowedExtensions = [
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".docx",
    ".doc",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".aac",
    ".txt",
    ".zip",
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
  ];

  // Allowed MIME types
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
    "text/plain",
    "application/zip",
    "video/mp4",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/aac",
    "audio/flac",
    "audio/ogg",
    "audio/mp4",
  ];

  return (
    allowedExtensions.includes(extension) && allowedMimeTypes.includes(mimeType)
  );
};

export const checkFileSignature = (filePath: string): boolean => {
  const buffer = fs.readFileSync(filePath);
  const signature = buffer.toString("hex", 0, 4); // Read first 4 bytes

  // Check signatures for various formats
  switch (signature) {
    case "25504446": // PDF
      return true;
    case "d0cf11e0": // DOC, XLS (OLE Compound Document)
      return true;
    case "504b0304": // ZIP, DOCX, XLSX, PPTX
      return true;
    case "ffd8ffe0": // JPEG
      return true;
    case "89504e47": // PNG
      return true;
    case "000001ba": // MPEG Video
      return true;
    case "000001bc": // MPEG Video
      return true;
    default:
      return false; // Invalid or unknown format
  }
};

export const scanFileWithClamAV = (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec(`clamscan ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error scanning file: ${stderr}`));
      } else {
        resolve(stdout.includes("OK"));
      }
    });
  });
};

export const generateRandomPassword = (length: number) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  return { otp, otpExpires };
};
function getDetailedDeviceInfo(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const isMobile = /Mobi/i.test(userAgent);
  const isTablet = /Tablet|iPad/i.test(userAgent);

  return {
    deviceType: isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop",
    os: result.os.name || "unknown",
    browser: result.browser.name || "unknown",
    deviceModel: result.device.model || "unknown",
    deviceVendor: result.device.vendor || "unknown",
  };
}

function getUserDevice(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    deviceType: result.device.type || "unknown",
    deviceModel: result.device.model || "unknown",
    deviceVendor: result.device.vendor || "unknown",
    os: result.os.name || "unknown",
    browser: result.browser.name || "unknown",
  };
}

function getDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "Mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    return "Tablet";
  } else {
    return "Desktop";
  }
}

function getDeviceInfo(userAgent: string) {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const osRegex = /(Android|iPhone OS|Mac OS X|Windows NT|Linux)/i;
  const browserRegex = /(Chrome|Firefox|Safari|Opera|Edge|MSIE)/i;

  return {
    isMobile: mobileRegex.test(userAgent),
    os: (userAgent.match(osRegex) || [])[1] || "unknown",
    browser: (userAgent.match(browserRegex) || [])[1] || "unknown",
  };
}

export const zipFolder = (folderPath: string) => {
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const stream = fs.createWriteStream(path.join(folderPath, "..", "temp.zip"));

  return new Promise<fs.ReadStream>((resolve, reject) => {
    archive
      .directory(folderPath, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () =>
      resolve(fs.createReadStream(path.join(folderPath, "..", "temp.zip")))
    );
    archive.finalize();
  });
};

export const formatSize = (size: number) => {
  if (!size) return "N/A";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const generateUniqueId = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";

  // Generate the first 10 characters
  for (let i = 0; i < 10; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Add the separator '#'
  id += "#";

  // Generate the last 10 characters
  for (let i = 0; i < 10; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return id;
};

// Encode a folder ID
export function encodeFolderId(folderId: string): string {
  return btoa(folderId);
}

// Decode a folder ID
export function decodeFolder(encodedFolderId: string): string {
  return atob(encodedFolderId);
}
