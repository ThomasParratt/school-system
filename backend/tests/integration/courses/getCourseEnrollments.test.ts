import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loginAsAdmin } from "../helpers/auth.js";
import { cleanupTestData } from "../helpers/cleanup.js";
import { createEnrollment } from "../factories/enrollmentFactory.js";
import { createUser } from "../factories/userFactory.js";
import { createCourse } from "../factories/courseFactory.js";

describe("GET /courses/:id/enrollments", () => {
    let courseId: number;
    let userId: number;

    beforeEach(async () => {
        const course = await createCourse();
        courseId = course.id;
        const user = await createUser();
        userId = user.id;
        await createEnrollment({userId, courseId});
    });

    afterEach(async () => {
        await cleanupTestData();
    });

    it("should return requested enrollment", async () => {
        const token = await loginAsAdmin();

        const response = await request(app)
        .get(`/courses/${courseId}/enrollments`)
        .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].courseId).toBe(courseId);
        expect(response).toSatisfyApiSpec();
    });

    it("should carry the enrolled user without the password hash", async () => {
        const token = await loginAsAdmin();

        const response = await request(app)
        .get(`/courses/${courseId}/enrollments`)
        .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(200);
        expect(response.body.data[0].user.id).toBe(userId);
        expect(response.body.data[0].user).not.toHaveProperty("password");
        expect(JSON.stringify(response.body)).not.toMatch(/password/i);
    });

    it("should reject unauthenticated request", async () => {
        const response = await request(app).get(`/courses/${courseId}/enrollments`);

        expect(response.status).toBe(401);
    });
});