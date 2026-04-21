import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET ?? "supersecretkey";

// GET all users
router.get("/", async (req, res) => {
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
router.post("/", async (req, res) => {
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
        password: hashedPassword
      },
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true
      }
    });

    res.status(201).json({
      id: user.id,
      first_name: user.firstName,
      second_name: user.secondName,
      email: user.email
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

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        first_name: user.firstName,
        second_name: user.secondName,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

export default router;