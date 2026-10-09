import request from "supertest";
import type { Response } from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import app from "../../../src/app.js";
import { createCourse } from "../factories/courseFactory.js";
import { createSession } from "../factories/sessionFactory.js";
import { createUser } from "../factories/userFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";
import { loginAsAdmin, loginAsInstructor } from "../helpers/auth.js";

const validUser = {
  firstName: "Validation",
  secondName: "User",
  email: "validation-user@example.com",
  password: "password123",
};

function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  expect(response.body).toEqual({
    error: {
      message: expect.any(String),
      code,
    },
  });
}

describe("behavioral validation and error contracts", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe("users", () => {
    it("rejects invalid login email and short passwords", async () => {
      const token = await loginAsAdmin();
      const invalidEmail = await request(app)
        .post("/auth/login")
        .send({ email: "not-an-email", password: "password123" });
      expectError(invalidEmail, 400, "VALIDATION_ERROR");

      const shortPassword = await request(app)
        .post("/auth/login")
        .send({ email: "user@example.com", password: "short" });
      expectError(shortPassword, 400, "VALIDATION_ERROR");

      const created = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${token}`)
        .send(validUser);
      expect(created.status).toBe(201);
      expect(JSON.stringify(created.body)).not.toContain("password");

      const duplicateEmail = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${token}`)
        .send(validUser);
      expectError(duplicateEmail, 409, "EMAIL_ALREADY_EXISTS");
    });

    it("rejects invalid user fields and roles", async () => {
      const token = await loginAsAdmin();

      const invalidEmail = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...validUser, email: "invalid-email" });
      expectError(invalidEmail, 400, "VALIDATION_ERROR");

      const invalidRole = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...validUser, email: "invalid-role@example.com", role: "teacher" });
      expectError(invalidRole, 400, "VALIDATION_ERROR");

      const wrongType = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...validUser, email: "wrong-type@example.com", firstName: 42 });
      expectError(wrongType, 400, "VALIDATION_ERROR");

      const shortPassword = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...validUser, email: "short-password@example.com", password: "short" });
      expectError(shortPassword, 400, "VALIDATION_ERROR");
    });

    it("returns 404 for nonexistent users and updates/deletes", async () => {
      const token = await loginAsAdmin();
      const path = "/users/999999999";

      const get = await request(app).get(path).set("Authorization", `Bearer ${token}`);
      expectError(get, 404, "USER_NOT_FOUND");

      const patch = await request(app)
        .patch(path)
        .set("Authorization", `Bearer ${token}`)
        .send({ firstName: "Missing" });
      expectError(patch, 404, "USER_NOT_FOUND");

      const remove = await request(app).delete(path).set("Authorization", `Bearer ${token}`);
      expectError(remove, 404, "USER_NOT_FOUND");
    });

    it("rejects invalid user IDs and never returns passwords", async () => {
      const token = await loginAsAdmin();
      const invalidId = await request(app)
        .get("/users/0")
        .set("Authorization", `Bearer ${token}`);
      expectError(invalidId, 400, "INVALID_ID");

      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toContain("password");
    });
  });

  describe("courses and sessions", () => {
    it("rejects invalid course enums, instructor IDs, and field types", async () => {
      const token = await loginAsAdmin();
      const base = {
        title: "Validation Course",
        language: "English",
        level: "A1",
        material: "material",
        instructorId: 999999999,
      };

      const missingInstructor = await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send(base);
      expectError(missingInstructor, 404, "INSTRUCTOR_NOT_FOUND");

      const invalidEnums = await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...base, language: "Spanish", level: "C3" });
      expectError(invalidEnums, 400, "VALIDATION_ERROR");

      const invalidId = await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...base, instructorId: "1" });
      expectError(invalidId, 400, "VALIDATION_ERROR");

      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructorId: instructor.id });
      const invalidPatch = await request(app)
        .patch(`/courses/${course.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ language: "Spanish", instructorId: "not-an-id" });
      expectError(invalidPatch, 400, "VALIDATION_ERROR");
    });

    it("returns 404 for nonexistent courses and updates/deletes", async () => {
      const token = await loginAsAdmin();
      const path = "/courses/999999999";

      const get = await request(app).get(path).set("Authorization", `Bearer ${token}`);
      expectError(get, 404, "COURSE_NOT_FOUND");

      const patch = await request(app)
        .patch(path)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Missing" });
      expectError(patch, 404, "NOT_FOUND");

      const remove = await request(app).delete(path).set("Authorization", `Bearer ${token}`);
      expectError(remove, 404, "COURSE_NOT_FOUND");
    });

    it("rejects invalid and reversed session dates and duplicate start times", async () => {
      const token = await loginAsAdmin();
      const course = await createCourse();
      const startsAt = "2026-06-01T10:00:00.000Z";

      const invalidDate = await request(app)
        .post(`/courses/${course.id}/sessions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ location: "Room 1", startsAt: "not-a-date" });
      expectError(invalidDate, 400, "VALIDATION_ERROR");

      const reversed = await request(app)
        .post(`/courses/${course.id}/sessions`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          location: "Room 1",
          startsAt,
          endsAt: "2026-06-01T09:00:00.000Z",
        });
      expectError(reversed, 400, "VALIDATION_ERROR");

      const first = await request(app)
        .post(`/courses/${course.id}/sessions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ location: "Room 1", startsAt });
      expect(first.status).toBe(201);

      const duplicate = await request(app)
        .post(`/courses/${course.id}/sessions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ location: "Room 2", startsAt });
      expectError(duplicate, 409, "SESSION_EXISTS");
    });

    it("returns 404 when a session is missing or deleted", async () => {
      const token = await loginAsAdmin();
      const path = "/sessions/999999999";

      const get = await request(app).get(path).set("Authorization", `Bearer ${token}`);
      expectError(get, 404, "SESSION_NOT_FOUND");

      const patch = await request(app)
        .patch(path)
        .set("Authorization", `Bearer ${token}`)
        .send({ location: "Missing" });
      expectError(patch, 404, "SESSION_NOT_FOUND");

      const remove = await request(app).delete(path).set("Authorization", `Bearer ${token}`);
      expectError(remove, 404, "SESSION_NOT_FOUND");
    });
  });

  describe("enrollments", () => {
    it("rejects nonexistent users and non-student users", async () => {
      const token = await loginAsAdmin();
      const course = await createCourse();

      const nonexistent = await request(app)
        .post(`/courses/${course.id}/enroll`)
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 999999999 });
      expectError(nonexistent, 404, "USER_NOT_FOUND");

      const instructor = await createUser({ role: "instructor" });
      const nonStudent = await request(app)
        .post(`/courses/${course.id}/enroll`)
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: instructor.id });
      expectError(nonStudent, 400, "INVALID_ENROLLMENT_USER");
    });

    it("rejects invalid enrollment IDs and returns duplicate enrollment errors", async () => {
      const token = await loginAsAdmin();
      const course = await createCourse();
      const student = await createUser();

      const invalidId = await request(app)
        .post("/courses/0/enroll")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: student.id });
      expectError(invalidId, 400, "INVALID_ID");

      const first = await request(app)
        .post(`/courses/${course.id}/enroll`)
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: student.id });
      expect(first.status).toBe(201);

      const duplicate = await request(app)
        .post(`/courses/${course.id}/enroll`)
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: student.id });
      expectError(duplicate, 409, "ENROLLMENT_EXISTS");
    });
  });

  it("keeps instructor session access scoped to owned sessions", async () => {
    const instructorToken = await loginAsInstructor();
    const otherCourse = await createCourse();
    const otherSession = await createSession({ courseId: otherCourse.id });

    const response = await request(app)
      .get(`/users/me/sessions/${otherSession.id}`)
      .set("Authorization", `Bearer ${instructorToken}`);
    expectError(response, 404, "SESSION_NOT_FOUND");
  });
});
