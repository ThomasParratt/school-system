import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isAuthTokenPayload, JWT_SECRET, type AuthTokenPayload } from "../lib/auth.js";
import { errorResponse } from "../lib/validation.js";

export type AuthFailure = { message: string; code: "MISSING_AUTH_TOKEN" | "INVALID_TOKEN" };

/** Verifies the bearer token and sets req.user; returns why it failed, or null. */
export function authenticate(req: Request): AuthFailure | null {
    const authorizationHeader = req.header("authorization");
    if (!authorizationHeader?.startsWith("Bearer ")) {
        return { message: "Missing or invalid authorization token", code: "MISSING_AUTH_TOKEN" };
    }

    try {
        const payload = jwt.verify(authorizationHeader.slice(7), JWT_SECRET);
        if (!isAuthTokenPayload(payload)) {
            return { message: "Invalid or expired token", code: "INVALID_TOKEN" };
        }
        req.user = payload;
        return null;
    } catch {
        return { message: "Invalid or expired token", code: "INVALID_TOKEN" };
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // Already verified by the OpenAPI validator's bearerAuth handler.
    if (req.user) return next();

    const failure = authenticate(req);
    if (failure) return errorResponse(res, 401, failure.message, failure.code);
    next();
}

export function requireRole(...allowedRoles: AuthTokenPayload["role"][]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return errorResponse(res, 401, "Unauthorized", "UNAUTHORIZED");
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, 403, "Forbidden", "FORBIDDEN");
        }

        next();
    };
}
