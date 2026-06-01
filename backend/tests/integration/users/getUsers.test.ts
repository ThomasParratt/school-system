import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../../src/lib/prisma.js';
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createUser } from "../factories/userFactory.js";

describe("GET /users", () => {

  beforeAll(async () => {
    await createUser();
    await createUser();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
  });

  it('should return all users', async () => {
    const token = await loginAsInstructor();
    const response = await request(app)
      .get('/users')
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
  });

  it('should reject unauthenticated request', async () => {
    const response = await request(app)
      .get('/users')
    
    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it('should reject unauthorized role', async () => {
    const token = await loginAsStudent();
    const response = await request(app)
      .get('/users')
      .set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });
});