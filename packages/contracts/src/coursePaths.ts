/** The courses routes. No zod here, so the frontend can import them cheaply. */

/** Where the courses router is mounted. */
export const COURSES_BASE_PATH = "/courses";

/** The routes, relative to `COURSES_BASE_PATH`, as Express writes them. */
export const COURSE_ROUTES = {
  list: "/",
  course: "/:id",
  enrollments: "/:id/enrollments",
  enroll: "/:id/enroll",
  enrollment: "/:courseId/enrollments/:studentId",
} as const;

/** The same routes as full paths, for callers. */
export const coursePaths = {
  list: () => COURSES_BASE_PATH,
  course: (courseId: number) => `${COURSES_BASE_PATH}/${courseId}`,
  enrollments: (courseId: number) => `${COURSES_BASE_PATH}/${courseId}/enrollments`,
  enroll: (courseId: number) => `${COURSES_BASE_PATH}/${courseId}/enroll`,
  enrollment: (courseId: number, studentId: number) =>
    `${COURSES_BASE_PATH}/${courseId}/enrollments/${studentId}`,
};
