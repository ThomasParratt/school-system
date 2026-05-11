import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// GET /courses
router.get("/", requireAuth, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        language: true,
        level: true,
        material: true,
        room: true,
        instructorId: true,
        createdAt: true,
        updatedAt: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            secondName: true,
            email: true,
            role: true,
            level: true,
            comments: true,
          },
        },
        sessions: {
          select: {
            id: true,
            courseId: true,
            startsAt: true,
            endsAt: true,
            content: true,
            homework: true,
            createdAt: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            courseId: true,
            createdAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      data: courses,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch courses",
        code: "FETCH_COURSES_ERROR",
      },
    });
  }
});

// POST /courses
router.post(
  "/",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const { title, language, level, material } = req.body;

      // Validation
      if (!title || !language || !level || !material) {
        return res.status(400).json({
          error: {
            message: "Missing required fields",
            code: "VALIDATION_ERROR",
          },
        });
      }

      const course = await prisma.course.create({
        data: {
          title,
          language,
          level,
          material,
          instructor: {
            connect: {
              id: req.user!.id,
            },
          },
        },
        select: {
          id: true,
          title: true,
          language: true,
          level: true,
          material: true,
          room: true,
          instructorId: true,
          createdAt: true,
          updatedAt: true,
          instructor: {
            select: {
              id: true,
              firstName: true,
              secondName: true,
              email: true,
              role: true,
              level: true,
              comments: true,
            },
          },
          sessions: {
            select: {
              id: true,
              courseId: true,
              startsAt: true,
              endsAt: true,
              content: true,
              homework: true,
              createdAt: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              userId: true,
              courseId: true,
              createdAt: true,
            },
          },
        },
      });

      return res.status(201).json({
        data: course,
      });
    } catch (err: unknown) {
      console.error(err);

      return res.status(500).json({
        error: {
          message: "Failed to create course",
          code: "CREATE_COURSE_ERROR",
        },
      });
    }
  }
);

// PATCH /courses/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const courseId = Number(req.params.id);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid course ID",
            code: "INVALID_ID",
          },
        });
      }
      
      const { title, language, level, material } = req.body;

      const updateData: {
        title?: string;
        language?: string;
        level?: string;
        material?: string;
      } = {};

      if (title !== undefined) updateData.title = title;
      if (language !== undefined) updateData.language = language;
      if (level !== undefined) updateData.level = level;
      if (material !== undefined) updateData.material = material;
    
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: {
            message: "No valid fields provided",
            code: "EMPTY_UPDATE",
          },
        });
      }

      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: updateData,
        select: {
          id: true,
          title: true,
          language: true,
          level: true,
          material: true,
          room: true,
          instructorId: true,
          createdAt: true,
          updatedAt: true,
          instructor: {
            select: {
              id: true,
              firstName: true,
              secondName: true,
              email: true,
              role: true,
              level: true,
              comments: true,
            },
          },
          sessions: {
            select: {
              id: true,
              courseId: true,
              startsAt: true,
              endsAt: true,
              content: true,
              homework: true,
              createdAt: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              userId: true,
              courseId: true,
              createdAt: true,
            },
          },
        },
      });

      return res.status(200).json({
        data: updatedCourse,
      });
  } catch (err: unknown) {
      console.error(err);

      return res.status(500).json({
        error: {
          message:
            err instanceof Error
              ? err.message
              : "Unexpected server error",
          code: "SERVER_ERROR",
        },
      });
    }
  }
)


// DELETE /courses/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const courseId = Number(req.params.id);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid course ID",
            code: "INVALID_ID",
          },
        });
      }

      await prisma.course.delete({
        where: { id: courseId },
      });

      return res.status(200).json({
        data: {
          message: "Course deleted successfully",
        },
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: {
          message: "Failed to delete course",
          code: "DELETE_COURSE_ERROR",
        },
      });
    }
  }
);

export default router;