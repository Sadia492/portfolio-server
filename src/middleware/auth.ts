// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../module/auth/auth.service"; // FIXED: "modules" not "module"

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Protect routes - verify JWT token
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // 1. Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2. Check cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    console.log("🔐 Token found:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Verify token
    const payload = verifyToken(token);

    console.log("🔐 Token payload:", payload);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Require owner role
export const requireOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "OWNER") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this route - Owner access required",
    });
  }
  next();
};

// Require admin or owner role
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || (req.user.role !== "OWNER" && req.user.role !== "ADMIN")) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this route - Admin access required",
    });
  }
  next();
};
