import { ApiError } from "../services/http";

/** What to tell the user for the API's error codes that need more than the API's message. */
const MESSAGES: Record<string, string> = {
    INVALID_CREDENTIALS: "Wrong email or password.",
    INVALID_CURRENT_PASSWORD: "The current password is incorrect.",
    PASSWORD_UNCHANGED: "Choose a password different from the current one.",
    PASSWORD_CHANGE_REQUIRED: "You must change your password before continuing.",
    EMAIL_ALREADY_EXISTS: "A user with this email already exists.",
    SESSION_EXISTS: "This course already has a session at that start time.",
    ENROLLMENT_EXISTS: "The student is already enrolled in this course.",
    ENROLLMENT_NOT_FOUND: "The student is not enrolled in this course.",
    INVALID_ENROLLMENT_USER: "Only students can be enrolled in a course.",
    USER_NOT_FOUND: "That user no longer exists. Reload the page.",
    COURSE_NOT_FOUND: "That course no longer exists. Reload the page.",
    SESSION_NOT_FOUND: "That session no longer exists. Reload the page.",
    INSTRUCTOR_NOT_FOUND: "The chosen instructor no longer exists.",
    INVALID_ID: "That record could not be found.",
    EMPTY_UPDATE: "Change at least one field before saving.",
};

/** A message for the user about a failed action. Unknown API errors keep their code, e.g. "… (FETCH_USERS_ERROR)". */
export function errorMessage(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.code && MESSAGES[err.code]) return MESSAGES[err.code];
        if (err.isSessionExpired) return "Your session has expired. Please log in again.";
        if (err.status === 403) return "You don't have permission to do that.";
        return err.code ? `${err.message} (${err.code})` : err.message;
    }
    if (err instanceof Error) return err.message;
    return String(err);
}

/**
 * Logs a failed action and alerts the user. An expired session is not alerted: the
 * app has already returned to the login screen, which says so.
 */
export function showError(err: unknown): void {
    console.error(err);
    if (err instanceof ApiError && err.isSessionExpired) return;
    alert(errorMessage(err));
}
