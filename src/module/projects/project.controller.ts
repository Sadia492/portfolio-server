// src/modules/projects/project.controller.ts
import { Request, Response } from "express";
import {
  getPublishedProjects,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "./project.service";

// Get all projects (public)
export const getProjects = async (req: Request, res: Response) => {
  try {
    const result = await getPublishedProjects();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get projects controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all projects (admin only)
export const getAdminProjects = async (req: Request, res: Response) => {
  try {
    const result = await getAllProjects();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get admin projects controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single project by ID or slug
export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await getProjectById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get project controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new project
export const createProjectController = async (req: Request, res: Response) => {
  try {
    const { title, description, features, thumbnail, githubUrl, liveUrl } =
      req.body;
    const ownerId = (req as any).user.userId;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const result = await createProject({
      title,
      description,
      features,
      thumbnail,
      githubUrl,
      liveUrl,
      ownerId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Create project controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update project
export const updateProjectController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, features, thumbnail, githubUrl, liveUrl } =
      req.body;
    const ownerId = (req as any).user.userId;

    const result = await updateProject(
      id,
      { title, description, features, thumbnail, githubUrl, liveUrl },
      ownerId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Update project controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete project
export const deleteProjectController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user.userId;

    const result = await deleteProject(id, ownerId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Delete project controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
