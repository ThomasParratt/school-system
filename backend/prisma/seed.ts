import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

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