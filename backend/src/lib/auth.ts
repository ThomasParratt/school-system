import jwt from "jsonwebtoken";

export const AUTH_ROLES = ["admin", "instructor", "student"] as const;
export type Role = (typeof AUTH_ROLES)[number];

export type AuthTokenPayload = {
	id: number;
	role: Role;
};

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
	throw new Error("JWT_SECRET must be set");
}

export const JWT_SECRET = jwtSecret;

export function signAuthToken(payload: AuthTokenPayload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}
