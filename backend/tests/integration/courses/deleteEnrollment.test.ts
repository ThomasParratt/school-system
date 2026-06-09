import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { cleanupTestData } from "../helpers/cleanup.js";
import { createCourse } from "../factories/courseFactory.js";
import { createEnrollment } from "../factories/enrollmentFactory.js";
import { createUser } from "../factories/userFactory.js";

describe("DELETE /courses/:courseId/enrollments/:studentId", () => {
  let courseId: number;
  let studentId: number;

  beforeEach(async () => {
    const course = await createCourse();
    const student = await createUser();

    courseId = course.id;
    studentId = student.id;

    await createEnrollment({
      courseId,
      userId: studentId,
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should delete enrollment", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .delete(`/courses/${courseId}/enrollments/${studentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe("Enrollment deleted successfully");
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).delete(
      `/courses/${courseId}/enrollments/${studentId}`
    );

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .delete(`/courses/${courseId}/enrollments/${studentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });

  it("should return 404 when enrollment does not exist", async () => {
    const token = await loginAsInstructor();

    await request(app)
      .delete(`/courses/${courseId}/enrollments/${studentId}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .delete(`/courses/${courseId}/enrollments/${studentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("ENROLLMENT_NOT_FOUND");
    expect(response).toSatisfyApiSpec();
  });
});