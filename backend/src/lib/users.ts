/** The public user, the only user shape an answer carries (`UserSchema`). */
import type { User } from "@school/contracts";

export const PUBLIC_USER_SELECT = {
  id: true,
  firstName: true,
  secondName: true,
  email: true,
  role: true,
  comments: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PublicUserRow = Omit<User, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date | null;
};

export const toUser = (row: PublicUserRow): User => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt?.toISOString() ?? null,
});
