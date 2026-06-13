import type { ApiErrorResponse } from "../types";

export async function getCourses(token: string | null) {
    const res = await fetch("http://localhost:3000/courses", {
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

export async function addCourse(
    token: string | null,
    user: { title: string; language: string; level: string; material: string }
) {
    const res = await fetch("http://localhost:3000/courses", {
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

export async function deleteCourse(
    token: string | null,
    courseId: number
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}`, {
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
    course: { title: string; language: string; level: string; material: string }
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}`, {
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
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}/enroll`, {
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
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}/enrollments/${studentId}`, {
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
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}/enrollments`, {
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
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}/sessions`, {
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

export async function addCourseSessions(
    token: string | null,
    courseId: number,
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}/sessions`, {
        method: "POST",
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

