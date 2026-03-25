import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = "supersecretkey"; // In prod, use env variable

// GET all admin
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching admin");
  }
});

// POST /admin - create new admin
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password ) {
    return res.status(400).send("Missing fields");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO admin (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating admin");
  }
});

// POST /adminlogin - login admin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing fields");

  try {
    const result = await pool.query("SELECT * FROM admin WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).send("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Invalid credentials");

    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

export default router;