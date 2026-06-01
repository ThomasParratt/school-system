import { randomUUID } from "node:crypto";
import { prisma } from "../../../src/lib/prisma.js";
import { createUser } from "./userFactory.js";

type CourseOverrides = {
	title?: string;
	language?: "English" | "Finnish" | "Swedish" | "Russian" | "German" | "French";
	level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
	material?: string;
	instructorId?: number;
};

export async function createCourse(overrides: CourseOverrides = {}) {
	const instructorId =
		overrides.instructorId ?? (await createUser({ role: "instructor" })).id;

	return prisma.course.create({
		data: {
			title: overrides.title ?? `Test Course ${randomUUID()}`,
			language: overrides.language ?? "English",
			level: overrides.level ?? "A1",
			material: overrides.material ?? "https://example.com/material",
			instructorId,
		},
	});
}
