import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../../src/lib/prisma.js';
import { loginAsInstructor, loginAsStudent } from "../helpers/auth.js";
import { createUser } from "../factories/userFactory.js";

describe("POST /users", () => {

    afterAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany();
    });

    it('should create user', async () => {
        const token = await loginAsInstructor();
        const response = await request(app)
        .post('/users')
        .set("Authorization", `Bearer ${token}`)
        .send({ 
                firstName: 'John',
                secondName: 'Smith',
                email: 'john.smith@test.com',
                password: 'johnsmith'
            });
        
        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject({
            firstName: 'John',
            secondName: 'Smith',
            email: 'john.smith@test.com',
        });
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthenticated request', async () => {
        const response = await request(app)
        .post('/users')
        
        expect(response.status).toBe(401);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthorized role', async () => {
        const token = await loginAsStudent();
        const response = await request(app)
            .post('/users')
            .set("Authorization", `Bearer ${token}`)
            .send({ 
                    firstName: 'John',
                    secondName: 'Smith',
                    email: 'john.smith@test.com',
                    password: 'johnsmith' 
                });
        
        expect(response.status).toBe(403);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject missing email', async () => {
        const token = await loginAsInstructor();
        const response = await request(app)
            .post('/users')
            .set("Authorization", `Bearer ${token}`)
            .send({ 
                    firstName: 'John',
                    secondName: 'Smith',
                    password: 'johnsmith' 
                });
        
        expect(response.status).toBe(400);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject missing password', async () => {
        const token = await loginAsInstructor();
        const response = await request(app)
            .post('/users')
            .set("Authorization", `Bearer ${token}`)
            .send({ 
                    firstName: 'John',
                    secondName: 'Smith',
                    email: 'john.smith@test.com' 
                });
        
        expect(response.status).toBe(400);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject duplicate email', async () => {
        const token = await loginAsInstructor();
        await createUser({email: 'test@test.com'});
        const response = await request(app)
        .post('/users')
        .set("Authorization", `Bearer ${token}`)
        .send({ 
                firstName: 'John',
                secondName: 'Smith',
                email: 'test@test.com',
                password: 'johnsmith' 
            });
        
        expect(response.status).toBe(409);
        expect(response).toSatisfyApiSpec();
    });
});