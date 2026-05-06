import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { signAuthToken } from "../lib/auth.js";

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
      const { firstName, secondName, email, password } = req.body;

      // Validation
      if (!firstName || !secondName || !email || !password) {
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
        },
        select: {
          id: true,
          firstName: true,
          secondName: true,
          email: true,
          role: true,
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


// POST /auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: "Missing email or password",
          code: "VALIDATION_ERROR",
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        error: {
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    const token = signAuthToken({
      id: user.id,
      role: user.role,
    });

    return res.status(200).json({
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          secondName: user.secondName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Login failed",
        code: "LOGIN_ERROR",
      },
    });
  }
});


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