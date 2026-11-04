/**
 * Who may teach and who may enroll. The routes look the user up and ask these.
 */
import type { Role } from "@school/contracts";

/** A course is taught by an instructor; an admin or a student cannot be assigned. */
export const canTeach = (role: Role): boolean => role === "instructor";

export const ENROLLMENT_REFUSALS = { notAStudent: "NOT_A_STUDENT" } as const;
export type EnrollmentRefusal = (typeof ENROLLMENT_REFUSALS)[keyof typeof ENROLLMENT_REFUSALS];

export type EnrollmentDecision = { allowed: true } | { allowed: false; reason: EnrollmentRefusal };

/** Only students take courses. */
export function enrollmentDecision(role: Role): EnrollmentDecision {
  return role === "student"
    ? { allowed: true }
    : { allowed: false, reason: ENROLLMENT_REFUSALS.notAStudent };
}
