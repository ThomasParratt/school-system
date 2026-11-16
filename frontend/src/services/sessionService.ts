import type { ApiErrorResponse, ApiResponse, Session, SessionListQuery, UpdateSessionBody } from "../types";
import { fetchAllPages, toQueryString } from "./query";

export async function deleteSession(
    token: string | null,
    sessionId: number
): Promise<ApiResponse<"/sessions/{id}", "delete">> {
    const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    return res.json();
}

/** One page of sessions. Without a query this is the first 25. */
export async function getSessions(
    token: string | null,
    query: SessionListQuery = {}
): Promise<ApiResponse<"/sessions", "get">> {
    const res = await fetch(`/api/sessions${toQueryString(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    return res.json();
}

/**
 * Every session that matches, e.g. all of those in the range a calendar shows.
 * Without from and to this is every session there is.
 */
export function getAllSessions(
    token: string | null,
    query: Omit<SessionListQuery, "page" | "limit"> = {}
): Promise<Session[]> {
    return fetchAllPages((page, limit) => getSessions(token, { ...query, page, limit }));
}

export async function getSession(
    token: string | null,
    sessionId: number
): Promise<ApiResponse<"/sessions/{id}", "get">> {
    const res = await fetch(`/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    return res.json();
}

export async function getMySession(
    token: string | null,
    sessionId: number
): Promise<ApiResponse<"/users/me/sessions/{id}", "get">> {
    const res = await fetch(`/api/users/me/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    return res.json();
}

export async function updateSession(
    token: string | null,
    sessionId: number,
    session: UpdateSessionBody
): Promise<ApiResponse<"/users/me/sessions/{id}", "patch">> {
    const res = await fetch(`/api/users/me/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
    });

    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    return res.json();
}

export async function adminUpdateSession(
    token: string | null,
    sessionId: number,
    session: UpdateSessionBody
): Promise<ApiResponse<"/sessions/{id}", "patch">> {
    const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
    });

    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    return res.json();
}