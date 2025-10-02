import { Router } from "express";
import {
  getProjects,
  getProject,
  getAdminProjects,
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from "./project.controller";
import { protect, requireOwner } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/", getProjects); // GET /api/projects - Get all projects
router.get("/:id", getProject); // GET /api/projects/:id - Get single project by ID or slug

// Protected routes (Owner only)
router.get("/admin/all", protect, requireOwner, getAdminProjects); // GET /api/projects/admin/all - Get all projects
router.post("/", protect, requireOwner, createProjectController); // POST /api/projects - Create new project
router.put("/:id", protect, requireOwner, updateProjectController); // PUT /api/projects/:id - Update project
router.delete("/:id", protect, requireOwner, deleteProjectController); // DELETE /api/projects/:id - Delete project

export const projectRoutes = router;
