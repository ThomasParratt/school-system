import { prisma } from "../../../src/lib/prisma.js";

export async function cleanupTestData() {
  await prisma.enrollment.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}