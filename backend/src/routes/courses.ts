import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  COURSE_ERROR_CODES,
  COURSE_ROUTES,
  CourseIdParamsSchema,
  CreateCourseBodySchema,
  EnrollBodySchema,
  EnrollmentParamsSchema,
  idParam,
  INVALID_ID,
  UpdateCourseBodySchema,
  type CourseEnrollmentsResponse,
  type CourseResponse,
  type CoursesResponse,
  type EnrollmentResponse,
  type MessageResponse,
} from "@school/contracts";
import { canTeach, enrollmentDecision } from "@school/domain";
import {
  COURSE_ENROLLMENT_SELECT,
  COURSE_SELECT,
  ENROLLMENT_SELECT,
  toCourse,
  toCourseEnrollment,
  toEnrollment,
} from "../lib/courses.js";
import {
  errorResponse,
  isPrismaError,
  nonEmptyString,
  positiveIntegerParam,
  validDateTime,
} from "../lib/validation.js";

const router = Router();

const INVALID_COURSE_ID = "Invalid course ID";

/** Is this user an instructor who can be given a course? */
async function isInstructor(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user !== null && canTeach(user.role);
}

// GET /courses
router.get(COURSE_ROUTES.list, requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({ select: COURSE_SELECT });
    return res.status(200).json({ data: courses.map(toCourse) } satisfies CoursesResponse);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Failed to fetch courses", COURSE_ERROR_CODES.fetchCourses);
  }
});

// POST /courses
router.post(COURSE_ROUTES.list, requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const body = CreateCourseBodySchema.safeParse(req.body);
    if (!body.success) return errorResponse(res, 400, "Missing or invalid required fields");

    const { instructorId, ...fields } = body.data;
    if (!(await isInstructor(instructorId))) {
      return errorResponse(res, 404, "Instructor not found", COURSE_ERROR_CODES.instructorNotFound);
    }

    const course = await prisma.course.create({
      data: { ...fields, instructor: { connect: { id: instructorId } } },
      select: COURSE_SELECT,
    });
    return res.status(201).json({ data: toCourse(course) } satisfies CourseResponse);
  } catch (err) {
    console.error(err);
    if (isPrismaError(err, "P2025")) {
      return errorResponse(res, 404, "Instructor not found", COURSE_ERROR_CODES.instructorNotFound);
    }
    return errorResponse(res, 500, "Failed to create course", COURSE_ERROR_CODES.createCourse);
  }
});

// GET /courses/:id
router.get(COURSE_ROUTES.course, requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const params = CourseIdParamsSchema.safeParse(req.params);
    if (!params.success) return errorResponse(res, 400, INVALID_COURSE_ID, INVALID_ID);

    const course = await prisma.course.findUnique({
      where: { id: params.data.id },
      select: COURSE_SELECT,
    });
    if (!course) return errorResponse(res, 404, "Course not found", COURSE_ERROR_CODES.courseNotFound);
    return res.status(200).json({ data: toCourse(course) } satisfies CourseResponse);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Failed to fetch course", COURSE_ERROR_CODES.fetchCourse);
  }
});

// PATCH /courses/:id
router.patch(COURSE_ROUTES.course, requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const params = CourseIdParamsSchema.safeParse(req.params);
    if (!params.success) return errorResponse(res, 400, INVALID_COURSE_ID, INVALID_ID);

    const body = UpdateCourseBodySchema.safeParse(req.body);
    if (!body.success) return errorResponse(res, 400, "Invalid course fields");

    const { instructorId, title, language, level, material } = body.data;
    const fields = {
      ...(title !== undefined && { title }),
      ...(language !== undefined && { language }),
      ...(level !== undefined && { level }),
      ...(material !== undefined && { material }),
    };
    if (Object.keys(fields).length === 0 && instructorId === undefined) {
      return errorResponse(res, 400, "No valid fields provided", COURSE_ERROR_CODES.emptyUpdate);
    }
    if (instructorId !== undefined && !(await isInstructor(instructorId))) {
      return errorResponse(res, 404, "Instructor not found", COURSE_ERROR_CODES.instructorNotFound);
    }

    const course = await prisma.course.update({
      where: { id: params.data.id },
      data: {
        ...fields,
        ...(instructorId !== undefined && { instructor: { connect: { id: instructorId } } }),
      },
      select: COURSE_SELECT,
    });
    return res.status(200).json({ data: toCourse(course) } satisfies CourseResponse);
  } catch (err) {
    console.error(err);
    if (isPrismaError(err, "P2025")) {
      return errorResponse(res, 404, "Course or instructor not found", COURSE_ERROR_CODES.notFound);
    }
    return errorResponse(res, 500, "Failed to update course", COURSE_ERROR_CODES.updateCourse);
  }
});

// DELETE /courses/:id
router.delete(COURSE_ROUTES.course, requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const params = CourseIdParamsSchema.safeParse(req.params);
    if (!params.success) return errorResponse(res, 400, INVALID_COURSE_ID, INVALID_ID);

    await prisma.course.delete({ where: { id: params.data.id } });
    return res
      .status(200)
      .json({ data: { message: "Course deleted successfully" } } satisfies MessageResponse);
  } catch (err) {
    console.error(err);
    if (isPrismaError(err, "P2025")) {
      return errorResponse(res, 404, "Course not found", COURSE_ERROR_CODES.courseNotFound);
    }
    return errorResponse(res, 500, "Failed to delete course", COURSE_ERROR_CODES.deleteCourse);
  }
});

// GET /courses/:id/enrollments
router.get(COURSE_ROUTES.enrollments, requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const params = CourseIdParamsSchema.safeParse(req.params);
    if (!params.success) return errorResponse(res, 400, INVALID_COURSE_ID, INVALID_ID);

    const course = await prisma.course.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });
    if (!course) return errorResponse(res, 404, "Course not found", COURSE_ERROR_CODES.courseNotFound);

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      select: COURSE_ENROLLMENT_SELECT,
    });
    return res
      .status(200)
      .json({ data: enrollments.map(toCourseEnrollment) } satisfies CourseEnrollmentsResponse);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Failed to fetch enrollments", COURSE_ERROR_CODES.fetchEnrollments);
  }
});

// POST /courses/:id/enroll
router.post(COURSE_ROUTES.enroll, requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const params = CourseIdParamsSchema.safeParse(req.params);
    if (!params.success) return errorResponse(res, 400, INVALID_COURSE_ID, INVALID_ID);

    const body = EnrollBodySchema.safeParse(req.body);
    if (!body.success) return errorResponse(res, 400, "Invalid user ID", INVALID_ID);

    const courseId = params.data.id;
    const { userId } = body.data;
    const [course, user] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } }),
    ]);
    if (!course) return errorResponse(res, 404, "Course not found", COURSE_ERROR_CODES.courseNotFound);
    if (!user) return errorResponse(res, 404, "User not found", COURSE_ERROR_CODES.userNotFound);
    if (!enrollmentDecision(user.role).allowed) {
      return errorResponse(res, 400, "Only students can enroll", COURSE_ERROR_CODES.notAStudent);
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      select: ENROLLMENT_SELECT,
    });
    return res.status(201).json({ data: toEnrollment(enrollment) } satisfies EnrollmentResponse);
  } catch (err) {
    console.error(err);
    if (isPrismaError(err, "P2002")) {
      return errorResponse(
        res,
        409,
        "Student is already enrolled in this course",
        COURSE_ERROR_CODES.enrollmentExists,
      );
    }
    return errorResponse(res, 500, "Failed to create enrollment", COURSE_ERROR_CODES.createEnrollment);
  }
});

// DELETE /courses/:courseId/enrollments/:studentId
router.delete(COURSE_ROUTES.enrollment, requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const params = EnrollmentParamsSchema.safeParse(req.params);
    if (!params.success) {
      const courseIdValid = idParam().safeParse(req.params.courseId).success;
      return errorResponse(res, 400, courseIdValid ? "Invalid user ID" : INVALID_COURSE_ID, INVALID_ID);
    }

    const { courseId, studentId } = params.data;
    await prisma.enrollment.delete({
      where: { userId_courseId: { userId: studentId, courseId } },
    });
    return res
      .status(200)
      .json({ data: { message: "Enrollment deleted successfully" } } satisfies MessageResponse);
  } catch (err) {
    if (isPrismaError(err, "P2025")) {
      return errorResponse(res, 404, "Enrollment not found", COURSE_ERROR_CODES.enrollmentNotFound);
    }
    console.error(err);
    return errorResponse(res, 500, "Failed to delete enrollment", COURSE_ERROR_CODES.deleteEnrollment);
  }
});

// The two session routes below belong to the sessions feature and move onto
// the contracts with it; they are unchanged here.

// GET /courses/:id/sessions
router.get("/:id/sessions", requireAuth, async (req, res) => {
  try {
    const courseId = positiveIntegerParam(req.params.id);

    if (!courseId) {
      return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
      }
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
      
      const sessions = await prisma.classSession.findMany({
      where: { courseId: courseId },
      select: {
        id: true,
        courseId: true,
        location: true,
        startsAt: true,
        endsAt: true,
        content: true,
        homework: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      data: sessions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch sessions",
        code: "FETCH_SESSIONS_ERROR",
      },
    });
  }
});

// POST /courses/:id/sessions
router.post(
  "/:id/sessions",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const courseId = positiveIntegerParam(req.params.id);

      if (!courseId) {
        return errorResponse(res, 400, "Invalid course ID", "INVALID_ID");
      }

      const { location, startsAt, endsAt, content, homework } = req.body;

      // Validation
      if (!nonEmptyString(location) || !validDateTime(startsAt) ||
          (endsAt !== undefined && endsAt !== null && !validDateTime(endsAt))) {
        return errorResponse(res, 400, "Invalid session fields");
      }
      if (endsAt !== undefined && endsAt !== null && Date.parse(endsAt) <= Date.parse(startsAt)) {
        return errorResponse(res, 400, "endsAt must be after startsAt");
      }
      if ((content !== undefined && content !== null && !nonEmptyString(content)) ||
          (homework !== undefined && homework !== null && !nonEmptyString(homework))) {
        return errorResponse(res, 400, "Invalid session fields");
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");

      const session = await prisma.classSession.create({
        data: {
          courseId,
          location,
          startsAt,
          endsAt: endsAt ?? null,
          content: content ?? null,
          homework: homework ?? null,
        },
        select: {
          id: true,
          courseId: true,
          location: true,
          startsAt: true,
          endsAt: true,
          content: true,
          homework: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        data: session,
      });
    } catch (err: unknown) {
      console.error(err);

      if (isPrismaError(err, "P2002")) {
        return errorResponse(res, 409, "A session already exists at this start time", "SESSION_EXISTS");
      }
      if (isPrismaError(err, "P2025")) {
        return errorResponse(res, 404, "Course not found", "COURSE_NOT_FOUND");
      }
      return res.status(500).json({
        error: {
          message: "Failed to create session",
          code: "CREATE_SESSION_ERROR",
        },
      });
    }
  }
);


export default router;
