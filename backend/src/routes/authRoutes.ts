import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { authSession } from "../lib/auth.js";

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

    return res.status(200).json({ data: authSession(user) });
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
