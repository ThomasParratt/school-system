import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../../src/lib/prisma.js';
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createUser } from "../factories/userFactory.js";
import { User } from "@prisma/client";
import { randomUUID } from "crypto";

describe("PATCH /users/:id", () => {
    let users: User[];

    beforeEach(async () => {
        users = await Promise.all([
            createUser(),
            createUser(),
        ]);
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.user.deleteMany();
    });

    it('should update user name', async () => {
        const token = await loginAsInstructor();
        const response = await request(app)
        .patch(`/users/${users[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({firstName: "John", secondName: "Smith"});
        
        expect(response.status).toBe(200);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthenticated request', async () => {
        const response = await request(app)
        .patch(`/users/${users[0].id}`)
        
        expect(response.status).toBe(401);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthorized role', async () => {
        const token = await loginAsStudent();
        const response = await request(app)
        .patch(`/users/${users[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({firstName: "John", secondName: "Smith"});
        
        expect(response.status).toBe(403);
        expect(response).toSatisfyApiSpec();
    });

});