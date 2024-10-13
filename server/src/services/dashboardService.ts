import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../config/database";

interface RecentActivity {
  id: string;
  fileName: string;
  action: string | null;
  timestamp: Date;
}

interface StorageInfo {
  used: number;
  total: number;
  date: string;
  documentUsage: number;
  imageUsage: number;
  mediaUsage: number;
}

interface UserStats {
  totalCount: number;
}

interface UploadPerDay {
  date: string;
  count: Decimal;
}

export const getTotalFiles = async (userId: string): Promise<number> => {
  const totalFiles = await prisma.file.count({ where: { userId } });
  return totalFiles;
};

export const recentActivity = async (
  userId: string
): Promise<RecentActivity[]> => {
  try {
    const recentActivities = await prisma.fileActivity.findMany({
      take: 10,
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        File: {
          select: {
            name: true,
          },
        },
        Folder: {
          select: {
            name: true,
          },
        },
      },
    });

    // Ensure that we return an array of RecentActivity
    return recentActivities.map(
      (activity): RecentActivity => ({
        id: activity.id,
        fileName:
          activity.File?.name || activity.Folder?.name || "Unknown File",
        action: activity.action,
        timestamp: activity.createdAt, // Keep as Date type
      })
    );
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
};

export const storageInfo = async (
  userId: string
): Promise<StorageInfo | null> => {
  const user = await prisma.user.findFirst({ where: { id: userId } });

  if (user) {
    const maxStorageSize = user.maxStorageSize;

    const totalUsed = await prisma.file.aggregate({
      _sum: {
        size: true,
      },
      where: {
        userId: userId,
        trashed: false,
      },
    });

    const documentUsage = await prisma.file.aggregate({
      _sum: {
        size: true,
      },
      where: {
        userId: userId,
        trashed: false,
        mimeType: {
          startsWith: "application/",
        },
      },
    });

    const imageUsage = await prisma.file.aggregate({
      _sum: {
        size: true,
      },
      where: {
        userId: userId,
        trashed: false,
        mimeType: {
          startsWith: "image/",
        },
      },
    });

    const mediaUsage = await prisma.file.aggregate({
      _sum: {
        size: true,
      },
      where: {
        userId: userId,
        trashed: false,
        mimeType: {
          startsWith: "video/",
        },
      },
    });

    return {
      used: totalUsed._sum.size || 0,
      total: maxStorageSize || 0,
      date: "",
      documentUsage: documentUsage._sum.size || 0,
      imageUsage: imageUsage._sum.size || 0,
      mediaUsage: mediaUsage._sum.size || 0,
    };
  } else {
    return null;
  }
};

export const userStats = async (userId: string): Promise<UserStats> => {
  const totalCount = await prisma.user.count({
    where: {
      id: userId,
      lastActive: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in the last 30 days
      },
    },
  });

  return { totalCount };
};

export const getStorageUsageHistory = async (
  userId: string
): Promise<StorageInfo[] | null> => {
  const history = await prisma.storageHistory.findMany({
    where: { userId },
    orderBy: { timestamp: "asc" },
  });

  if (history.length === 0) {
    return null;
  }

  return history.map((entry) => ({
    used: entry.usedStorage,
    date: entry.timestamp.toISOString().split("T")[0],
    total: entry.totalStorage,
    documentUsage: 0,
    imageUsage: 0,
    mediaUsage: 0,
  }));
};

export const getFileTypeDistribution = async (
  userId: string
): Promise<{ labels: string[]; datasets: any[] }> => {
  const distribution = await prisma.file.groupBy({
    by: ["fileType"],
    _count: { id: true },
    where: { userId },
  });

  const labels = distribution
    .map((item) => item.fileType)
    .filter(
      (fileType): fileType is string =>
        fileType !== null && fileType !== undefined
    );

  const data = distribution.map((item) => item._count.id);

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderWidth: 1,
      },
    ],
  };
};

export const getFileUploadsPerDay = async (
  userId: string
): Promise<{ labels: string[]; datasets: any[] }> => {
  const uploads = await prisma.$queryRaw<UploadPerDay[]>`
        SELECT
            TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') as date,
            COUNT(id) as count
        FROM "files"
        WHERE "userId" = ${userId}
        AND "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt");
    `;

  const labels = uploads.map((upload) => upload.date);
  const data = uploads.map((upload) => Number(upload.count));

  return {
    labels,
    datasets: [
      {
        label: "File Uploads",
        data,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };
};
