import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createUser } from "../factories/userFactory.js";
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { cleanupTestData } from "../helpers/cleanup.js";

describe("DELETE /users/:id", () => {
  let userId: number;

  beforeEach(async () => {
    const user = await createUser();
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should delete user", async () => {
    const token = await loginAsInstructor();

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe("User deleted successfully");
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).delete(`/users/${userId}`);

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });
});