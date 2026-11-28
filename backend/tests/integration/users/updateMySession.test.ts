import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "../../../src/lib/prisma.js";
import { createUser } from "../factories/userFactory.js";
import { createCourse } from "../factories/courseFactory.js";
import { createSession } from "../factories/sessionFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

async function loginAs(user: { email: string }) {
  const response = await request(app)
    .post("/auth/login")
    .send({ email: user.email, password: "password" });

  return response.body.data.token;
}

describe("PATCH /users/me/sessions/:id", () => {
  let instructor: Awaited<ReturnType<typeof createUser>>;
  let otherInstructor: Awaited<ReturnType<typeof createUser>>;
  let ownSessionId: number;
  let otherSessionId: number;

  beforeEach(async () => {
    instructor = await createUser({ role: "instructor" });
    otherInstructor = await createUser({ role: "instructor" });

    const ownCourse = await createCourse({ instructorId: instructor.id });
    const otherCourse = await createCourse({ instructorId: otherInstructor.id });
    ownSessionId = (await createSession({ courseId: ownCourse.id })).id;
    otherSessionId = (await createSession({ courseId: otherCourse.id })).id;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await cleanupTestData();
  });

  it("updates a session belonging to the instructor", async () => {
    const token = await loginAs(instructor);

    const response = await request(app)
      .patch(`/users/me/sessions/${ownSessionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ location: "Room 202" });

    expect(response.status).toBe(200);
    expect(response.body.data.location).toBe("Room 202");
  });

  it("rejects a session belonging to another instructor", async () => {
    const token = await loginAs(instructor);

    const response = await request(app)
      .patch(`/users/me/sessions/${otherSessionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ location: "Room 202" });

    const session = await prisma.classSession.findUnique({
      where: { id: otherSessionId },
      select: { location: true },
    });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("SESSION_NOT_FOUND");
    expect(session?.location).not.toBe("Room 202");
  });

  it("does not leak database errors", async () => {
    const token = await loginAs(instructor);
    vi.spyOn(prisma.classSession, "update").mockRejectedValueOnce(new Error("Invalid `prisma` invocation in /srv/app/src/routes/secret.ts"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app)
      .patch(`/users/me/sessions/${ownSessionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ location: "Room 202" });

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({ message: expect.any(String), code: "UPDATE_SESSION_ERROR" });
    expect(JSON.stringify(response.body)).not.toContain("prisma");
    expect(response).toSatisfyApiSpec();
  });
});
