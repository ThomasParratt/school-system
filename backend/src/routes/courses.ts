import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { Prisma, type Language, type Level } from "@prisma/client";
import {
  errorResponse,
  isPrismaError,
  LANGUAGES,
  LEVELS,
  nonEmptyString,
  positiveInteger,
  positiveIntegerParam,
  validDateTime,
} from "../lib/validation.js";

const router = Router();

// GET /courses
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
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
  requireRole("admin"),
  async (req, res) => {
    try {
      const { title, language, level, instructorId, material } = req.body;

      // Validation
      if (!nonEmptyString(title) || !nonEmptyString(language) || !nonEmptyString(level) ||
          !nonEmptyString(material) || !positiveInteger(instructorId)) {
        return errorResponse(res, 400, "Missing or invalid required fields");
      }
      if (!LANGUAGES.includes(language as typeof LANGUAGES[number]) ||
          !LEVELS.includes(level as typeof LEVELS[number])) {
        return errorResponse(res, 400, "Invalid language or level");
      }
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { id: true, role: true },
      });
      if (!instructor || instructor.role !== "instructor") {
        return errorResponse(res, 404, "Instructor not found", "INSTRUCTOR_NOT_FOUND");
      }

      const course = await prisma.course.create({
        data: {
          title,
          language: language as Language,
          level: level as Level,
          material,
          instructor: {
            connect: {
              id: instructorId,
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

      if (isPrismaError(err, "P2025")) {
        return errorResponse(res, 404, "Instructor not found", "INSTRUCTOR_NOT_FOUND");
      }
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
router.get("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const courseId = positiveIntegerParam(req.params.id);

    if (!courseId) {
      return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
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

    if (!course) return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
    return res.status(200).json({ data: course });
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
  requireRole("admin"),
  async (req, res) => {
    try {
      const courseId = positiveIntegerParam(req.params.id);

      if (!courseId) {
        return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
      }
      
      const { title, language, level, material, instructorId } = req.body;

      const updateData: Prisma.CourseUpdateInput = {};

      if (title !== undefined) updateData.title = title;
      if (language !== undefined) updateData.language = language;
      if (level !== undefined) updateData.level = level;
      if (material !== undefined) updateData.material = material;

      if (instructorId !== undefined) {
        updateData.instructor = {
          connect: {
            id: instructorId,
          },
        };
      }
    
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: {
            message: "No valid fields provided",
            code: "EMPTY_UPDATE",
          },
        });
      }
      if ((title !== undefined && !nonEmptyString(title)) ||
          (material !== undefined && !nonEmptyString(material)) ||
          (language !== undefined && !LANGUAGES.includes(language as typeof LANGUAGES[number])) ||
          (level !== undefined && !LEVELS.includes(level as typeof LEVELS[number])) ||
          (instructorId !== undefined && !positiveInteger(instructorId))) {
        return errorResponse(res, 400, "Invalid course fields");
      }
      if (instructorId !== undefined) {
        const instructor = await prisma.user.findUnique({
          where: { id: instructorId },
          select: { role: true },
        });
        if (!instructor || instructor.role !== "instructor") {
          return errorResponse(res, 404, "Instructor not found", "INSTRUCTOR_NOT_FOUND");
        }
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

      if (isPrismaError(err, "P2025")) {
        return errorResponse(res, 404, "Course or instructor not found", "NOT_FOUND");
      }
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
  requireRole("admin"),
  async (req, res) => {
    try {
      const courseId = positiveIntegerParam(req.params.id);

      if (!courseId) {
        return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
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

      if (isPrismaError(err, "P2025")) {
        return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
      }
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
    const courseId = positiveIntegerParam(req.params.id);

    if (!courseId) {
      return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
      }
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
      
      const sessions = await prisma.classSession.findMany({
      where: { courseId: courseId },
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
  requireRole("admin"),
  async (req, res) => {
    try {
      const courseId = positiveIntegerParam(req.params.id);

      if (!courseId) {
        return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
      }

      const { location, startsAt, endsAt, content, homework } = req.body;

      // Validation
      if (!nonEmptyString(location) || !validDateTime(startsAt) ||
          (endsAt !== undefined && endsAt !== null && !validDateTime(endsAt))) {
        return errorResponse(res, 400, "Invalid session fields");
      }
      if (endsAt !== undefined && endsAt !== null && Date.parse(endsAt) <= Date.parse(startsAt)) {
        return errorResponse(res, 400, "endsAt must be after startsAt");
      }
      if ((content !== undefined && content !== null && !nonEmptyString(content)) ||
          (homework !== undefined && homework !== null && !nonEmptyString(homework))) {
        return errorResponse(res, 400, "Invalid session fields");
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");

      const session = await prisma.classSession.create({
        data: {
          courseId,
          location,
          startsAt,
          endsAt: endsAt ?? null,
          content: content ?? null,
          homework: homework ?? null,
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

      if (isPrismaError(err, "P2002")) {
        return errorResponse(res, 409, "A session already exists at this start time", "SESSION_EXISTS");
      }
      if (isPrismaError(err, "P2025")) {
        return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
      }
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
  requireRole("admin"),
  async (req, res) => {
    try {
      const courseId = positiveIntegerParam(req.params.id);

      if (!courseId) {
        return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
      }

      const { userId } = req.body;

      if (!positiveInteger(userId)) {
        return errorResponse(res, 400, "Invalid user ID", "INVALID_ID");
      }

      const [course, user] = await Promise.all([
        prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
        prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } }),
      ]);
      if (!course) return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
      if (!user) return errorResponse(res, 404, "User not found", "USER_NOT_FOUND");
      if (user.role !== "student") return errorResponse(res, 400, "Only students can enroll", "INVALID_ENROLLMENT_USER");

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
  requireRole("admin"),
  async (req, res) => {
    try {
      const courseId = positiveIntegerParam(req.params.courseId);
      const studentId = positiveIntegerParam(req.params.studentId);

      if (!courseId) {
        return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
      }

      if (!studentId) {
        return errorResponse(res, 400, "Invalid user ID", "INVALID_ID");
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

// GET /courses/:id/enrollments
router.get("/:id/enrollments", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const courseId = positiveIntegerParam(req.params.id);

    if (!courseId) {
      return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
    
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: courseId },
      include: {
        user: true,
      },
    });
    return res.status(200).json({
      data: enrollments,
    });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: {
          message: "Failed to fetch enrollments",
          code: "FETCH_ENROLLMENTS_ERROR",
        },
      });
    }
  });

export default router;