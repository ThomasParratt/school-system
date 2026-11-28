import type { NextFunction, Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { authenticate, type AuthFailure } from "../middleware/authMiddleware.js";
import { errorResponse } from "./validation.js";

type SecurityFailure = { message: string; code: AuthFailure["code"] | "PASSWORD_CHANGE_REQUIRED" };

// The validator keeps only a thrown error's message, so the failure's code waits here.
const securityFailures = new WeakMap<Request, SecurityFailure>();

/** Marks the operations a user who must change their password can still call. */
const ALLOWED_BEFORE_PASSWORD_CHANGE = "x-allowed-before-password-change";

/**
 * Validates every request's path params, query and JSON body against openapi.yaml
 * before it reaches a router. A route that is not in the spec answers 404.
 *
 * The bearer token and the operation's roles are checked first, on the operations
 * the spec secures, so a request is answered 401 or 403 before its body is looked
 * at. requireAuth and requireRole in the routes stay as a second check.
 *
 * A token issued while the user must change their password is answered 403
 * PASSWORD_CHANGE_REQUIRED everywhere except the operations marked
 * `x-allowed-before-password-change: true`.
 */
export function openApiValidator(spec: object) {
  return OpenApiValidator.middleware({
    // The validator edits the document it is given; /docs keeps the original.
    apiSpec: structuredClone(spec) as OpenAPIV3.DocumentV3,
    validateRequests: true,
    validateResponses: false,
    validateSecurity: {
      handlers: {
        // `roles` is the operation's list in the spec, e.g. `- bearerAuth: [admin]`; empty means any role.
        bearerAuth: (req, roles) => {
          const failure = authenticate(req as Request);
          if (failure) {
            securityFailures.set(req as Request, failure);
            throw { status: 401, error: { message: failure.message } };
          }
          const operation = (req as Request & { openapi?: { schema?: Record<string, unknown> } }).openapi?.schema;
          if ((req as Request).user?.mustChangePassword && operation?.[ALLOWED_BEFORE_PASSWORD_CHANGE] !== true) {
            const message = "You must change your password before continuing";
            securityFailures.set(req as Request, { message, code: "PASSWORD_CHANGE_REQUIRED" });
            throw { status: 403, error: { message } };
          }
          const role = (req as Request).user?.role;
          if (roles.length > 0 && (!role || !roles.includes(role))) {
            throw { status: 403, error: { message: "Forbidden" } };
          }
          return true;
        },
      },
    },
  });
}

type ValidatorError = {
  status: number;
  message?: string;
  errors?: { path: string; message: string }[];
};

function isValidatorError(error: unknown): error is ValidatorError {
  return typeof error === "object" && error !== null &&
    typeof (error as { status?: unknown }).status === "number" &&
    Array.isArray((error as { errors?: unknown }).errors);
}

/** Answers the validator's errors in the API's { error: { message, code } } shape. */
export function openApiErrorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (!isValidatorError(error)) return next(error);

  const first = error.errors?.[0];
  const message = first ? `${first.path}: ${first.message}` : error.message ?? "Invalid request";

  switch (error.status) {
    case 400:
      // Every path param in this API is a resource ID.
      if (first?.path.includes("/params/")) return errorResponse(res, 400, "Invalid ID", "INVALID_ID");
      return errorResponse(res, 400, message, "VALIDATION_ERROR");
    case 401: {
      const failure = securityFailures.get(req);
      return failure
        ? errorResponse(res, 401, failure.message, failure.code)
        : errorResponse(res, 401, "Missing or invalid authorization token", "MISSING_AUTH_TOKEN");
    }
    case 403: {
      const failure = securityFailures.get(req);
      return failure?.code === "PASSWORD_CHANGE_REQUIRED"
        ? errorResponse(res, 403, failure.message, failure.code)
        : errorResponse(res, 403, "Forbidden", "FORBIDDEN");
    }
    case 404:
      return errorResponse(res, 404, "Route not found", "ROUTE_NOT_FOUND");
    case 405:
      return errorResponse(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");
    case 415:
      return errorResponse(res, 400, "Request body must use Content-Type: application/json", "INVALID_CONTENT_TYPE");
    default:
      return next(error);
  }
}
