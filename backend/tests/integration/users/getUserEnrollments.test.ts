import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsInstructor } from "../helpers/auth.js";
import { cleanupTestData } from "../helpers/cleanup.js";
import { createEnrollment } from "../factories/enrollmentFactory.js";
import { createUser } from "../factories/userFactory.js";
import { createCourse } from "../factories/courseFactory.js";

describe("GET /users/:id/enrollments", () => {
    let userId: number;
    let courseId: number;

    beforeEach(async () => {
        const user = await createUser();
        userId = user.id;
        const course = await createCourse();
        courseId = course.id;
        await createEnrollment({userId, courseId});
    });

    afterEach(async () => {
        await cleanupTestData();
    });

    it("should return requested enrollment", async () => {
        const token = await loginAsInstructor();

        const response = await request(app)
        .get(`/users/${userId}/enrollments`)
        .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].userId).toBe(userId);
        expect(response.body.data[0].course.id).toBe(courseId);
        expect(response).toSatisfyApiSpec();
    });

    it("should reject unauthenticated request", async () => {
        const response = await request(app).get(`/users/${userId}/enrollments`);

        expect(response.status).toBe(401);
    });
});