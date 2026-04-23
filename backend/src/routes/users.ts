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

    res.json(
      users.map((user) => ({
        id: user.id,
        first_name: user.firstName,
        second_name: user.secondName,
        email: user.email,
        role: user.role
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

// POST /users - create new user
router.post("/", requireAuth, requireRole("instructor"), async (req, res) => {
  const { firstName, secondName, email, password } = req.body;
  if (!firstName || !secondName || !email || !password ) {
    return res.status(400).send("Missing fields");
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

    res.status(201).json({
      id: user.id,
      first_name: user.firstName,
      second_name: user.secondName,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing fields");

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).send("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Invalid credentials");

    const token = signAuthToken({ id: user.id, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        first_name: user.firstName,
        second_name: user.secondName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// DELETE /users/:id - delete a user
router.delete("/:id", requireAuth, requireRole("instructor"), async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).send("Invalid user ID");
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

export default router;