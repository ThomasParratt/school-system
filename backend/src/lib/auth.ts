import jwt from "jsonwebtoken";

export const AUTH_ROLES = ["admin", "instructor", "student"] as const;
export type Role = (typeof AUTH_ROLES)[number];

export type AuthTokenPayload = {
	id: number;
	role: Role;
};

export const JWT_SECRET = process.env.JWT_SECRET ?? "supersecretkey";

export function signAuthToken(payload: AuthTokenPayload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}
