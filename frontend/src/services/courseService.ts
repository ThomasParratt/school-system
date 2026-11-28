import type { ApiResponse, Course, CourseListQuery, CreateCourseBody, CreateSessionBody, UpdateCourseBody } from "../types";
import { apiFetch } from "./http";
import { fetchAllPages, toQueryString } from "./query";

/** One page of courses. Without a query this is the first 25. */
export function getCourses(
    token: string | null,
    query: CourseListQuery = {}
): Promise<ApiResponse<"/courses", "get">> {
    return apiFetch(`/courses${toQueryString(query)}`, { token });
}

/** Every course that matches, for pickers. Screens that show a list page it with getCourses. */
export function getAllCourses(
    token: string | null,
    query: Omit<CourseListQuery, "page" | "limit"> = {}
): Promise<Course[]> {
    return fetchAllPages((page, limit) => getCourses(token, { ...query, page, limit }));
}

export function addCourse(
    token: string | null,
    course: CreateCourseBody
): Promise<ApiResponse<"/courses", "post", 201>> {
    return apiFetch("/courses", { method: "POST", token, body: course });
}

export function deleteCourse(
    token: string | null,
    courseId: number
): Promise<ApiResponse<"/courses/{id}", "delete">> {
    return apiFetch(`/courses/${courseId}`, { method: "DELETE", token });
}

export function updateCourse(
    token: string | null,
    courseId: number,
    course: UpdateCourseBody
): Promise<ApiResponse<"/courses/{id}", "patch">> {
    return apiFetch(`/courses/${courseId}`, { method: "PATCH", token, body: course });
}

export function enroll(
    token: string | null,
    courseId: number,
    userId: number
): Promise<ApiResponse<"/courses/{id}/enroll", "post", 201>> {
    return apiFetch(`/courses/${courseId}/enroll`, { method: "POST", token, body: { userId } });
}

export function unenroll(
    token: string | null,
    courseId: number,
    studentId: number
): Promise<ApiResponse<"/courses/{courseId}/enrollments/{studentId}", "delete">> {
    return apiFetch(`/courses/${courseId}/enrollments/${studentId}`, { method: "DELETE", token });
}

export function getCourseEnrollments(
    token: string | null,
    courseId: number,
): Promise<ApiResponse<"/courses/{id}/enrollments", "get">> {
    return apiFetch(`/courses/${courseId}/enrollments`, { token });
}

export function addCourseSession(
    token: string | null,
    courseId: number,
    session: CreateSessionBody
): Promise<ApiResponse<"/courses/{id}/sessions", "post", 201>> {
    return apiFetch(`/courses/${courseId}/sessions`, { method: "POST", token, body: session });
}
