import request from "supertest";
import { describe, it, expect, afterEach } from "vitest";
import app from "../../../src/app.js";
import { prisma } from "../../../src/lib/prisma.js";
import { createUser } from "../factories/userFactory.js";
import { loginAsAdmin } from "../helpers/auth.js";
import { cleanupTestData } from "../helpers/cleanup.js";

async function login(email: string, password = "password") {
  return request(app).post("/auth/login").send({ email, password });
}

function changePassword(token: string, body: object) {
  return request(app)
    .post("/users/me/password")
    .set("Authorization", `Bearer ${token}`)
    .send(body);
}

describe("enforced first-login password change", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("flags a user an admin creates, and login reports it", async () => {
    const adminToken = await loginAsAdmin();
    const created = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: "New", secondName: "Student", email: "new.student@test.com", password: "temporary1" });
    expect(created.status).toBe(201);

    const response = await login("new.student@test.com", "temporary1");

    expect(response.status).toBe(200);
    expect(response.body.data.user.mustChangePassword).toBe(true);
    expect(response).toSatisfyApiSpec();
  });

  it("reports mustChangePassword false for a user who needn't change it", async () => {
    const user = await createUser();

    const response = await login(user.email);

    expect(response.body.data.user.mustChangePassword).toBe(false);
  });

  it("blocks every other operation until the password is changed", async () => {
    const user = await createUser({ mustChangePassword: true });
    const token = (await login(user.email)).body.data.token;

    for (const path of ["/users/me", "/users/me/courses", "/users/me/sessions"]) {
      const response = await request(app).get(path).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
      expect(response).toSatisfyApiSpec();
    }
  });

  it("blocks an admin too, before the role is checked", async () => {
    const admin = await createUser({ role: "admin", mustChangePassword: true });
    const token = (await login(admin.email)).body.data.token;

    const response = await request(app).get("/users").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
    expect(response).toSatisfyApiSpec();
  });

  it("changes the password, clears the flag and answers a token that works", async () => {
    const user = await createUser({ mustChangePassword: true });
    const token = (await login(user.email)).body.data.token;

    const response = await changePassword(token, { currentPassword: "password", newPassword: "my-new-password" });

    expect(response.status).toBe(200);
    expect(response.body.data.user.mustChangePassword).toBe(false);
    expect(response).toSatisfyApiSpec();

    const me = await request(app).get("/users/me").set("Authorization", `Bearer ${response.body.data.token}`);
    expect(me.status).toBe(200);

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.mustChangePassword).toBe(false);
    expect((await login(user.email, "password")).status).toBe(401);
    expect((await login(user.email, "my-new-password")).body.data.user.mustChangePassword).toBe(false);
  });

  it("lets a user who isn't flagged change their password too", async () => {
    const user = await createUser();
    const token = (await login(user.email)).body.data.token;

    const response = await changePassword(token, { currentPassword: "password", newPassword: "my-new-password" });

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
  });

  it("rejects a wrong current password", async () => {
    const user = await createUser({ mustChangePassword: true });
    const token = (await login(user.email)).body.data.token;

    const response = await changePassword(token, { currentPassword: "not-it", newPassword: "my-new-password" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_CURRENT_PASSWORD");
    expect(response).toSatisfyApiSpec();
    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.mustChangePassword).toBe(true);
  });

  it("rejects keeping the same password", async () => {
    const user = await createUser({ mustChangePassword: true });
    const token = (await login(user.email)).body.data.token;

    const response = await changePassword(token, { currentPassword: "password", newPassword: "password" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("PASSWORD_UNCHANGED");
    expect(response).toSatisfyApiSpec();
  });

  it("rejects a new password shorter than 8 characters", async () => {
    const user = await createUser({ mustChangePassword: true });
    const token = (await login(user.email)).body.data.token;

    const response = await changePassword(token, { currentPassword: "password", newPassword: "short" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response).toSatisfyApiSpec();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .post("/users/me/password")
      .send({ currentPassword: "password", newPassword: "my-new-password" });

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });
});
