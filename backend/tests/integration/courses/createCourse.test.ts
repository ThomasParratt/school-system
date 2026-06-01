import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, afterEach } from "vitest";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("POST /courses", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("should create course", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Intro to Finnish",
        language: "Finnish",
        level: "A1",
        material: "https://example.com/materials/finnish-a1",
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      title: "Intro to Finnish",
      language: "Finnish",
      level: "A1",
      material: "https://example.com/materials/finnish-a1",
    });
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).post("/courses");

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Intro to Finnish",
        language: "Finnish",
        level: "A1",
        material: "https://example.com/materials/finnish-a1",
      });

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject missing material", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Intro to Finnish",
        language: "Finnish",
        level: "A1",
      });

    expect(response.status).toBe(400);
    expect(response).toSatisfyApiSpec();
  });
});