import type { Response } from "express";

// Request validation lives in openapi.yaml (see openapiValidation.ts); these are the helpers routes still use.

export function errorResponse(
  res: Response,
  status: number,
  message: string,
  code = "VALIDATION_ERROR",
) {
  return res.status(status).json({ error: { message, code } });
}

export function isPrismaError(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code?: unknown }).code === code;
}
