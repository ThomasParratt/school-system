import type { Response } from "express";

export const ROLES = ["admin", "student", "instructor"] as const;
export const LANGUAGES = ["English", "Finnish", "Swedish", "Russian", "German", "French"] as const;
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function errorResponse(
  res: Response,
  status: number,
  message: string,
  code = "VALIDATION_ERROR",
) {
  return res.status(status).json({ error: { message, code } });
}

export function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function positiveIntegerParam(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return undefined;
  const parsed = Number(value);
  return positiveInteger(parsed) ? parsed : undefined;
}

export function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validEmail(value: unknown): value is string {
  return typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validDateTime(value: unknown): value is string {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}

export function hasOwn(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function isPrismaError(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code?: unknown }).code === code;
}
