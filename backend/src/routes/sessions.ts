import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// GET /sessions
router.get("/", requireAuth, async (req, res) => {
  try {
    const sessions = await prisma.classSession.findMany({
      select: {
        id: true,
        courseId: true,
        startsAt: true,
        endsAt: true,
        content: true,
        homework: true,
        createdAt: true,
        course: {
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
        },
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

// POST /sessions
router.post(
  "/",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const { courseId, startsAt, endsAt } = req.body;

      // Validation
      if (!courseId || !startsAt) {
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
          startsAt,
          endsAt: endsAt || null,
        },
        select: {
          id: true,
          courseId: true,
          startsAt: true,
          endsAt: true,
          content: true,
          homework: true,
          createdAt: true,
          course: {
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
          },
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

// PATCH /session/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const sessionId = Number(req.params.id);

      if (!Number.isInteger(sessionId) || sessionId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid session ID",
            code: "INVALID_ID",
          },
        });
      }

      const { startsAt, endsAt, content, homework } = req.body;

      const updateData: {
        startsAt?: string;
        endsAt?: string | null;
        content?: string;
        homework?: string;
      } = {};

      if (startsAt !== undefined) updateData.startsAt = startsAt;
      if (endsAt !== undefined) updateData.endsAt = endsAt;
      if (content !== undefined) updateData.content = content;
      if (homework !== undefined) updateData.homework = homework;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: {
            message: "No valid fields provided",
            code: "EMPTY_UPDATE",
          },
        });
      }

      const updatedSession = await prisma.classSession.update({
        where: { id: sessionId },
        data: updateData,
        select: {
          id: true,
          courseId: true,
          startsAt: true,
          endsAt: true,
          content: true,
          homework: true,
          createdAt: true,
          course: {
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
          },
        },
      });

      return res.status(200).json({
        data: updatedSession,
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
);

// DELETE /session/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const sessionId = Number(req.params.id);

      if (!Number.isInteger(sessionId) || sessionId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid session ID",
            code: "INVALID_ID",
          },
        });
      }

      await prisma.classSession.delete({
        where: { id: sessionId },
      });

      return res.status(200).json({
        data: {
          message: "Session deleted successfully",
        },
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: {
          message: "Failed to delete session",
          code: "DELETE_SESSION_ERROR",
        },
      });
    }
  }
);

export default router;