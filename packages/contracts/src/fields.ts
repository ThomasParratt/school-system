/**
 * Every field format, written once. A feature's schemas build their fields
 * from these instead of spelling out a format again.
 */
import { z } from "zod";
import { LANGUAGES, LEVELS, ROLES } from "./values.js";

/** A database id: a positive safe integer. */
export const id = () => z.int().min(1);

/** An id in a URL path ("12"), checked as text and turned into a number. */
export const idParam = () =>
  z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(id());

/** Text that is not blank. Stored as sent, not trimmed. */
export const nonEmptyString = () =>
  z.string().refine((value) => value.trim().length > 0, { message: "Must not be blank" });

/** An ISO 8601 instant with a time zone ("2026-06-01T10:00:00.000Z"). */
export const dateTime = () => z.iso.datetime({ offset: true });

/** A timestamp the API answers with: an ISO instant, as `Date.toISOString()` writes it. */
export const timestamp = () => z.iso.datetime({ offset: true });


export const RoleSchema = z.enum(ROLES);
export const LanguageSchema = z.enum(LANGUAGES);
export const LevelSchema = z.enum(LEVELS);
