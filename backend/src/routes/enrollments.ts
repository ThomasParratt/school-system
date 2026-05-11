import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// GET /enrollments
router.get("/", requireAuth, requireRole("instructor"), async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
        userId: true,
        courseId: true,
        createdAt: true,
        user: {
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
        course: {
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
          },
        },
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

// POST /enrollments - Enroll a student on a course
router.post(
  "/",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const { userId, courseId } = req.body;

      // Validation
      if (!userId || !courseId) {
        return res.status(400).json({
          error: {
            message: "Missing required fields",
            code: "VALIDATION_ERROR",
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
          user: {
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
          course: {
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
            },
          },
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

// DELETE /enrollments/:id - Remove a student from a course
router.delete(
  "/:id",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const enrollmentId = Number(req.params.id);

      if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid enrollment ID",
            code: "INVALID_ID",
          },
        });
      }

      await prisma.enrollment.delete({
        where: { id: enrollmentId },
      });

      return res.status(200).json({
        data: {
          message: "Enrollment deleted successfully",
        },
      });
    } catch (err) {
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
