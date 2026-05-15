/*
  Warnings:

  - You are about to drop the column `room` on the `courses` table. All the data in the column will be lost.
  - Added the required column `location` to the `class_sessions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `language` on the `courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `level` on the `courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('English', 'Finnish', 'Swedish', 'Russian', 'German', 'French');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN     "location" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "room",
DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL,
DROP COLUMN "level",
ADD COLUMN     "level" "Level" NOT NULL;
