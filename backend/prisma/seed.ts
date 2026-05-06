import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      firstName: "Thomas",
      secondName: "Parratt",
      email: "instructor@school.local",
      password: hashedPassword,
      role: "instructor",
    },
  });

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
