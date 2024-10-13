import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import speakeasy from "speakeasy";

// Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.twoFactorEnabled) {
      // Generate and send 2FA code
      const secret = speakeasy.generateSecret();
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
      });

      // Save the secret temporarily (you might want to use Redis for this)
      user.twoFactorSecret = secret.base32;
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret.base32 },
      });

      // Send the token via email
      // Implement your email sending logic here

      return res
        .status(200)
        .json({ message: "2FA code sent", requiresTwoFactor: true });
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  // In a real-world scenario, you might want to invalidate the refresh token
  res.status(200).json({ message: "Logged out successfully" });
};

// Two-factor authentication verification
export const verifyTwoFactor = async (req: Request, res: Response) => {
  const { email, token } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
    });

    if (verified) {
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      // Clear the temporary secret
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: null },
      });

      res.status(200).json({ accessToken, refreshToken });
    } else {
      res.status(400).json({ message: "Invalid 2FA code" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_RESET_SECRET!,
      { expiresIn: "1h" }
    );

    // Save the reset token and its expiry
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) },
    });

    // Send reset password email
    // Implement your email sending logic here

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET!) as {
      userId: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.resetToken || user.resetTokenExpiry! < new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Confirm email
export const confirmEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET!) as {
      userId: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailConfirmed: true },
    });

    res.status(200).json({ message: "Email confirmed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
