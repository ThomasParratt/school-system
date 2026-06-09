import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// GET /courses
router.get("/", requireAuth, requireRole("instructor"), async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        language: true,
        level: true,
        material: true,
        instructorId: true,
        createdAt: true,
        updatedAt: true,
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
          instructorId: true,
          createdAt: true,
          updatedAt: true,
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

// GET /courses/:id
router.get("/:id", requireAuth, requireRole("instructor"), async (req, res) => {
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
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        language: true,
        level: true,
        instructorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      data: course,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch user",
        code: "FETCH_USER_ERROR",
      },
    });
  }
});

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
          instructorId: true,
          createdAt: true,
          updatedAt: true,
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

// GET /courses/:id/sessions
router.get("/:id/sessions", requireAuth, async (req, res) => {
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
      
    const sessions = await prisma.classSession.findMany({
      where: { courseId },
      select: {
        id: true,
        courseId: true,
        location: true,
        startsAt: true,
        endsAt: true,
        content: true,
        homework: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      data: sessions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch sessions",
        code: "FETCH_SESSIONS_ERROR",
      },
    });
  }
});

// POST /courses/:id/sessions
router.post(
  "/:id/sessions",
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

      const { location, startsAt, endsAt } = req.body;

      // Validation
      if (!location || !startsAt) {
        return res.status(400).json({
          error: {
            message: "Missing required fields",
            code: "VALIDATION_ERROR",
          },
        });
      }

      const session = await prisma.classSession.create({
        data: {
          courseId,
          location,
          startsAt,
          endsAt: endsAt || null,
        },
        select: {
          id: true,
          courseId: true,
          location: true,
          startsAt: true,
          endsAt: true,
          content: true,
          homework: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        data: session,
      });
    } catch (err: unknown) {
      console.error(err);

      return res.status(500).json({
        error: {
          message: "Failed to create session",
          code: "CREATE_SESSION_ERROR",
        },
      });
    }
  }
);

// POST /courses/:id/enroll
router.post(
  "/:id/enroll",
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

      const { userId } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId,
        },
        select: {
          id: true,
          userId: true,
          courseId: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        data: enrollment,
      });
    } catch (err: unknown) {
      console.error(err);

      // Handle unique constraint violation (duplicate enrollment)
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return res.status(409).json({
          error: {
            message: "Student is already enrolled in this course",
            code: "ENROLLMENT_EXISTS",
          },
        });
      }

      return res.status(500).json({
        error: {
          message: "Failed to create enrollment",
          code: "CREATE_ENROLLMENT_ERROR",
        },
      });
    }
  }
);

// DELETE /courses/:courseId/enrollments/:studentId
router.delete(
  "/:courseId/enrollments/:studentId",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);
      const studentId = Number(req.params.studentId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid course ID",
            code: "INVALID_ID",
          },
        });
      }

      if (!Number.isInteger(studentId) || studentId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }

      await prisma.enrollment.delete({
        where: {
          userId_courseId: {
            userId: studentId,
            courseId,
          },
        },
      });

      return res.status(200).json({
        data: {
          message: "Enrollment deleted successfully",
        },
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
        return res.status(404).json({
          error: {
            message: "Enrollment not found",
            code: "ENROLLMENT_NOT_FOUND",
          },
        });
      }

      console.error(err);

      return res.status(500).json({
        error: {
          message: "Failed to delete enrollment",
          code: "DELETE_ENROLLMENT_ERROR",
        },
      });
    }
  }
);

export default router;