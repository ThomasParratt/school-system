import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanupTestData } from "../helpers/cleanup.js";
import { createUser } from "../factories/userFactory.js";
import { createCourse } from "../factories/courseFactory.js";
import { createEnrollment } from "../factories/enrollmentFactory.js";

describe("GET /users/me/students", () => {
  let instructor: any;
  let courseA: any;
  let courseB: any;
  let student1: any;
  let student2: any;

  beforeEach(async () => {
    instructor = await createUser({ role: "instructor" });
    courseA = await createCourse({ instructorId: instructor.id });
    courseB = await createCourse({ instructorId: instructor.id });

    student1 = await createUser();
    student2 = await createUser();

    // student1 enrolled in both courses, student2 in courseB
    await createEnrollment({ userId: student1.id, courseId: courseA.id });
    await createEnrollment({ userId: student1.id, courseId: courseB.id });
    await createEnrollment({ userId: student2.id, courseId: courseB.id });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("returns unique students for the instructor", async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: instructor.email, password: "password" });

    const token = login.body.data.token;

    const res = await request(app)
      .get(`/users/me/students`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // should contain both students, but student1 only once
    const ids = res.body.data.map((s: any) => s.id).sort();
    expect(ids).toEqual([student1.id, student2.id].sort());
    expect(res).toSatisfyApiSpec();
  });

  it("rejects non-instructors", async () => {
    const studentLogin = await request(app)
      .post("/auth/login")
      .send({ email: student1.email, password: "password" });

    const token = studentLogin.body.data.token;

    const res = await request(app)
      .get(`/users/me/students`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
