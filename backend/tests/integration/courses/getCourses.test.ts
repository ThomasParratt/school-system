import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, afterEach } from "vitest";
import { loginAsAdmin, loginAsStudent } from "../helpers/auth.js";
import { createCourse } from "../factories/courseFactory.js";
import { createUser } from "../factories/userFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

type Listed = { id: number; title: string };

describe("GET /courses", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("should return all courses", async () => {
    const token = await loginAsAdmin();
    await Promise.all([createCourse(), createCourse()]);

    const response = await request(app)
      .get("/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta).toEqual({ total: 2, page: 1, limit: 25 });
  });

  it("should answer one page at a time, with the total across pages", async () => {
    const token = await loginAsAdmin();
    for (const title of ["Alpha", "Bravo", "Charlie", "Delta", "Echo"]) {
      await createCourse({ title });
    }

    const page2 = await request(app)
      .get("/courses?page=2&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(page2.status).toBe(200);
    expect(page2).toSatisfyApiSpec();
    expect(page2.body.data.map((c: Listed) => c.title)).toEqual(["Charlie", "Delta"]);
    expect(page2.body.meta).toEqual({ total: 5, page: 2, limit: 2 });

    const past = await request(app)
      .get("/courses?page=4&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(past.status).toBe(200);
    expect(past.body.data).toEqual([]);
    expect(past.body.meta.total).toBe(5);
  });

  it("should search the title and the instructor's name, ignoring case", async () => {
    const token = await loginAsAdmin();
    const teacher = await createUser({ role: "instructor", firstName: "Aino", secondName: "Lehtinen" });
    const byTitle = await createCourse({ title: "Spoken Lehti" });
    const byFirst = await createCourse({ title: "Grammar", instructorId: (await createUser({ role: "instructor", firstName: "Lehtonen", secondName: "Ruusu" })).id });
    const bySecond = await createCourse({ title: "Writing", instructorId: teacher.id });
    await createCourse({ title: "Unrelated" });

    const response = await request(app)
      .get("/courses?q=LEHT")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data.map((c: Listed) => c.id)).toEqual([byFirst.id, byTitle.id, bySecond.id]);
    expect(response.body.meta.total).toBe(3);
  });

  it("should filter by language, level and instructor", async () => {
    const token = await loginAsAdmin();
    const teacher = await createUser({ role: "instructor" });
    const match = await createCourse({ language: "Finnish", level: "B1", instructorId: teacher.id });
    await createCourse({ language: "Finnish", level: "A1", instructorId: teacher.id });
    await createCourse({ language: "Swedish", level: "B1", instructorId: teacher.id });
    await createCourse({ language: "Finnish", level: "B1" });

    const response = await request(app)
      .get(`/courses?language=Finnish&level=B1&instructorId=${teacher.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data.map((c: Listed) => c.id)).toEqual([match.id]);
    expect(response.body.meta.total).toBe(1);
  });

  it.each([
    ["page=0"],
    ["limit=101"],
    ["q="],
    ["language=Klingon"],
    ["level=D1"],
    ["instructorId=0"],
    ["instructorId=abc"],
  ])("should reject the invalid query %s", async (query) => {
    const token = await loginAsAdmin();

    const response = await request(app)
      .get(`/courses?${query}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response).toSatisfyApiSpec();
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).get("/courses");

    expect(response.status).toBe(401);
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .get("/courses")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
