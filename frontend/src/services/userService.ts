import type { ApiErrorResponse, ApiResponse, CreateUserBody, UpdateUserBody, User, UserListQuery } from "../types";

/** A query string from the params that are set, e.g. "?role=student&page=2". */
function toQueryString(query: Record<string, string | number | undefined>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

/** One page of users. Without a query this is the first 25. */
export async function getUsers(
    token: string | null,
    query: UserListQuery = {}
): Promise<ApiResponse<"/users", "get">> {
    const res = await fetch(`/api/users${toQueryString(query)}`, {
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
 * Every user that matches, fetched a page at a time. For pickers that need the whole
 * list; screens that show a list should page it with getUsers instead.
 */
export async function getAllUsers(
    token: string | null,
    query: Omit<UserListQuery, "page" | "limit"> = {}
): Promise<User[]> {
    const limit = 100;
    const users: User[] = [];
    for (let page = 1; ; page++) {
        const res = await getUsers(token, { ...query, page, limit });
        users.push(...res.data);
        if (res.data.length < limit || users.length >= res.meta.total) return users;
    }
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