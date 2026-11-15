import type { ApiErrorResponse, ApiResponse, CreateUserBody, UpdateUserBody } from "../types";

export async function getUsers(token: string | null): Promise<ApiResponse<"/users", "get">> {
    const res = await fetch("/api/users", {
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
    user: CreateUserBody
): Promise<ApiResponse<"/users", "post", 201>> {
    const res = await fetch("/api/users", {
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
): Promise<ApiResponse<"/users/{id}", "delete">> {
    const res = await fetch(`/api/users/${userId}`, {
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
    user: UpdateUserBody
): Promise<ApiResponse<"/users/{id}", "patch">> {
    const res = await fetch(`/api/users/${userId}`, {
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

export async function getUserEnrollments(
    token: string | null,
    userId: number,
): Promise<ApiResponse<"/users/{id}/enrollments", "get">> {
    const res = await fetch(`/api/users/${userId}/enrollments`, {
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

export async function getUserCourses(token: string | null): Promise<ApiResponse<"/users/me/courses", "get">> {
    const res = await fetch("/api/users/me/courses", {
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

export async function getUserSessions(token: string | null): Promise<ApiResponse<"/users/me/sessions", "get">> {
    const res = await fetch("/api/users/me/sessions", {
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

export async function getUserStudents(token: string | null): Promise<ApiResponse<"/users/me/students", "get">> {
    const res = await fetch("/api/users/me/students", {
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