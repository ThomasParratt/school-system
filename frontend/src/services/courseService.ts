import type { ApiErrorResponse, ApiResponse, Course, CourseListQuery, CreateCourseBody, CreateSessionBody, Session, UpdateCourseBody } from "../types";
import { fetchAllPages, toQueryString } from "./query";

/** One page of courses. Without a query this is the first 25. */
export async function getCourses(
    token: string | null,
    query: CourseListQuery = {}
): Promise<ApiResponse<"/courses", "get">> {
    const res = await fetch(`/api/courses${toQueryString(query)}`, {
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

/** Every course that matches, for pickers. Screens that show a list page it with getCourses. */
export function getAllCourses(
    token: string | null,
    query: Omit<CourseListQuery, "page" | "limit"> = {}
): Promise<Course[]> {
    return fetchAllPages((page, limit) => getCourses(token, { ...query, page, limit }));
}

export async function addCourse(
    token: string | null,
    course: CreateCourseBody
): Promise<ApiResponse<"/courses", "post", 201>> {
    const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(course),
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

export async function deleteCourse(
    token: string | null,
    courseId: number
): Promise<ApiResponse<"/courses/{id}", "delete">> {
    const res = await fetch(`/api/courses/${courseId}`, {
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

export async function updateCourse(
    token: string | null,
    courseId: number,
    course: UpdateCourseBody
): Promise<ApiResponse<"/courses/{id}", "patch">> {
    const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(course),
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

export async function enroll(
    token: string | null,
    courseId: number,
    userId: number
): Promise<ApiResponse<"/courses/{id}/enroll", "post", 201>> {
    const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
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

export async function unenroll(
    token: string | null,
    courseId: number,
    studentId: number
): Promise<ApiResponse<"/courses/{courseId}/enrollments/{studentId}", "delete">> {
    const res = await fetch(`/api/courses/${courseId}/enrollments/${studentId}`, {
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

export async function getCourseEnrollments(
    token: string | null,
    courseId: number,
): Promise<ApiResponse<"/courses/{id}/enrollments", "get">> {
    const res = await fetch(`/api/courses/${courseId}/enrollments`, {
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

export async function getCourseSessions(
    token: string | null,
    courseId: number,
): Promise<Session[]> {
    const res = await fetch(`/api/courses/${courseId}/sessions`, {
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

export async function addCourseSession(
    token: string | null,
    courseId: number,
    session: CreateSessionBody
): Promise<ApiResponse<"/courses/{id}/sessions", "post", 201>> {
    const res = await fetch(`/api/courses/${courseId}/sessions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
    });
    console.log(session);
    if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errorMessage = contentType.includes("application/json")
            ? ((await res.json()) as ApiErrorResponse).error?.message ?? "Request failed"
            : await res.text();
        throw new Error(errorMessage);
    }
    return res.json();
}

