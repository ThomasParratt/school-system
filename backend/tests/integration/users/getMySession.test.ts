import request from "supertest";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import app from "../../../src/app.js";
import { createUser } from "../factories/userFactory.js";
import { createCourse } from "../factories/courseFactory.js";
import { createSession } from "../factories/sessionFactory.js";
import { createEnrollment } from "../factories/enrollmentFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

async function loginAs(user: { email: string }) {
  const response = await request(app)
    .post("/auth/login")
    .send({ email: user.email, password: "password" });

  return response.body.data.token;
}

describe("GET /users/me/sessions/:id", () => {
  let student: Awaited<ReturnType<typeof createUser>>;
  let enrolledSessionId: number;
  let unenrolledSessionId: number;

  beforeEach(async () => {
    student = await createUser();

    const enrolledCourse = await createCourse();
    const unenrolledCourse = await createCourse();
    await createEnrollment({ userId: student.id, courseId: enrolledCourse.id });

    enrolledSessionId = (await createSession({ courseId: enrolledCourse.id })).id;
    unenrolledSessionId = (await createSession({ courseId: unenrolledCourse.id })).id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("returns a session from a course the student is enrolled in", async () => {
    const token = await loginAs(student);

    const response = await request(app)
      .get(`/users/me/sessions/${enrolledSessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(enrolledSessionId);
  });

  it("rejects a session from a course the student is not enrolled in", async () => {
    const token = await loginAs(student);

    const response = await request(app)
      .get(`/users/me/sessions/${unenrolledSessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("SESSION_NOT_FOUND");
  });
});