import type { ApiErrorResponse } from "../types";

export async function deleteSession(
    token: string | null,
    sessionId: number
) {
    const res = await fetch(`http://localhost:3000/sessions/${sessionId}`, {
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

export async function getAllSessions(
    token: string | null,
) {
    const res = await fetch(`http://localhost:3000/sessions/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    const data = await res.json();
    //console.log(data.data);
    return data.data;
}

export async function getSession(
    token: string | null,
    sessionId: number
) {
    const res = await fetch(`http://localhost:3000/sessions/${sessionId}`, {
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
    session: {
        location?: string;
        startsAt?: string;
        endsAt?: string | null;
        content?: string | null;
        homework?: string | null;
    }
) {
    const res = await fetch(`http://localhost:3000/sessions/${sessionId}`, {
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