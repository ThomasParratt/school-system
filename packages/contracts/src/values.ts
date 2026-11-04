/**
 * The fixed lists of the domain. No zod here: the frontend imports these
 * (and the paths) at runtime, and zod stays out of its bundle.
 */
export const ROLES = ["admin", "student", "instructor"] as const;
export const LANGUAGES = ["English", "Finnish", "Swedish", "Russian", "German", "French"] as const;
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type Role = (typeof ROLES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Level = (typeof LEVELS)[number];
