import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = "supersecretkey"; // In prod, use env variable

// GET all instructors
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, first_name, last_name, email");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching instructors");
  }
});

// POST /instructors - create new instructor
router.post("/", async (req, res) => {
  const { name, firstName, secondName, email, password } = req.body;
  if (!name || !firstName || !secondName || !email || !password ) {
    return res.status(400).send("Missing fields");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO instructors (name, first_name, second_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, first_name, second_name, email",
      [name, firstName, secondName, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating instructor");
  }
});

// POST /instructorlogin - login instructor
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing fields");

  try {
    const result = await pool.query("SELECT * FROM instructors WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).send("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user: { id: user.id, name: user.name, first_name: user.first_name, second_name: user.second_name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

export default router;