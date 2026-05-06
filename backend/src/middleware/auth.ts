import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, type AuthTokenPayload } from "../lib/auth.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authorizationHeader = req.header("authorization");
	if (!authorizationHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Missing or invalid authorization token" });
	}

	const token = authorizationHeader.slice(7);

	try {
		const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
		req.user = payload;
		next();
	} catch {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
}

export function requireRole(allowedRole: AuthTokenPayload["role"]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (req.user.role !== allowedRole) {
			return res.status(403).json({ message: "Forbidden" });
		}

		next();
	};
}
