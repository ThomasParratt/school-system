import type { ApiResponse, Session, SessionListQuery, UpdateSessionBody } from "../types";
import { apiFetch } from "./http";
import { fetchAllPages, toQueryString } from "./query";

export function deleteSession(
    token: string | null,
    sessionId: number
): Promise<ApiResponse<"/sessions/{id}", "delete">> {
    return apiFetch(`/sessions/${sessionId}`, { method: "DELETE", token });
}

/** One page of sessions. Without a query this is the first 25. */
export function getSessions(
    token: string | null,
    query: SessionListQuery = {}
): Promise<ApiResponse<"/sessions", "get">> {
    return apiFetch(`/sessions${toQueryString(query)}`, { token });
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

export function getSession(
    token: string | null,
    sessionId: number
): Promise<ApiResponse<"/sessions/{id}", "get">> {
    return apiFetch(`/sessions/${sessionId}`, { token });
}

export function getMySession(
    token: string | null,
    sessionId: number
): Promise<ApiResponse<"/users/me/sessions/{id}", "get">> {
    return apiFetch(`/users/me/sessions/${sessionId}`, { token });
}

export function updateSession(
    token: string | null,
    sessionId: number,
    session: UpdateSessionBody
): Promise<ApiResponse<"/users/me/sessions/{id}", "patch">> {
    return apiFetch(`/users/me/sessions/${sessionId}`, { method: "PATCH", token, body: session });
}

export function adminUpdateSession(
    token: string | null,
    sessionId: number,
    session: UpdateSessionBody
): Promise<ApiResponse<"/sessions/{id}", "patch">> {
    return apiFetch(`/sessions/${sessionId}`, { method: "PATCH", token, body: session });
}
