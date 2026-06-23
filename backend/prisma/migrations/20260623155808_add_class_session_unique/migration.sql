/*
  Warnings:

  - A unique constraint covering the columns `[course_id,starts_at]` on the table `class_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "class_sessions_course_id_starts_at_key" ON "class_sessions"("course_id", "starts_at");
