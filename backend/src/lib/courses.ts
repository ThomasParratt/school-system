/** The rows the courses routes read, and their mappers to the contract shapes. */
import type { Course, CourseEnrollment, Enrollment } from "@school/contracts";
import { PUBLIC_USER_SELECT, toUser } from "./users.js";

export const COURSE_SELECT = {
  id: true,
  title: true,
  language: true,
  level: true,
  material: true,
  instructorId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const ENROLLMENT_SELECT = {
  id: true,
  userId: true,
  courseId: true,
  createdAt: true,
} as const;

export const COURSE_ENROLLMENT_SELECT = {
  ...ENROLLMENT_SELECT,
  user: { select: PUBLIC_USER_SELECT },
} as const;

type Timestamps<T, K extends keyof T> = Omit<T, K> & { [P in K]: Date };

export const toCourse = (row: Timestamps<Course, "createdAt" | "updatedAt">): Course => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const toEnrollment = (row: Timestamps<Enrollment, "createdAt">): Enrollment => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

export const toCourseEnrollment = (
  row: Timestamps<Enrollment, "createdAt"> & { user: Parameters<typeof toUser>[0] },
): CourseEnrollment => ({ ...toEnrollment(row), user: toUser(row.user) });
