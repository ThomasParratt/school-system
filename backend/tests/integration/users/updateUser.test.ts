import request from "supertest";
import app from "../../../src/app.js";
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '../../../src/lib/prisma.js';
import { loginAsAdmin, loginAsStudent } from "../helpers/auth.js";
import { createUser } from "../factories/userFactory.js";

describe("PATCH /users/:id", () => {
    let userId: number;

    beforeEach(async () => {
        const user = await createUser();
        userId = user.id;
    });

    afterEach(async () => {
    vi.restoreAllMocks();
        // Clean up test data
        await prisma.user.deleteMany();
    });

    it('should update user name', async () => {
        const token = await loginAsAdmin();
        const response = await request(app)
            .patch(`/users/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({firstName: "John", secondName: "Smith"});
        
        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({firstName: "John", secondName: "Smith"});
        expect(response).toSatisfyApiSpec();
    });

    it('should clear comments when sent null', async () => {
        await prisma.user.update({ where: { id: userId }, data: { comments: "Needs extra help" } });
        const token = await loginAsAdmin();
        const response = await request(app)
            .patch(`/users/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ comments: null });

        expect(response.status).toBe(200);
        expect(response.body.data.comments).toBeNull();
        expect(response).toSatisfyApiSpec();
    });

    it('should reject empty comments', async () => {
        const token = await loginAsAdmin();
        const response = await request(app)
            .patch(`/users/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ comments: "" });

        expect(response.status).toBe(400);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthenticated request', async () => {
        const response = await request(app)
            .patch(`/users/${userId}`)
        
        expect(response.status).toBe(401);
        expect(response).toSatisfyApiSpec();
    });

    it('should reject unauthorized role', async () => {
        const token = await loginAsStudent();
        const response = await request(app)
            .patch(`/users/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({firstName: "John", secondName: "Smith"});
        
        expect(response.status).toBe(403);
        expect(response).toSatisfyApiSpec();
    });

  it("should not leak database errors", async () => {
    const token = await loginAsAdmin();
    vi.spyOn(prisma.user, "update").mockRejectedValueOnce(new Error("Invalid `prisma` invocation in /srv/app/src/routes/secret.ts"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "John" });

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({ message: expect.any(String), code: "UPDATE_USER_ERROR" });
    expect(JSON.stringify(response.body)).not.toContain("prisma");
    expect(response).toSatisfyApiSpec();
  });
});
