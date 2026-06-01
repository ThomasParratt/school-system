import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createCourse } from "../factories/courseFactory.js";
import { createUser } from "../factories/userFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("POST /courses/:id/enroll", () => {
  let courseId: number;
  let studentId: number;

  beforeEach(async () => {
    const course = await createCourse();
    const student = await createUser();

    courseId = course.id;
    studentId = student.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should enroll user in course", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .post(`/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: studentId });

    expect(response.status).toBe(201);
    expect(response.body.data.userId).toBe(studentId);
    expect(response.body.data.courseId).toBe(courseId);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app)
      .post(`/courses/${courseId}/enroll`)
      .send({ userId: studentId });

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .post(`/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: studentId });

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject duplicate enrollment", async () => {
    const token = await loginAsInstructor();

    await request(app)
      .post(`/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: studentId });

    const response = await request(app)
      .post(`/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: studentId });

    expect(response.status).toBe(409);
    expect(response).toSatisfyApiSpec();
  });
});