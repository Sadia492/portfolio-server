// src/app.ts
import compression from "compression";
import cors from "cors";
import express from "express";
import { authRoutes } from "./module/auth/auth.routes";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(compression());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

export default app;
