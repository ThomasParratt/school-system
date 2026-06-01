import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../../src/lib/prisma.js';
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createUser } from "../factories/userFactory.js";

describe("GET /users/:id", () => {
    let userId: number;

    beforeEach(async () => {
        const user = await createUser();
        userId = user.id;
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.user.deleteMany();
    });

    it('should return requested user', async () => {
        const token = await loginAsInstructor();
        const response = await request(app)
            .get(`/users/${userId}`)
            .set("Authorization", `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthenticated request', async () => {
        const response = await request(app)
            .get(`/users/${userId}`)
        
        expect(response.status).toBe(401);
        expect(response).toSatisfyApiSpec();
    });

});