import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { errorResponse, isPrismaError } from "../lib/validation.js";
import { SESSION_ORDER } from "../lib/order.js";
import { pageArgs, pageMeta, queryInt, queryString } from "../lib/pagination.js";
import type { Prisma } from "@prisma/client";

const router = Router();

// GET /sessions?page&limit&q&courseId&from&to
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const page = pageArgs(req);
    const q = queryString(req.query.q);
    const courseId = queryInt(req.query.courseId);
    const fromParam = queryString(req.query.from);
    const toParam = queryString(req.query.to);
    const from = fromParam ? new Date(fromParam) : undefined;
    const to = toParam ? new Date(toParam) : undefined;

    if (from && to && to <= from) {
      return errorResponse(res, 400, "to must be after from");
    }

    const where: Prisma.ClassSessionWhereInput = {
      ...(courseId && { courseId }),
      ...((from || to) && { startsAt: { ...(from && { gte: from }), ...(to && { lt: to }) } }),
      ...(q && {
        OR: [
          { location: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { homework: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    const findSessions = prisma.classSession.findMany({
      where,
      orderBy: SESSION_ORDER,
      skip: page.skip,
      take: page.take,
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
    // One transaction, so the total counts the same rows the page was cut from.
    const [sessions, total] = await prisma.$transaction([findSessions, prisma.classSession.count({ where })]);

    return res.status(200).json({
      data: sessions,
      meta: pageMeta(page, total),
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
      return errorResponse(res, 500, "Failed to update session", "UPDATE_SESSION_ERROR");
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