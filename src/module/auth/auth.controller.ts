// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { loginUser, getCurrentUser } from "./auth.service";

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    if (!result.success) {
      return res.status(401).json(result);
    }

    // ✅ CORRECT: Store the TOKEN in cookie, not user data
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data (token is now in cookie)
    res.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get current user controller
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const result = await getCurrentUser(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get me controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logout controller
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
