import type { ApiResponse, ChangePasswordBody, ChangePasswordResponse, CreateUserBody, UpdateUserBody, User, UserListQuery } from "../types";
import { apiFetch } from "./http";
import { fetchAllPages, toQueryString } from "./query";

/** One page of users. Without a query this is the first 25. */
export function getUsers(
    token: string | null,
    query: UserListQuery = {}
): Promise<ApiResponse<"/users", "get">> {
    return apiFetch(`/users${toQueryString(query)}`, { token });
}

/** Every user that matches, for pickers. Screens that show a list page it with getUsers. */
export function getAllUsers(
    token: string | null,
    query: Omit<UserListQuery, "page" | "limit"> = {}
): Promise<User[]> {
    return fetchAllPages((page, limit) => getUsers(token, { ...query, page, limit }));
}

export function addUser(
    token: string | null,
    user: CreateUserBody
): Promise<ApiResponse<"/users", "post", 201>> {
    return apiFetch("/users", { method: "POST", token, body: user });
}

export function deleteUser(
    token: string | null,
    userId: number
): Promise<ApiResponse<"/users/{id}", "delete">> {
    return apiFetch(`/users/${userId}`, { method: "DELETE", token });
}

export function updateUser(
    token: string | null,
    userId: number,
    user: UpdateUserBody
): Promise<ApiResponse<"/users/{id}", "patch">> {
    return apiFetch(`/users/${userId}`, { method: "PATCH", token, body: user });
}

export function getUserEnrollments(
    token: string | null,
    userId: number,
): Promise<ApiResponse<"/users/{id}/enrollments", "get">> {
    return apiFetch(`/users/${userId}/enrollments`, { token });
}

export function getUserCourses(token: string | null): Promise<ApiResponse<"/users/me/courses", "get">> {
    return apiFetch("/users/me/courses", { token });
}

export function getUserSessions(token: string | null): Promise<ApiResponse<"/users/me/sessions", "get">> {
    return apiFetch("/users/me/sessions", { token });
}

export function getUserStudents(token: string | null): Promise<ApiResponse<"/users/me/students", "get">> {
    return apiFetch("/users/me/students", { token });
}

/** Changes the signed-in user's password. Answers a new token, which no longer needs a change. */
export function changePassword(
    token: string | null,
    body: ChangePasswordBody
): Promise<ChangePasswordResponse> {
    return apiFetch("/users/me/password", { method: "POST", token, body });
}
