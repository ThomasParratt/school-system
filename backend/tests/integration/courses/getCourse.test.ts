import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createCourse } from "../factories/courseFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("GET /courses/:id", () => {
  let courseId: number;

  beforeEach(async () => {
    const course = await createCourse();
    courseId = course.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should return requested course", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .get(`/courses/${courseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(courseId);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).get(`/courses/${courseId}`);

    expect(response.status).toBe(401);
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .get(`/courses/${courseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});