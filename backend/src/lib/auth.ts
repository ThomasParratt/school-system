import type { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
	id: number;
	role: Role;
};

export const JWT_SECRET = process.env.JWT_SECRET ?? "supersecretkey";

export function signAuthToken(payload: AuthTokenPayload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}
