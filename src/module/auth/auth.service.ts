// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../../config/db";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const BCRYPT_SALT_ROUNDS = 12;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  message?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

// Authenticate user with email and password
export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const { email, password } = credentials;

    // Validate input
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required",
      };
    }

    // Validate email format
    if (!validateEmail(email)) {
      return {
        success: false,
        message: "Invalid email format",
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      } as JwtPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data (excluding password)
    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("AuthService login error:", error);
    return {
      success: false,
      message: "Internal server error during authentication",
    };
  }
};

// Get current user profile
export const getCurrentUser = async (userId: string): Promise<AuthResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("AuthService getCurrentUser error:", error);
    return {
      success: false,
      message: "Error fetching user profile",
    };
  }
};
