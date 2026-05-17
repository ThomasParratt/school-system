import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

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