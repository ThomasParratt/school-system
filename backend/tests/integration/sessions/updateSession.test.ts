import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createSession } from "../factories/sessionFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("PATCH /sessions/:id", () => {
  let sessionId: number;

  beforeEach(async () => {
    const session = await createSession();
    sessionId = session.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should update session location", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .patch(`/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ location: "Room 202" });

    expect(response.status).toBe(200);
    expect(response.body.data.location).toBe("Room 202");
    expect(response.body.data.id).toBe(sessionId);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).patch(`/sessions/${sessionId}`);

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .patch(`/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ location: "Room 202" });

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject empty update", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .patch(`/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response).toSatisfyApiSpec();
  });
});