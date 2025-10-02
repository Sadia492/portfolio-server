import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  published?: boolean;
  authorId: string;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  excerpt?: string;
  published?: boolean;
}

export interface BlogResponse {
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

// Get all published blogs (public)
export const getPublishedBlogs = async (): Promise<BlogResponse> => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: {
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
      data: blogs,
    };
  } catch (error) {
    console.error("Get published blogs error:", error);
    return {
      success: false,
      message: "Error fetching blogs",
    };
  }
};

// Get all blogs (admin only - includes unpublished)
export const getAllBlogs = async (): Promise<BlogResponse> => {
  try {
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: {
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
      data: blogs,
    };
  } catch (error) {
    console.error("Get all blogs error:", error);
    return {
      success: false,
      message: "Error fetching blogs",
    };
  }
};

// Get blog by ID or slug (public if published, admin can see unpublished)
export const getBlogById = async (
  id: string,
  isAdmin: boolean = false
): Promise<BlogResponse> => {
  try {
    const whereCondition: any = {
      OR: [{ id }, { slug: id }],
    };

    // If not admin, only show published blogs
    if (!isAdmin) {
      whereCondition.published = true;
    }

    const blog = await prisma.blog.findFirst({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      return {
        success: false,
        message: "Blog not found",
      };
    }

    return {
      success: true,
      data: blog,
    };
  } catch (error) {
    console.error("Get blog by ID error:", error);
    return {
      success: false,
      message: "Error fetching blog",
    };
  }
};

// Create new blog
export const createBlog = async (
  blogData: CreateBlogData
): Promise<BlogResponse> => {
  try {
    const { title, content, published = false, authorId } = blogData;

    // Validation
    if (!title || !content) {
      return {
        success: false,
        message: "Title and content are required",
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
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return {
        success: false,
        message: "A blog with similar title already exists",
      };
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        slug,
        published,
        authorId,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: blog,
    };
  } catch (error) {
    console.error("Create blog error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Blog with this title already exists",
        };
      }
    }

    return {
      success: false,
      message: "Error creating blog",
    };
  }
};

// Update blog
export const updateBlog = async (
  id: string,
  blogData: UpdateBlogData,
  authorId: string
): Promise<BlogResponse> => {
  try {
    // Check if blog exists and user is author
    const existingBlog = await prisma.blog.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingBlog) {
      return {
        success: false,
        message: "Blog not found",
      };
    }

    if (existingBlog.authorId !== authorId) {
      return {
        success: false,
        message: "Not authorized to update this blog",
      };
    }

    const updateData: any = { ...blogData };

    // Generate new slug if title is updated
    if (blogData.title && blogData.title !== existingBlog.title) {
      updateData.slug = generateSlug(blogData.title);
    }

    const blog = await prisma.blog.update({
      where: { id: existingBlog.id },
      data: updateData,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: blog,
    };
  } catch (error) {
    console.error("Update blog error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          message: "Blog with this title already exists",
        };
      }
    }

    return {
      success: false,
      message: "Error updating blog",
    };
  }
};

// Delete blog
export const deleteBlog = async (
  id: string,
  authorId: string
): Promise<BlogResponse> => {
  try {
    // Check if blog exists and user is author
    const existingBlog = await prisma.blog.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingBlog) {
      return {
        success: false,
        message: "Blog not found",
      };
    }

    if (existingBlog.authorId !== authorId) {
      return {
        success: false,
        message: "Not authorized to delete this blog",
      };
    }

    await prisma.blog.delete({
      where: { id: existingBlog.id },
    });

    return {
      success: true,
      message: "Blog deleted successfully",
    };
  } catch (error) {
    console.error("Delete blog error:", error);
    return {
      success: false,
      message: "Error deleting blog",
    };
  }
};

// Toggle blog publish status
export const togglePublishStatus = async (
  id: string,
  authorId: string
): Promise<BlogResponse> => {
  try {
    const existingBlog = await prisma.blog.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingBlog) {
      return {
        success: false,
        message: "Blog not found",
      };
    }

    if (existingBlog.authorId !== authorId) {
      return {
        success: false,
        message: "Not authorized to update this blog",
      };
    }

    const blog = await prisma.blog.update({
      where: { id: existingBlog.id },
      data: {
        published: !existingBlog.published,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: blog,
      message: `Blog ${
        blog.published ? "published" : "unpublished"
      } successfully`,
    };
  } catch (error) {
    console.error("Toggle publish status error:", error);
    return {
      success: false,
      message: "Error updating blog status",
    };
  }
};
