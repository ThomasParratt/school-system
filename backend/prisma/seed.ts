import bcrypt from "bcrypt";
import { Language, Level, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@school.local" },
    update: {},
    create: {
      firstName: "Thomas",
      secondName: "Parratt",
      email: "admin@school.local",
      password: hashedPassword,
      role: "admin",
    },
  });

  const instructors = [
    {
      firstName: "Sofia",
      secondName: "Laine",
      email: "sofia.laine@school.local",
    },
    {
      firstName: "Daniel",
      secondName: "Hughes",
      email: "daniel.hughes@school.local",
    },
    {
      firstName: "Aino",
      secondName: "Korhonen",
      email: "aino.korhonen@school.local",
    },
    {
      firstName: "Marcus",
      secondName: "Bennett",
      email: "marcus.bennett@school.local",
    },
    {
      firstName: "Elena",
      secondName: "Rossi",
      email: "elena.rossi@school.local",
    },
  ];

  for (const instructor of instructors) {
    await prisma.user.upsert({
      where: { email: instructor.email },
      update: {},
      create: {
        ...instructor,
        password: hashedPassword,
        role: "instructor",
      },
    });
  }

  const students = [
    ["Oliver", "Anderson"],
    ["Emma", "Berg"],
    ["Liam", "Carter"],
    ["Mia", "Davis"],
    ["Noah", "Eriksson"],
    ["Sofia", "Fischer"],
    ["Elias", "Gustafsson"],
    ["Isla", "Hansen"],
    ["Leo", "Ivanov"],
    ["Ella", "Johansson"],
    ["Oscar", "Koskinen"],
    ["Ava", "Lindberg"],
    ["Lucas", "Martin"],
    ["Amelia", "Nieminen"],
    ["Henry", "O'Connor"],
    ["Lily", "Pettersson"],
    ["Arthur", "Quinn"],
    ["Freya", "Rantanen"],
    ["William", "Schmidt"],
    ["Chloe", "Taylor"],
    ["James", "Usher"],
    ["Ella", "Virtanen"],
    ["Benjamin", "Wilson"],
    ["Grace", "Young"],
    ["Theodore", "Zimmerman"],
    ["Luca", "Adams"],
    ["Hanna", "Brown"],
    ["Mateo", "Collins"],
    ["Nora", "Dahl"],
    ["Samuel", "Evans"],
    ["Clara", "Franklin"],
    ["Finn", "Green"],
    ["Lucy", "Harris"],
    ["Alexander", "Ibrahim"],
    ["Evelyn", "Jones"],
    ["Sebastian", "Khan"],
    ["Ruby", "Larsson"],
    ["Daniel", "Miller"],
    ["Alice", "Nelson"],
    ["Michael", "Olsson"],
    ["Julia", "Parker"],
    ["David", "Reed"],
    ["Maya", "Svensson"],
    ["Joseph", "Thompson"],
    ["Anna", "Underwood"],
    ["Charles", "Vega"],
    ["Emily", "Walker"],
    ["George", "Xu"],
    ["Isabella", "Young"],
    ["Thomas", "Zetterberg"],
  ].map(([firstName, secondName], index) => ({
    firstName,
    secondName,
    email: `student${String(index + 1).padStart(2, "0")}@school.local`,
  }));

  for (const student of students) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        ...student,
        password: hashedPassword,
        role: "student",
      },
    });
  }

  const courses = [
    {
      title: "Finnish Foundations",
      language: Language.Finnish,
      level: Level.A1,
      material: "Everyday Finnish vocabulary, pronunciation, and basic conversation.",
      instructorEmail: "aino.korhonen@school.local",
    },
    {
      title: "English for Everyday Life",
      language: Language.English,
      level: Level.A2,
      material: "Practical English for travel, shopping, and social situations.",
      instructorEmail: "daniel.hughes@school.local",
    },
    {
      title: "Swedish Conversation",
      language: Language.Swedish,
      level: Level.B1,
      material: "Guided discussions and listening practice for confident Swedish communication.",
      instructorEmail: "sofia.laine@school.local",
    },
    {
      title: "German Grammar Workshop",
      language: Language.German,
      level: Level.B1,
      material: "Structured practice with German sentence patterns, cases, and verb forms.",
      instructorEmail: "marcus.bennett@school.local",
    },
    {
      title: "French in Context",
      language: Language.French,
      level: Level.A2,
      material: "French reading and speaking practice based on everyday scenarios.",
      instructorEmail: "elena.rossi@school.local",
    },
    {
      title: "Advanced English Writing",
      language: Language.English,
      level: Level.C1,
      material: "Academic and professional writing, editing, and presentation skills.",
      instructorEmail: "daniel.hughes@school.local",
    },
    {
      title: "Russian for Beginners",
      language: Language.Russian,
      level: Level.A1,
      material: "Introduction to Cyrillic, essential vocabulary, and basic Russian dialogue.",
      instructorEmail: "elena.rossi@school.local",
    },
    {
      title: "Finnish Intermediate Conversation",
      language: Language.Finnish,
      level: Level.B2,
      material: "Fluency-building conversations with Finnish culture and current topics.",
      instructorEmail: "aino.korhonen@school.local",
    },
    {
      title: "Swedish Reading and Discussion",
      language: Language.Swedish,
      level: Level.B2,
      material: "Short stories, news articles, and group discussions in Swedish.",
      instructorEmail: "sofia.laine@school.local",
    },
    {
      title: "German for Travel",
      language: Language.German,
      level: Level.A2,
      material: "Useful German phrases and cultural guidance for trips and everyday travel.",
      instructorEmail: "marcus.bennett@school.local",
    },
  ];

  for (const course of courses) {
    const instructor = await prisma.user.findUnique({
      where: { email: course.instructorEmail },
      select: { id: true },
    });

    if (!instructor) {
      throw new Error(`Instructor not found: ${course.instructorEmail}`);
    }

    const existingCourse = await prisma.course.findFirst({
      where: { title: course.title },
      select: { id: true },
    });

    if (!existingCourse) {
      await prisma.course.create({
        data: {
          title: course.title,
          language: course.language,
          level: course.level,
          material: course.material,
          instructorId: instructor.id,
        },
      });
    }
  }

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });