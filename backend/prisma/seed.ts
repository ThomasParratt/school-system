import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "demo.user@school.local" },
    update: {},
    create: {
      name: "Demo User",
      firstName: "Demo",
      secondName: "User",
      email: "demo.user@school.local",
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
