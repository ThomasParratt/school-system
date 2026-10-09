import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signAuthToken } from "../lib/auth.js";
import { validEmail } from "../lib/validation.js";

const router = Router();

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const body = req.body;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return res.status(400).json({
        error: { message: "Request body must be a JSON object", code: "VALIDATION_ERROR" },
      });
    }
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: "Missing email or password",
          code: "VALIDATION_ERROR",
        },
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: {
          message: "Invalid email or password format",
          code: "VALIDATION_ERROR",
        },
      });
    }

    if (!validEmail(email)) {
      return res.status(400).json({
        error: {
          message: "Invalid email format",
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

export default router;
