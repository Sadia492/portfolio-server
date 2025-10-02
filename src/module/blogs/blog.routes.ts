// src/modules/blogs/blog.routes.ts
import { Router } from "express";
import {
  getBlogs,
  getBlog,
  getAdminBlogs,
  createBlogController,
  updateBlogController,
  deleteBlogController,
  togglePublish,
} from "./blog.controller";
import { protect, requireOwner } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/", getBlogs); // GET /api/blogs - Get all published blogs
router.get("/:id", getBlog); // GET /api/blogs/:id - Get single blog by ID or slug

// Protected routes (Owner only)
router.get("/admin/all", protect, requireOwner, getAdminBlogs); // GET /api/blogs/admin/all - Get all blogs (including unpublished)
router.post("/", protect, requireOwner, createBlogController); // POST /api/blogs - Create new blog
router.put("/:id", protect, requireOwner, updateBlogController); // PUT /api/blogs/:id - Update blog
router.delete("/:id", protect, requireOwner, deleteBlogController); // DELETE /api/blogs/:id - Delete blog
router.patch("/:id/publish", protect, requireOwner, togglePublish); // PATCH /api/blogs/:id/publish - Toggle publish status

export const blogRoutes = router;
