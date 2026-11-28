import type { ApiErrorResponse } from "../types";

/** A failed API call: its HTTP status, and the API's error code when it answered one. */
export class ApiError extends Error {
    readonly status: number;
    readonly code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }

    /** A 401 to a request that carried a token: the token expired or was rejected. */
    get isSessionExpired(): boolean {
        return this.status === 401 && this.code !== "INVALID_CREDENTIALS";
    }
}

let onSessionExpired: (() => void) | null = null;

/** Called by AuthProvider: what to do when a signed-in request answers 401. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
    onSessionExpired = handler;
}

type RequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    token?: string | null;
    body?: unknown;
};

/**
 * Calls the API at /api{path} and answers its JSON body. A body is sent as JSON.
 * A failure throws an ApiError; a 401 to a request with a token also signs the user out.
 */
export async function apiFetch<T>(path: string, { method = "GET", token, body }: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(`/api${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await toApiError(res);
        if (token && error.isSessionExpired) onSessionExpired?.();
        throw error;
    }
    return res.json() as Promise<T>;
}

async function toApiError(res: Response): Promise<ApiError> {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        const body = (await res.json().catch(() => ({}))) as ApiErrorResponse;
        return new ApiError(res.status, body.error?.message ?? res.statusText ?? "Request failed", body.error?.code);
    }
    // Not the API's own answer, e.g. a proxy error page.
    return new ApiError(res.status, (await res.text()) || res.statusText || "Request failed");
}
