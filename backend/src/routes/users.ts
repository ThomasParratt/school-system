import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();
const SALT_ROUNDS = 10;

// GET /users
router.get("/", requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        role: true,
        level: true,
        comments: true,
        createdAt: true,
        updatedAt: true,
        taughtCourses: {
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
      data: users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch users",
        code: "FETCH_USERS_ERROR",
      },
    });
  }
});

// POST /users (admin creates user)
router.post(
  "/",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const { firstName, secondName, email, password, level, comments } = req.body;

      // Validation
      if (!firstName || !secondName || !email || !password || !level || !comments ) {
        return res.status(400).json({
          error: {
            message: "Missing required fields",
            code: "VALIDATION_ERROR",
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await prisma.user.create({
        data: {
          firstName,
          secondName,
          email,
          password: hashedPassword,
          role: "student",
          level,
          comments
        },
        select: {
          id: true,
          firstName: true,
          secondName: true,
          email: true,
          role: true,
          level: true,
          comments: true
        },
      });

      return res.status(201).json({
        data: user,
      });
    } catch (err: unknown) {
      console.error(err);

      // Optional: handle duplicate email nicely
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return res.status(409).json({
          error: {
            message: "Email already exists",
            code: "EMAIL_ALREADY_EXISTS",
          },
        });
      }

      return res.status(500).json({
        error: {
          message: "Failed to create user",
          code: "CREATE_USER_ERROR",
        },
      });
    }
  }
);

// PATCH /users/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }
      
      const { firstName, secondName, email, level, comments } = req.body;

      const updateData: {
        firstName?: string;
        secondName?: string;
        email?: string;
        level?: string;
        comments?: string;
      } = {};

      if (firstName !== undefined) updateData.firstName = firstName;
      if (secondName !== undefined) updateData.secondName = secondName;
      if (email !== undefined) updateData.email = email;
      if (level !== undefined) updateData.level = level;
      if (comments !== undefined) updateData.comments = comments;
    
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: {
            message: "No valid fields provided",
            code: "EMPTY_UPDATE",
          },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          secondName: true,
          email: true,
          role: true,
          level: true,
          comments: true,
          createdAt: true,
          updatedAt: true,
          taughtCourses: {
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
        data: updatedUser,
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


// DELETE /users/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }

      await prisma.user.delete({
        where: { id: userId },
      });

      return res.status(200).json({
        data: {
          message: "User deleted successfully",
        },
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: {
          message: "Failed to delete user",
          code: "DELETE_USER_ERROR",
        },
      });
    }
  }
);

export default router;