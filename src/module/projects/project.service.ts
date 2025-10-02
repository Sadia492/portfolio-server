// src/modules/projects/project.service.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";

export interface CreateProjectData {
  title: string;
  description: string;
  features?: string;
  thumbnail?: string;
  githubUrl?: string;
  liveUrl?: string;
  ownerId: string;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  features?: string;
  thumbnail?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface ProjectResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

// Get all projects (public)
export const getPublishedProjects = async (): Promise<ProjectResponse> => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        features: true,
        thumbnail: true,
        githubUrl: true,
        liveUrl: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: projects,
    };
  } catch (error) {
    console.error("Get projects error:", error);
    return {
      success: false,
      message: "Error fetching projects",
    };
  }
};

// Get all projects (admin only)
export const getAllProjects = async (): Promise<ProjectResponse> => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        features: true,
        thumbnail: true,
        githubUrl: true,
        liveUrl: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: projects,
    };
  } catch (error) {
    console.error("Get all projects error:", error);
    return {
      success: false,
      message: "Error fetching projects",
    };
  }
};

// Get project by ID or slug
export const getProjectById = async (id: string): Promise<ProjectResponse> => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error("Get project by ID error:", error);
    return {
      success: false,
      message: "Error fetching project",
    };
  }
};

// Create new project
export const createProject = async (
  projectData: CreateProjectData
): Promise<ProjectResponse> => {
  try {
    const {
      title,
      description,
      features,
      thumbnail,
      githubUrl,
      liveUrl,
      ownerId,
    } = projectData;

    // Validation
    if (!title || !description) {
      return {
        success: false,
        message: "Title and description are required",
      };
    }

    if (title.length < 3) {
      return {
        success: false,
        message: "Title must be at least 3 characters long",
      };
    }

    const slug = generateSlug(title);

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      return {
        success: false,
        message: "A project with similar title already exists",
      };
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        features,
        thumbnail,
        githubUrl,
        liveUrl,
        slug,
        ownerId,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error("Create project error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Project with this title already exists",
        };
      }
    }

    return {
      success: false,
      message: "Error creating project",
    };
  }
};

// Update project
export const updateProject = async (
  id: string,
  projectData: UpdateProjectData,
  ownerId: string
): Promise<ProjectResponse> => {
  try {
    // Check if project exists and user is owner
    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingProject) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    if (existingProject.ownerId !== ownerId) {
      return {
        success: false,
        message: "Not authorized to update this project",
      };
    }

    const updateData: any = { ...projectData };

    // Generate new slug if title is updated
    if (projectData.title && projectData.title !== existingProject.title) {
      updateData.slug = generateSlug(projectData.title);
    }

    const project = await prisma.project.update({
      where: { id: existingProject.id },
      data: updateData,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error("Update project error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Project with this title already exists",
        };
      }
    }

    return {
      success: false,
      message: "Error updating project",
    };
  }
};

// Delete project
export const deleteProject = async (
  id: string,
  ownerId: string
): Promise<ProjectResponse> => {
  try {
    // Check if project exists and user is owner
    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingProject) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    if (existingProject.ownerId !== ownerId) {
      return {
        success: false,
        message: "Not authorized to delete this project",
      };
    }

    await prisma.project.delete({
      where: { id: existingProject.id },
    });

    return {
      success: true,
      message: "Project deleted successfully",
    };
  } catch (error) {
    console.error("Delete project error:", error);
    return {
      success: false,
      message: "Error deleting project",
    };
  }
};
