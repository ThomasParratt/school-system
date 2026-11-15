import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import app from "../../../src/app.js";
import { createCourse } from "../factories/courseFactory.js";
import { createSession } from "../factories/sessionFactory.js";
import { createUser } from "../factories/userFactory.js";
import { loginAsAdmin } from "../helpers/auth.js";
import { cleanupTestData } from "../helpers/cleanup.js";

// Without an explicit order Postgres answers in storage order, and an updated row
// moves to the end, so these edit a row before checking the list.
describe("list order", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("lists users by surname then first name, also after one is edited", async () => {
    const token = await loginAsAdmin();
    const carter = await createUser({ firstName: "Liam", secondName: "Carter" });
    const anderson = await createUser({ firstName: "Oliver", secondName: "Anderson" });
    const bergEmma = await createUser({ firstName: "Emma", secondName: "Berg" });
    const bergAlex = await createUser({ firstName: "Alex", secondName: "Berg" });

    const edited = await request(app)
      .patch(`/users/${anderson.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ comments: "edited" });
    expect(edited.status).toBe(200);

    const response = await request(app).get("/users").set("Authorization", `Bearer ${token}`);
    const ids = [anderson.id, bergAlex.id, bergEmma.id, carter.id];
    const listed = response.body.data.map((u: { id: number }) => u.id).filter((id: number) => ids.includes(id));
    expect(listed).toEqual(ids);
  });

  it("lists courses by title, also after one is edited", async () => {
    const token = await loginAsAdmin();
    const finnish = await createCourse({ title: "Finnish A1" });
    const english = await createCourse({ title: "English B2" });

    const edited = await request(app)
      .patch(`/courses/${english.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ material: "edited" });
    expect(edited.status).toBe(200);

    const response = await request(app).get("/courses").set("Authorization", `Bearer ${token}`);
    const ids = [english.id, finnish.id];
    const listed = response.body.data.map((c: { id: number }) => c.id).filter((id: number) => ids.includes(id));
    expect(listed).toEqual(ids);
  });

  it("lists sessions by start time, also after one is edited", async () => {
    const token = await loginAsAdmin();
    const course = await createCourse();
    const later = await createSession({ courseId: course.id, startsAt: new Date("2026-03-02T09:00:00Z"), endsAt: null });
    const earlier = await createSession({ courseId: course.id, startsAt: new Date("2026-03-01T09:00:00Z"), endsAt: null });

    const edited = await request(app)
      .patch(`/sessions/${earlier.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ location: "Room 2" });
    expect(edited.status).toBe(200);

    for (const path of ["/sessions", `/courses/${course.id}/sessions`]) {
      const response = await request(app).get(path).set("Authorization", `Bearer ${token}`);
      const listed = response.body.data.map((s: { id: number }) => s.id);
      expect(listed).toEqual([earlier.id, later.id]);
    }
  });
});
