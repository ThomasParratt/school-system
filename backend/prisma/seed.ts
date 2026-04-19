import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "instructor@school.local" },
    update: {},
    create: {
      name: "Instructor",
      firstName: "Demo",
      secondName: "User",
      email: "instructor@school.local",
      password: hashedPassword,
      role: "instructor"
    }
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
