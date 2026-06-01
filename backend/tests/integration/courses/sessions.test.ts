import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createCourse } from "../factories/courseFactory.js";
import { createSession } from "../factories/sessionFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("GET and POST /courses/:id/sessions", () => {
  let courseId: number;
  let sessionId: number;

  beforeEach(async () => {
    const course = await createCourse();
    const session = await createSession({ courseId: course.id });

    courseId = course.id;
    sessionId = session.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should return all sessions for a course", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .get(`/courses/${courseId}/sessions`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0].id).toBe(sessionId);
    expect(response).toSatisfyApiSpec();
  });

  it("should create a new session for a course", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .post(`/courses/${courseId}/sessions`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        location: "Room 201",
        startsAt: "2026-06-01T10:00:00.000Z",
        endsAt: "2026-06-01T11:00:00.000Z",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.courseId).toBe(courseId);
    expect(response.body.data.location).toBe("Room 201");
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request for creating sessions", async () => {
    const response = await request(app).post(`/courses/${courseId}/sessions`);

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role for creating sessions", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .post(`/courses/${courseId}/sessions`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        location: "Room 201",
        startsAt: "2026-06-01T10:00:00.000Z",
      });

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });
});