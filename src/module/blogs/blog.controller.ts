// src/modules/blogs/blog.controller.ts
import { Request, Response } from "express";
import {
  getPublishedBlogs,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishStatus,
  getBlogAdminById,
} from "./blog.service";

// Get all published blogs (public)
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const result = await getPublishedBlogs();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get blogs controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all blogs (admin only)
export const getAdminBlogs = async (req: Request, res: Response) => {
  try {
    const result = await getAllBlogs();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get admin blogs controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single blog by ID or slug
export const getBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = !!(req as any).user; // Check if user is authenticated (admin)

    const result = await getBlogById(id, isAdmin);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get blog controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new blog
export const createBlogController = async (req: Request, res: Response) => {
  try {
    const { title, content, published } = req.body;
    const authorId = (req as any).user.userId;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const result = await createBlog({
      title,
      content,
      published: published || false,
      authorId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Create blog controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update blog
export const updateBlogController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;
    const authorId = (req as any).user.userId;

    const result = await updateBlog(
      id,
      { title, content, published },
      authorId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Update blog controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// src/modules/blogs/blog.controller.ts
// Get single blog by ID (public route)
export const getAdminBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await getBlogAdminById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get blog by ID controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete blog
export const deleteBlogController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authorId = (req as any).user.userId;

    const result = await deleteBlog(id, authorId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Delete blog controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Toggle publish status
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authorId = (req as any).user.userId;

    const result = await togglePublishStatus(id, authorId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Toggle publish controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
