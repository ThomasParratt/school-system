import { prisma } from "../../../src/lib/prisma.js";
import { createUser } from "./userFactory.js";
import { createCourse } from "./courseFactory.js";

type EnrollmentOverrides = {
    userId?: number;
    courseId?: number;
};

export async function createEnrollment(overrides: EnrollmentOverrides = {}) {
    const userId = overrides.userId ?? (await createUser()).id;
    const courseId = overrides.courseId ?? (await createCourse()).id;

    return prisma.enrollment.create({
        data: {
            userId,
            courseId,
        },
    });
}
