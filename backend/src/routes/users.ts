import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();
const SALT_ROUNDS = 10;

// GET /users
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        role: true,
        comments: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      data: users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch users",
        code: "FETCH_USERS_ERROR",
      },
    });
  }
});

// POST /users (admin creates user)
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { firstName, secondName, email, password, role, comments } = req.body;

      // Validation
      if (!firstName || !secondName || !email || !password ) {
        return res.status(400).json({
          error: {
            message: "Missing required fields",
            code: "VALIDATION_ERROR",
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await prisma.user.create({
        data: {
          firstName,
          secondName,
          email,
          password: hashedPassword,
          role: role,
          comments
        },
        select: {
          id: true,
          firstName: true,
          secondName: true,
          email: true,
          role: true,
          comments: true
        },
      });

      return res.status(201).json({
        data: user,
      });
    } catch (err: unknown) {
      console.error(err);

      // Optional: handle duplicate email nicely
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return res.status(409).json({
          error: {
            message: "Email already exists",
            code: "EMAIL_ALREADY_EXISTS",
          },
        });
      }

      return res.status(500).json({
        error: {
          message: "Failed to create user",
          code: "CREATE_USER_ERROR",
        },
      });
    }
  }
);

// GET /users/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user?.id ?? 0);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        role: true,
        comments: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch users",
        code: "FETCH_USERS_ERROR",
      },
    });
  }
});

// GET /users/me/courses
router.get("/me/courses", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user?.id ?? 0);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }
    // If the authenticated user is an instructor, return courses they teach
    if (req.user?.role === "instructor") {
      const taughtCourses = await prisma.course.findMany({
        where: { instructorId: userId },
        select: {
          id: true,
          title: true,
          language: true,
          level: true,
          material: true,
          instructor: {
            select: {
              id: true,
              firstName: true,
              secondName: true,
            },
          },
        },
      });

      return res.status(200).json({
        data: taughtCourses,
      });
    }

    // Otherwise return courses the user is enrolled in
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        enrollments: {
          select: {
            course: {
              select: {
                id: true,
                title: true,
                language: true,
                level: true,
                material: true,
                instructor: {
                  select: {
                    id: true,
                    firstName: true,
                    secondName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const courses = user?.enrollments.map(e => e.course) ?? [];

    return res.status(200).json({
      data: courses,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch courses",
        code: "FETCH_COURSES_ERROR",
      },
    });
  }
});

// GET /users/me/sessions
router.get("/me/sessions", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user?.id ?? 0);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }


    // If instructor, return sessions for courses they teach
    if (req.user?.role === "instructor") {
      const taughtCoursesWithSessions = await prisma.course.findMany({
        where: { instructorId: userId },
        select: {
          sessions: {
            select: {
              id: true,
              courseId: true,
              location: true,
              startsAt: true,
              endsAt: true,
              content: true,
              homework: true,
            },
          },
        },
      });

      const sessions = taughtCoursesWithSessions.flatMap(c => c.sessions);

      return res.status(200).json({
        data: sessions,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        enrollments: {
          select: {
            course: {
              select: {
                sessions: {
                  select: {
                    id: true,
                    courseId: true,
                    location: true,
                    startsAt: true,
                    endsAt: true,
                    content: true,
                    homework: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const sessions = user?.enrollments.flatMap(e => e.course.sessions) ?? [];

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

// GET /users/me/students (instructors only)
router.get("/me/students", requireAuth, requireRole("instructor"), async (req, res) => {
  try {
    const userId = Number(req.user?.id ?? 0);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        error: {
          message: "Invalid user ID",
          code: "INVALID_ID",
        },
      });
    }

    // Find enrollments for courses taught by this instructor
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: userId,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            firstName: true,
            secondName: true,
            email: true,
            role: true,
            comments: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Extract unique users
    const studentsById: Record<number, any> = {};
    for (const e of enrollments) {
      if (e.user && !studentsById[e.user.id]) {
        studentsById[e.user.id] = e.user;
      }
    }

    const students = Object.values(studentsById);

    return res.status(200).json({ data: students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch students",
        code: "FETCH_STUDENTS_ERROR",
      },
    });
  }
});

// GET /users/:id
router.get("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        role: true,
        comments: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        message: "Failed to fetch user",
        code: "FETCH_USER_ERROR",
      },
    });
  }
});

// PATCH /users/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }
      
      const { firstName, secondName, email, comments } = req.body;

      const updateData: {
        firstName?: string;
        secondName?: string;
        email?: string;
        comments?: string;
      } = {};

      if (firstName !== undefined) updateData.firstName = firstName;
      if (secondName !== undefined) updateData.secondName = secondName;
      if (email !== undefined) updateData.email = email;
      if (comments !== undefined) updateData.comments = comments;
    
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: {
            message: "No valid fields provided",
            code: "EMPTY_UPDATE",
          },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          secondName: true,
          email: true,
          role: true,
          comments: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        data: updatedUser,
      });
  } catch (err: unknown) {
      console.error(err);

      return res.status(500).json({
        error: {
          message:
            err instanceof Error
              ? err.message
              : "Unexpected server error",
          code: "SERVER_ERROR",
        },
      });
    }
  }
)


// DELETE /users/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          error: {
            message: "Invalid user ID",
            code: "INVALID_ID",
          },
        });
      }

      await prisma.user.delete({
        where: { id: userId },
      });

      return res.status(200).json({
        data: {
          message: "User deleted successfully",
        },
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: {
          message: "Failed to delete user",
          code: "DELETE_USER_ERROR",
        },
      });
    }
  }
);

// GET /users/:id/enrollments
router.get("/:id/enrollments", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        error: {
          message: "Invalid user ID",
          code: "INVALID_ID",
        },
      });
    }
    
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: userId },
      include: {
        course: true,
      },
    });
    return res.status(200).json({
      data: enrollments,
    });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: {
          message: "Failed to fetch enrollments",
          code: "FETCH_ENROLLMENTS_ERROR",
        },
      });
    }
  });


export default router;