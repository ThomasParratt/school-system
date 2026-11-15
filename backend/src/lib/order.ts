import type { Prisma } from "@prisma/client";

// The order lists are answered in. Without one, Postgres answers in storage order,
// and an updated row moves to the end. The id breaks ties so the order is stable.

export const USER_ORDER = [
  { secondName: "asc" },
  { firstName: "asc" },
  { id: "asc" },
] satisfies Prisma.UserOrderByWithRelationInput[];

export const COURSE_ORDER = [
  { title: "asc" },
  { id: "asc" },
] satisfies Prisma.CourseOrderByWithRelationInput[];

export const SESSION_ORDER = [
  { startsAt: "asc" },
  { id: "asc" },
] satisfies Prisma.ClassSessionOrderByWithRelationInput[];

type Named = { id: number; firstName: string; secondName: string };
type Timed = { id: number; startsAt: Date };

/** USER_ORDER, for users gathered in code rather than by one query. */
export function byName(a: Named, b: Named) {
  return a.secondName.localeCompare(b.secondName) || a.firstName.localeCompare(b.firstName) || a.id - b.id;
}

/** SESSION_ORDER, for sessions gathered in code rather than by one query. */
export function byStart(a: Timed, b: Timed) {
  return a.startsAt.getTime() - b.startsAt.getTime() || a.id - b.id;
}
