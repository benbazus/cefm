import jwt from "jsonwebtoken";
import prisma from "../config/database";
import crypto from "crypto";
import { z } from "zod";

const resetTokenSchema = z.object({
  token: z.string().optional(),
  userId: z.string().uuid(),
});

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_EXPIRY = "7d";
const RESET_TOKEN_EXPIRY = "7d";

export const generateAccessToken = async (userId: string) => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { accessToken, refreshToken };
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const tokenPayload = {
    userId,
    randomId: crypto.randomBytes(16).toString("hex"),
  };

  const refreshToken = jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  try {
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return generateRefreshToken(userId);
    }
    throw error;
  }

  return refreshToken;
};

const generateResetToken = async () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generatePasswordResetToken = async (
  token: string,
  userId: string
): Promise<{ resetToken: string } | null> => {
  try {
    const { error } = resetTokenSchema.safeParse({ token, userId });
    if (error) {
      throw new Error("Invalid input");
    }

    const resetToken = await generateResetToken();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(
          Date.now() + parseInt(RESET_TOKEN_EXPIRY, 10) * 1000
        ),
      },
    });

    return { resetToken };
  } catch (error) {
    console.error("Error generating reset token:", error);
    return null;
  }
};

export const verifyAccessToken = (token: string): { userId: string } | null => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET!) as { userId: string };
};

export const verifyRefreshToken = async (
  token: string
): Promise<string | null> => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET!) as {
    userId: string;
  };
  const storedToken = await prisma.refreshToken.findFirst({
    where: { token, userId: decoded.userId, expiresAt: { gt: new Date() } },
  });

  if (!storedToken) return null;

  return decoded.userId;
};

export const invalidateRefreshToken = async (token: string) => {
  await prisma.refreshToken.delete({ where: { token } });
};
