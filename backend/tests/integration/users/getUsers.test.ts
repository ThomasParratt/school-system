import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, afterEach } from "vitest";
import { loginAsAdmin, loginAsStudent } from "../helpers/auth.js";
import { createUser } from "../factories/userFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

type Listed = { id: number; firstName: string; secondName: string; role: string };

describe("GET /users", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("should return all users", async () => {
    const token = await loginAsAdmin();
    await createUser();
    await createUser();

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    // The admin who logged in, plus the two students.
    expect(response.body.data).toHaveLength(3);
    expect(response.body.meta).toEqual({ total: 3, page: 1, limit: 25 });
  });

  it("should answer one page at a time, with the total across pages", async () => {
    const token = await loginAsAdmin();
    for (const secondName of ["Adams", "Brown", "Clark", "Davis", "Evans"]) {
      await createUser({ secondName });
    }

    const page2 = await request(app)
      .get("/users?role=student&page=2&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(page2.status).toBe(200);
    expect(page2).toSatisfyApiSpec();
    expect(page2.body.data.map((u: Listed) => u.secondName)).toEqual(["Clark", "Davis"]);
    expect(page2.body.meta).toEqual({ total: 5, page: 2, limit: 2 });

    const past = await request(app)
      .get("/users?role=student&page=4&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(past.status).toBe(200);
    expect(past.body.data).toEqual([]);
    expect(past.body.meta.total).toBe(5);
  });

  it("should filter by role", async () => {
    const token = await loginAsAdmin();
    const instructor = await createUser({ role: "instructor" });
    await createUser();

    const response = await request(app)
      .get("/users?role=instructor")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data.map((u: Listed) => u.id)).toEqual([instructor.id]);
    expect(response.body.meta.total).toBe(1);
  });

  it("should search first name, surname and email, ignoring case", async () => {
    const token = await loginAsAdmin();
    const byFirst = await createUser({ firstName: "Marjatta", secondName: "Aho" });
    const bySecond = await createUser({ firstName: "Ville", secondName: "Marjanen" });
    const byEmail = await createUser({ firstName: "Pekka", secondName: "Ojala", email: "pekka.marja@example.com" });
    await createUser({ firstName: "Liisa", secondName: "Virtanen" });

    const response = await request(app)
      .get("/users?q=MARJA")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data.map((u: Listed) => u.id)).toEqual([byFirst.id, bySecond.id, byEmail.id]);
    expect(response.body.meta.total).toBe(3);
  });

  it("should combine search with role", async () => {
    const token = await loginAsAdmin();
    const student = await createUser({ secondName: "Korhonen" });
    await createUser({ secondName: "Korhonen", role: "instructor" });

    const response = await request(app)
      .get("/users?q=korhonen&role=student")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.map((u: Listed) => u.id)).toEqual([student.id]);
  });

  it.each([
    ["page=0"],
    ["page=abc"],
    ["limit=0"],
    ["limit=101"],
    ["role=teacher"],
    ["q="],
    [`q=${"x".repeat(101)}`],
  ])("should reject the invalid query %s", async (query) => {
    const token = await loginAsAdmin();

    const response = await request(app)
      .get(`/users?${query}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response).toSatisfyApiSpec();
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app)
      .get("/users");

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });
});
