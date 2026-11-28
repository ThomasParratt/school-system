import jwt from "jsonwebtoken";

export const AUTH_ROLES = ["admin", "instructor", "student"] as const;
export type Role = (typeof AUTH_ROLES)[number];

export type AuthTokenPayload = {
	id: number;
	role: Role;
	/** The user must change their password before any operation but POST /users/me/password. */
	mustChangePassword?: boolean;
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
		AUTH_ROLES.includes(payload.role as Role) &&
		(payload.mustChangePassword === undefined || typeof payload.mustChangePassword === "boolean");
}

/** The `{ user, token }` that login and a password change answer with. */
export function authSession(user: {
	id: number;
	firstName: string;
	secondName: string;
	email: string;
	role: Role;
	mustChangePassword: boolean;
	createdAt: Date;
	updatedAt: Date | null;
}) {
	return {
		user: {
			id: user.id,
			firstName: user.firstName,
			secondName: user.secondName,
			email: user.email,
			role: user.role,
			mustChangePassword: user.mustChangePassword,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		},
		token: signAuthToken({ id: user.id, role: user.role, mustChangePassword: user.mustChangePassword }),
	};
}
