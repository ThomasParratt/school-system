import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../../src/lib/prisma.js';
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createUser } from "../factories/userFactory.js";
import { User } from "@prisma/client";

describe("GET /users/:id", () => {
    let users: User[];

    beforeAll(async () => {
        users = await Promise.all([
        createUser(),
        createUser(),
        ]);
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany();
    });

    it('should return requested user', async () => {
        const token = await loginAsInstructor();
        const response = await request(app)
        .get(`/users/${users[0].id}`)
        .set("Authorization", `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthenticated request', async () => {
        const response = await request(app)
        .get(`/users/${users[0].id}`)
        
        expect(response.status).toBe(401);
        expect(response).toSatisfyApiSpec();
    });

});