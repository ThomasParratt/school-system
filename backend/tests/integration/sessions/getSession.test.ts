import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createSession } from "../factories/sessionFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("GET /sessions/:id", () => {
  let sessionId: number;

  beforeEach(async () => {
    const session = await createSession();
    sessionId = session.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should return requested session", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .get(`/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(sessionId);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).get(`/sessions/${sessionId}`);

    expect(response.status).toBe(401);
  });
  
});