import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { signAuthToken } from "../lib/auth.js";

const router = Router();
const SALT_ROUNDS = 10;

// GET all users
router.get("/", requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        role: true
      }
    });

    return res.status(200).json({
      data: users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        secondName: user.secondName,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : "Unexpected server error",
    });
  }
});

// POST /users - create new user
router.post("/", requireAuth, requireRole("instructor"), async (req, res) => {
  const { firstName, secondName, email, password } = req.body;
  if (!firstName || !secondName || !email || !password ) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        firstName,
        secondName,
        email,
        password: hashedPassword,
        role: "student"
      },
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        role: true
      }
    });

    return res.status(201).json({
      data: {
        id: user.id,
        firstName: user.firstName,
        secondName: user.secondName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : "Unexpected server error",
    });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signAuthToken({ id: user.id, role: user.role });
    return res.status(200).json({
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          secondName: user.secondName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : "Unexpected server error",
    });
  }
});

// DELETE /users/:id - delete a user
router.delete("/:id", requireAuth, requireRole("instructor"), async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json({
      data: { message: "User deleted successfully" },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : "Unexpected server error",
    });
  }
});

export default router;