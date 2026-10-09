import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isAuthTokenPayload, JWT_SECRET, type AuthTokenPayload } from "../lib/auth.js";
import { errorResponse } from "../lib/validation.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.header("authorization");
    if (!authorizationHeader?.startsWith("Bearer ")) {
        return errorResponse(res, 401, "Missing or invalid authorization token", "MISSING_AUTH_TOKEN");
    }

    const token = authorizationHeader.slice(7);

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (!isAuthTokenPayload(payload)) {
            return errorResponse(res, 401, "Invalid or expired token", "INVALID_TOKEN");
        }
        req.user = payload;
        next();
    } catch {
        return errorResponse(res, 401, "Invalid or expired token", "INVALID_TOKEN");
    }
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
