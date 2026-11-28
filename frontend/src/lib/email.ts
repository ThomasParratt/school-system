// The same pattern as the Email schema in backend/openapi.yaml, so the form and the API agree.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const INVALID_EMAIL_MESSAGE = "Please enter a valid email address.";

export function isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(email);
}
