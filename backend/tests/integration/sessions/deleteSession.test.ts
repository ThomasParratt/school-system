import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createSession } from "../factories/sessionFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("DELETE /sessions/:id", () => {
  let sessionId: number;

  beforeEach(async () => {
    const session = await createSession();
    sessionId = session.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should delete session", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .delete(`/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe("Session deleted successfully");
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).delete(`/sessions/${sessionId}`);

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .delete(`/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });
});