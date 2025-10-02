// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { login, getMe, logout } from "./auth.controller";
import { protect } from "../../middleware/auth";

const router = Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", logout);

export const authRoutes = router;
