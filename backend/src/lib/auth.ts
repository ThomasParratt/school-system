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

export function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
	if (typeof value !== "object" || value === null) return false;
	const payload = value as Record<string, unknown>;
	return Number.isSafeInteger(payload.id) &&
		(payload.id as number) > 0 &&
		typeof payload.role === "string" &&
		AUTH_ROLES.includes(payload.role as Role);
}
