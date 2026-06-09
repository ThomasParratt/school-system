import type { ApiErrorResponse } from "../types";

export async function getUsers(token: string | null) {
    const res = await fetch("http://localhost:3000/users", {
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

export async function addUser(
    token: string | null,
    user: { firstName: string; secondName: string; email: string; password: string; comments: string }
) {
    const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
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

export async function deleteUser(
    token: string | null,
    userId: number
) {
    const res = await fetch(`http://localhost:3000/users/${userId}`, {
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

export async function updateUser(
    token: string | null,
    userId: number,
    user: { firstName: string; secondName: string; email: string; comments: string }
) {
    const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
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

export async function getEnrollments(
    token: string | null,
    userId: number,
) {
    const res = await fetch(`http://localhost:3000/users/${userId}/enrollments`, {
        method: "GET",
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