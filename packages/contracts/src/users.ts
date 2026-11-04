/**
 * The public user: what any answer may carry about a user. Never the password
 * hash. Owned by the users feature; the users routes move onto it in their own PR.
 */
import { z } from "zod";
import { id, RoleSchema, timestamp } from "./fields.js";

export const UserSchema = z.object({
  id: id(),
  firstName: z.string(),
  secondName: z.string(),
  email: z.email(),
  role: RoleSchema,
  comments: z.string().nullable(),
  createdAt: timestamp(),
  updatedAt: timestamp().nullable(),
});
export type User = z.infer<typeof UserSchema>;
