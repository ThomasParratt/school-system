/**
 * The courses feature: courses and their enrollments.
 * The two session routes under /courses/{id}/sessions belong to the sessions
 * feature and are not here yet.
 */
import { z } from "zod";
import { dataEnvelope } from "./http.js";
import { UserSchema } from "./users.js";
import { id, idParam, LanguageSchema, LevelSchema, nonEmptyString, timestamp } from "./fields.js";


export const COURSE_ERROR_CODES = {
  courseNotFound: "COURSE_NOT_FOUND",
  instructorNotFound: "INSTRUCTOR_NOT_FOUND",
  /** PATCH on a course or instructor that is gone by the time of the update. */
  notFound: "NOT_FOUND",
  userNotFound: "USER_NOT_FOUND",
  notAStudent: "INVALID_ENROLLMENT_USER",
  emptyUpdate: "EMPTY_UPDATE",
  enrollmentExists: "ENROLLMENT_EXISTS",
  enrollmentNotFound: "ENROLLMENT_NOT_FOUND",
  fetchCourses: "FETCH_COURSES_ERROR",
  fetchCourse: "FETCH_COURSE_ERROR",
  createCourse: "CREATE_COURSE_ERROR",
  updateCourse: "SERVER_ERROR",
  deleteCourse: "DELETE_COURSE_ERROR",
  fetchEnrollments: "FETCH_ENROLLMENTS_ERROR",
  createEnrollment: "CREATE_ENROLLMENT_ERROR",
  deleteEnrollment: "DELETE_ENROLLMENT_ERROR",
} as const;

export const CourseSchema = z.object({
  id: id(),
  title: z.string(),
  language: LanguageSchema,
  level: LevelSchema,
  material: z.string(),
  instructorId: id(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CourseIdParamsSchema = z.object({ id: idParam() });
export const EnrollmentParamsSchema = z.object({ courseId: idParam(), studentId: idParam() });

export const CreateCourseBodySchema = z.object({
  title: nonEmptyString(),
  language: LanguageSchema,
  level: LevelSchema,
  material: nonEmptyString(),
  instructorId: id(),
});
export type CreateCourseBody = z.infer<typeof CreateCourseBodySchema>;

/** Any subset of the create fields. A body with none of them is `EMPTY_UPDATE`. */
export const UpdateCourseBodySchema = CreateCourseBodySchema.partial();
export type UpdateCourseBody = z.infer<typeof UpdateCourseBodySchema>;
export const UPDATE_COURSE_FIELDS = Object.keys(UpdateCourseBodySchema.shape) as Array<
  keyof UpdateCourseBody
>;

export const EnrollBodySchema = z.object({ userId: id() });
export type EnrollBody = z.infer<typeof EnrollBodySchema>;

export const EnrollmentSchema = z.object({
  id: id(),
  userId: id(),
  courseId: id(),
  createdAt: timestamp(),
});
export type Enrollment = z.infer<typeof EnrollmentSchema>;

/** An enrollment in a course's list, with the enrolled user. */
export const CourseEnrollmentSchema = EnrollmentSchema.extend({ user: UserSchema });
export type CourseEnrollment = z.infer<typeof CourseEnrollmentSchema>;

export const CoursesResponseSchema = dataEnvelope(z.array(CourseSchema));
export const CourseResponseSchema = dataEnvelope(CourseSchema);
export const EnrollmentResponseSchema = dataEnvelope(EnrollmentSchema);
export const CourseEnrollmentsResponseSchema = dataEnvelope(z.array(CourseEnrollmentSchema));
export type CoursesResponse = z.infer<typeof CoursesResponseSchema>;
export type CourseResponse = z.infer<typeof CourseResponseSchema>;
export type EnrollmentResponse = z.infer<typeof EnrollmentResponseSchema>;
export type CourseEnrollmentsResponse = z.infer<typeof CourseEnrollmentsResponseSchema>;
