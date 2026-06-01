import { prisma } from "../../../src/lib/prisma.js";
import { createCourse } from "./courseFactory.js";

type SessionOverrides = {
	courseId?: number;
	location?: string;
	startsAt?: Date;
	endsAt?: Date | null;
	content?: string | null;
	homework?: string | null;
};

export async function createSession(overrides: SessionOverrides = {}) {
	const courseId = overrides.courseId ?? (await createCourse()).id;

	return prisma.classSession.create({
		data: {
			courseId,
			location: overrides.location ?? "Room 101",
			startsAt: overrides.startsAt ?? new Date("2026-01-01T09:00:00.000Z"),
			endsAt:
				overrides.endsAt === undefined
					? new Date("2026-01-01T10:00:00.000Z")
					: overrides.endsAt,
			content: overrides.content ?? "Lesson content",
			homework: overrides.homework ?? "Homework",
		},
	});
}
