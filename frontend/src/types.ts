import type { components, paths } from "./api/schema";

// ---------------------------------------------------------------------------
// API shapes. These come from backend/openapi.yaml through src/api/schema.d.ts,
// which is generated: after changing the spec, run `npm run gen:api`.
// ---------------------------------------------------------------------------

type Schemas = components["schemas"];

export type Language = Schemas["Language"];
export type Level = Schemas["Level"];
export type User = Schemas["User"];
export type Role = User["role"];
export type Course = Schemas["Course"];
export type CourseWithInstructor = Schemas["CourseWithInstructor"];
export type Session = Schemas["ClassSession"];
export type Enrollment = Schemas["Enrollment"];
export type PageMeta = Schemas["PageMeta"];

type Method = "get" | "post" | "patch" | "delete";
type JsonBody<T> = T extends { content: { "application/json": infer B } } ? B : never;

/** The JSON body an operation answers with, e.g. ApiResponse<"/courses", "get">. */
export type ApiResponse<P extends keyof paths, M extends Method & keyof paths[P], S extends number = 200> =
    paths[P][M] extends { responses: infer R }
        ? S extends keyof R ? JsonBody<R[S]> : never
        : never;

/** The JSON body an operation takes, e.g. ApiRequest<"/courses", "post">. */
export type ApiRequest<P extends keyof paths, M extends Method & keyof paths[P]> =
    paths[P][M] extends { requestBody?: infer B } ? JsonBody<NonNullable<B>> : never;

/** The query string an operation takes, e.g. ApiQuery<"/users", "get">. */
export type ApiQuery<P extends keyof paths, M extends Method & keyof paths[P]> =
    paths[P][M] extends { parameters: { query?: infer Q } } ? NonNullable<Q> : never;

/** An enrollment from GET /courses/{id}/enrollments, with its student. */
export type CourseEnrollment = ApiResponse<"/courses/{id}/enrollments", "get">["data"][number];
/** An enrollment from GET /users/{id}/enrollments, with its course. */
export type UserEnrollment = ApiResponse<"/users/{id}/enrollments", "get">["data"][number];

export type UserListQuery = ApiQuery<"/users", "get">;

export type LoginResponse = ApiResponse<"/auth/login", "post">;

export type CreateUserBody = ApiRequest<"/users", "post">;
export type UpdateUserBody = ApiRequest<"/users/{id}", "patch">;
export type CreateCourseBody = ApiRequest<"/courses", "post">;
export type UpdateCourseBody = ApiRequest<"/courses/{id}", "patch">;
export type CreateSessionBody = ApiRequest<"/courses/{id}/sessions", "post">;
export type UpdateSessionBody = ApiRequest<"/sessions/{id}", "patch">;

/**
 * An error body. Looser than the spec's Error schema on purpose: a failed request
 * may not have reached the API at all (a proxy or network error).
 */
export type ApiErrorResponse = {
    error?: {
        message?: string;
        code?: string;
    };
};

// ---------------------------------------------------------------------------
// UI state. Not API shapes: what the admin forms hold while editing.
// ---------------------------------------------------------------------------

/** The add/edit form for a student or instructor; enrollments are the user's courses. */
export type UserForm = Partial<CreateUserBody> & { enrollments?: Course[] };

/** The add/edit form for a course; enrollments are its students. */
export type CourseForm = Partial<CreateCourseBody> & { enrollments?: User[] };

export type CoursesProps = {
    token: string | null;
    users: User[];
    courses: Course[];
    refreshCourses: () => Promise<void>;
}

export type MyCoursesProps = {
    token: string | null;
    courses: Course[];
}

export type UsersProps = {
    token: string | null;
    courses: Course[];
    refreshUsers: () => Promise<void>;
}

export type MyStudentsProps = {
    token: string | null;
    users: User[];
    courses: Course[];
}

export type CalendarProps = {
    token: string | null;
    courses: Course[];
    sessions: Session[];
    refreshSessions: () => Promise<void>;
};

export type MyLessonsProps = {
    token: string | null;
    courses: Course[];
    sessions: Session[];
};
