import { prisma } from '../../../src/lib/prisma.js';
import bcrypt from "bcrypt";

export async function createUser(overrides = {}) {
    const hashedPassword = await bcrypt.hash("password", 10);
    return prisma.user.create({
        data: {
            firstName: "Test",
            secondName: "User",
            email: `user-${crypto.randomUUID()}@test.com`,
            password: hashedPassword,
            role: "student",
            ...overrides,
        },
    });
}