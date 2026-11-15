import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { errorResponse, isPrismaError } from "../lib/validation.js";
import { SESSION_ORDER } from "../lib/order.js";

const router = Router();

// GET /sessions
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const sessions = await prisma.classSession.findMany({
      orderBy: SESSION_ORDER,
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

// GET /sessions/:id
router.get("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
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

    if (!session) return errorResponse(res, 404, "Session not found", "SESSION_NOT_FOUND");
    return res.status(200).json({
      data: session,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch session",
        code: "FETCH_SESSION_ERROR",
      },
    });
  }
});

// PATCH /sessions/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const sessionId = Number(req.params.id);

      const { location, startsAt, endsAt, content, homework } = req.body;

      const updateData: {
        location?: string;
        startsAt?: string;
        endsAt?: string | null;
        content?: string;
        homework?: string;
      } = {};

      if (location !== undefined) updateData.location = location;
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

      const currentSession = await prisma.classSession.findUnique({
        where: { id: sessionId },
        select: { startsAt: true, endsAt: true },
      });
      if (!currentSession) return errorResponse(res, 404, "Session not found", "SESSION_NOT_FOUND");
      const effectiveStarts = startsAt ?? currentSession.startsAt.toISOString();
      const effectiveEnds = endsAt === undefined ? currentSession.endsAt?.toISOString() : endsAt;
      if (effectiveEnds !== undefined && effectiveEnds !== null &&
          Date.parse(effectiveEnds) <= Date.parse(effectiveStarts)) {
        return errorResponse(res, 400, "endsAt must be after startsAt");
      }

      const updatedSession = await prisma.classSession.update({
        where: { id: sessionId },
        data: updateData,
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
        data: updatedSession,
      });
    } catch (err: unknown) {
      console.error(err);

      if (isPrismaError(err, "P2025")) {
        return errorResponse(res, 404, "Session not found", "SESSION_NOT_FOUND");
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
);

// DELETE /sessions/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const sessionId = Number(req.params.id);

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

      if (isPrismaError(err, "P2025")) {
        return errorResponse(res, 404, "Session not found", "SESSION_NOT_FOUND");
      }
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