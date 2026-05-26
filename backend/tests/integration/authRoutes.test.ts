import request from "supertest";
import app from "../../src/app.js";
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';
import bcrypt from "bcrypt";

describe("POST /auth/login", () => {
  let token: string;

  beforeAll(async () => {
    // Run migrations & seed
    const hashedPassword = await bcrypt.hash("password", 10);
    await prisma.user.deleteMany({
      where: { email: "test@example.com" },
    });
    await prisma.user.create({
        data: {
            firstName: "Thomas",
            secondName: "Parratt",
            email: "test@example.com",
            password: hashedPassword,
            role: "instructor",
        },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: "test@example.com" },
    });
  });

  it('should login and return JWT token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
    token = response.body.data.token;
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrong' });
    
    expect(response.status).toBe(401);
  });
});