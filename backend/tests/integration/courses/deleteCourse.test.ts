import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createCourse } from "../factories/courseFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("DELETE /courses/:id", () => {
  let courseId: number;

  beforeEach(async () => {
    const course = await createCourse();
    courseId = course.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should delete course", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .delete(`/courses/${courseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe("Course deleted successfully");
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).delete(`/courses/${courseId}`);

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .delete(`/courses/${courseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });
});