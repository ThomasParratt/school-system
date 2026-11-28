import type { CourseForm, Language, Level, Session, UpdateSessionBody, UserForm } from "../types";

// Form checks that mirror the rules in backend/openapi.yaml, so a form can say what is
// wrong before sending a request the API would reject. The API still checks everything:
// keep these in step with the spec when it changes.

// Records, so TypeScript fails the build if the spec's enums gain or lose a value.
const LANGUAGE_SET: Record<Language, true> = { English: true, Finnish: true, Swedish: true, Russian: true, German: true, French: true };
const LEVEL_SET: Record<Level, true> = { A1: true, A2: true, B1: true, B2: true, C1: true, C2: true };

export const LANGUAGES = Object.keys(LANGUAGE_SET) as Language[];
export const LEVELS = Object.keys(LEVEL_SET) as Level[];

/** The spec's Email pattern. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The spec's Password minLength. */
export const PASSWORD_MIN_LENGTH = 8;

export const INVALID_EMAIL_MESSAGE = "Please enter a valid email address.";
export const INVALID_PASSWORD_MESSAGE = `The password needs at least ${PASSWORD_MIN_LENGTH} characters.`;

export function isLanguage(value: unknown): value is Language {
    return typeof value === "string" && Object.hasOwn(LANGUAGE_SET, value);
}

export function isLevel(value: unknown): value is Level {
    return typeof value === "string" && Object.hasOwn(LEVEL_SET, value);
}

/** Empty, missing or only whitespace: what the spec's NonEmptyString rejects. */
export function isBlank(value: string | null | undefined): boolean {
    return !value || !/\S/.test(value);
}

export function isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(email);
}

export function isValidPassword(password: string): boolean {
    return password.length >= PASSWORD_MIN_LENGTH && !isBlank(password);
}

/** A database id: a positive whole number. */
export function isPositiveId(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * The first problem with a student or instructor form, or null when it can be saved.
 * The password is only checked when adding: an admin can't change it from the edit form.
 */
export function userFormError(form: UserForm, { requirePassword }: { requirePassword: boolean }): string | null {
    if (isBlank(form.firstName) || isBlank(form.secondName) || isBlank(form.email) ||
        (requirePassword && !form.password)) {
        return "Please fill in all required fields.";
    }
    if (!isValidEmail(form.email!.trim())) return INVALID_EMAIL_MESSAGE;
    if (requirePassword && !isValidPassword(form.password!)) return INVALID_PASSWORD_MESSAGE;
    return null;
}

/** The first problem with a course form, or null when it can be saved. */
export function courseFormError(form: CourseForm): string | null {
    if (isBlank(form.title) || isBlank(form.material) || !form.language || !form.level || !form.instructorId) {
        return "Please fill in all required fields.";
    }
    if (!isLanguage(form.language)) return "Please choose a language from the list.";
    if (!isLevel(form.level)) return "Please choose a level from the list.";
    if (!isPositiveId(form.instructorId)) return "Please choose an instructor from the list.";
    return null;
}

/** The first problem with a session's times, or null. Without an end there is nothing to compare. */
export function sessionTimesError(startsAt: Date, endsAt?: Date | null): string | null {
    if (Number.isNaN(startsAt.getTime())) return "Please choose a valid start time.";
    if (endsAt) {
        if (Number.isNaN(endsAt.getTime())) return "Please choose a valid end time.";
        if (endsAt <= startsAt) return "The session must end after it starts.";
    }
    return null;
}

/** The first problem with a session's location, or null. */
export function locationError(location: string | null | undefined): string | null {
    return isBlank(location) ? "Please enter a location." : null;
}

/**
 * The PATCH body for a session's edit form. Blank content or homework is sent as null,
 * which the API takes as "none": it rejects an empty string.
 */
export function toSessionUpdate(form: Pick<Partial<Session>, "location" | "content" | "homework">): UpdateSessionBody {
    return {
        location: form.location?.trim(),
        content: isBlank(form.content) ? null : form.content,
        homework: isBlank(form.homework) ? null : form.homework,
    };
}
