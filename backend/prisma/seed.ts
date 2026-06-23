import bcrypt from "bcrypt";
import { PrismaClient, Role, Language, Level } from "@prisma/client";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  const password = await bcrypt.hash("password123", SALT_ROUNDS);

  // -------------------------
  // INSTRUCTORS
  // -------------------------
  const instructors = await Promise.all([
    prisma.user.upsert({
      where: { email: "thomas.parratt@school.local" },
      update: {},
      create: {
        firstName: "Thomas",
        secondName: "Parratt",
        email: "thomas.parratt@school.local",
        password,
        role: Role.instructor,
      },
    }),
  ]);

  // -------------------------
  // STUDENTS
  // -------------------------
  const students = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      prisma.user.upsert({
        where: { email: `student${i + 1}@school.local` },
        update: {},
        create: {
          firstName: `Student${i + 1}`,
          secondName: "User",
          email: `student${i + 1}@school.local`,
          password,
          role: Role.student,
        },
      })
    )
  );

  // -------------------------
  // COURSES (REALISTIC STRUCTURE)
  // Language ladder per level
  // -------------------------
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { id: 1001 },
      update: {},
      create: {
        title: "English A1 Basics",
        language: Language.English,
        level: Level.A1,
        material: "Basic vocabulary, greetings, present tense",
        instructorId: instructors[0].id,
      },
    }),
    prisma.course.upsert({
      where: { id: 1002 },
      update: {},
      create: {
        title: "English B1 Communication",
        language: Language.English,
        level: Level.B1,
        material: "Everyday communication, past/future tenses",
        instructorId: instructors[0].id,
      },
    }),
    prisma.course.upsert({
      where: { id: 1003 },
      update: {},
      create: {
        title: "Finnish A1 Survival Finnish",
        language: Language.Finnish,
        level: Level.A1,
        material: "Basic phrases, pronunciation, simple grammar",
        instructorId: instructors[0].id,
      },
    }),
    prisma.course.upsert({
      where: { id: 1004 },
      update: {},
      create: {
        title: "Finnish B2 Conversation",
        language: Language.Finnish,
        level: Level.B2,
        material: "Fluent conversation, idioms, real-world usage",
        instructorId: instructors[0].id,
      },
    }),
  ]);

  // -------------------------
  // CLASS SESSIONS (WEEKLY STRUCTURE)
  // Each course: 4 sessions (like a real module)
  // -------------------------
  const baseDates = [
    "2026-09-01T10:00:00Z",
    "2026-09-08T10:00:00Z",
    "2026-09-15T10:00:00Z",
    "2026-09-22T10:00:00Z",
  ];

  for (const course of courses) {
    await prisma.classSession.createMany({
      data: baseDates.map((date, index) => ({
        courseId: course.id,
        location: index % 2 === 0 ? "Room 101" : "Room 202",
        startsAt: new Date(date),
        endsAt: new Date(new Date(date).getTime() + 90 * 60000),
        content: `Week ${index + 1} lesson for ${course.title}`,
        homework: `Homework ${index + 1}: practice exercises`,
      })),
      skipDuplicates: true,
    });
  }

  // -------------------------
  // ENROLLMENTS (REALISTIC MIX)
  // Students distributed across courses
  // -------------------------
  const enrollmentPairs = [
    [0, 0], [1, 0], [2, 0], // English A1
    [3, 1], [4, 1],         // English B1
    [5, 2], [6, 2],         // Finnish A1
    [1, 2], [7, 3], [2, 3], // Finnish B2 mixed level students
  ];

  for (const [studentIndex, courseIndex] of enrollmentPairs) {
    const student = students[studentIndex];
    const course = courses[courseIndex];

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId: student.id,
        courseId: course.id,
      },
    });
  }

  console.log("🌱 Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });