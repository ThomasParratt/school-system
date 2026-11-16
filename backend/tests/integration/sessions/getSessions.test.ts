import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, afterEach } from "vitest";
import { loginAsAdmin, loginAsStudent } from "../helpers/auth.js";
import { createCourse } from "../factories/courseFactory.js";
import { createSession } from "../factories/sessionFactory.js";
import { cleanupTestData } from "../helpers/cleanup.js";

type Listed = { id: number; startsAt: string };

const at = (iso: string) => ({ startsAt: new Date(iso), endsAt: null });

// Encoded as a browser's URLSearchParams would: the validator rejects a raw ":" in a value.
const list = (query: string) => `/sessions?${new URLSearchParams(query)}`;

describe("GET /sessions", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("should return all sessions", async () => {
    const token = await loginAsAdmin();
    const course = await createCourse();
    await createSession({ courseId: course.id, ...at("2026-03-01T09:00:00Z") });
    await createSession({ courseId: course.id, ...at("2026-03-02T09:00:00Z") });

    const response = await request(app)
      .get("/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta).toEqual({ total: 2, page: 1, limit: 25 });
  });

  it("should answer one page at a time, with the total across pages", async () => {
    const token = await loginAsAdmin();
    const course = await createCourse();
    for (const day of [1, 2, 3, 4, 5]) {
      await createSession({ courseId: course.id, ...at(`2026-03-0${day}T09:00:00Z`) });
    }

    const page2 = await request(app)
      .get(list("page=2&limit=2"))
      .set("Authorization", `Bearer ${token}`);

    expect(page2.status).toBe(200);
    expect(page2).toSatisfyApiSpec();
    expect(page2.body.data.map((s: Listed) => s.startsAt)).toEqual([
      "2026-03-03T09:00:00.000Z",
      "2026-03-04T09:00:00.000Z",
    ]);
    expect(page2.body.meta).toEqual({ total: 5, page: 2, limit: 2 });
  });

  it("should pick sessions starting from `from` up to, but not at, `to`", async () => {
    const token = await loginAsAdmin();
    const course = await createCourse();
    await createSession({ courseId: course.id, ...at("2026-03-01T23:59:59Z") });
    const first = await createSession({ courseId: course.id, ...at("2026-03-02T00:00:00Z") });
    const last = await createSession({ courseId: course.id, ...at("2026-03-08T23:59:59Z") });
    await createSession({ courseId: course.id, ...at("2026-03-09T00:00:00Z") });

    const response = await request(app)
      .get(list("from=2026-03-02T00:00:00Z&to=2026-03-09T00:00:00Z"))
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data.map((s: Listed) => s.id)).toEqual([first.id, last.id]);
    expect(response.body.meta.total).toBe(2);
  });

  it("should take `from` or `to` alone", async () => {
    const token = await loginAsAdmin();
    const course = await createCourse();
    const early = await createSession({ courseId: course.id, ...at("2026-03-01T09:00:00Z") });
    const late = await createSession({ courseId: course.id, ...at("2026-04-01T09:00:00Z") });

    const fromOnly = await request(app)
      .get(list("from=2026-03-15T00:00:00Z"))
      .set("Authorization", `Bearer ${token}`);
    expect(fromOnly.body.data.map((s: Listed) => s.id)).toEqual([late.id]);

    const toOnly = await request(app)
      .get(list("to=2026-03-15T00:00:00Z"))
      .set("Authorization", `Bearer ${token}`);
    expect(toOnly.body.data.map((s: Listed) => s.id)).toEqual([early.id]);
  });

  it("should filter by course", async () => {
    const token = await loginAsAdmin();
    const course = await createCourse();
    const other = await createCourse();
    const mine = await createSession({ courseId: course.id, ...at("2026-03-01T09:00:00Z") });
    await createSession({ courseId: other.id, ...at("2026-03-01T09:00:00Z") });

    const response = await request(app)
      .get(list(`courseId=${course.id}`))
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.map((s: Listed) => s.id)).toEqual([mine.id]);
  });

  it("should search location, content and homework, ignoring case", async () => {
    const token = await loginAsAdmin();
    const course = await createCourse();
    const byLocation = await createSession({ courseId: course.id, ...at("2026-03-01T09:00:00Z"), location: "Library hall" });
    const byContent = await createSession({ courseId: course.id, ...at("2026-03-02T09:00:00Z"), content: "Visit the library" });
    const byHomework = await createSession({ courseId: course.id, ...at("2026-03-03T09:00:00Z"), homework: "Borrow a LIBRARY book" });
    await createSession({ courseId: course.id, ...at("2026-03-04T09:00:00Z") });

    const response = await request(app)
      .get(list("q=library"))
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response).toSatisfyApiSpec();
    expect(response.body.data.map((s: Listed) => s.id)).toEqual([byLocation.id, byContent.id, byHomework.id]);
  });

  it.each([
    ["to before from", "from=2026-03-09T00:00:00Z&to=2026-03-02T00:00:00Z"],
    ["to equal to from", "from=2026-03-02T00:00:00Z&to=2026-03-02T00:00:00Z"],
    ["a date without a time", "from=2026-03-02"],
    ["a date that isn't one", "to=tomorrow"],
    ["courseId=0", "courseId=0"],
    ["limit=101", "limit=101"],
    ["an empty q", "q="],
  ])("should reject %s", async (_label, query) => {
    const token = await loginAsAdmin();

    const response = await request(app)
      .get(list(query))
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response).toSatisfyApiSpec();
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app).get("/sessions");

    expect(response.status).toBe(401);
    expect(response).toSatisfyApiSpec();
  });

  it("should reject unauthorized role", async () => {
    const token = await loginAsStudent();

    const response = await request(app)
      .get("/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response).toSatisfyApiSpec();
  });
});
