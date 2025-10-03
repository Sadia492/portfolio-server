import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { authRoutes } from "./module/auth/auth.routes";
import { blogRoutes } from "./module/blogs/blog.routes";
import { projectRoutes } from "./module/projects/project.routes";

const app = express();

// Middleware
app.use(compression()); // Compresses response bodies for faster delivery
app.use(express.json()); // Parse incoming JSON requests

app.use(
  cors({
    origin: "https://portfolio-client-five-psi.vercel.app",
    credentials: true,
  })
);

app.use(cookieParser());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/projects", projectRoutes);

// Default route for testing
app.get("/", (_req, res) => {
  res.send("API is running");
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;
