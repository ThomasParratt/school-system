import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signAuthToken } from "../lib/auth.js";

const router = Router();

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    // Shape and field types are checked against openapi.yaml before this runs.
    const { email, password } = req.body;

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
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
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
