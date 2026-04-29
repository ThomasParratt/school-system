# MVP Scope

## Goal

Deliver a usable first version of the school system centered on one instructor and student/class management.

## Roles

### Instructor

One instructor account is seeded in [backend/prisma/seed.ts](backend/prisma/seed.ts).

Instructor capabilities:

- View students
- Add students
- Update student information
- Delete students
- View all students' classes
- Add classes
- Update class information
- Delete classes

### Student

Student capabilities:

- View their own information
- View their own classes

## Dashboards

### Instructor Dashboard

- Student list
- Calendar

### Student Dashboard

- Calendar

## MVP API Surface

### Instructor

- `GET /students`
- `POST /students`
- `PATCH /students/:id`
- `DELETE /students/:id`
- `GET /classes`
- `POST /classes`
- `PATCH /classes/:id`
- `DELETE /classes/:id`

### Student

- `GET /me`
- `GET /me/classes`

## Criteria

- Seeded instructor can log in.
- Instructor can complete full CRUD for students.
- Instructor can complete full CRUD for classes.
- Student login only exposes their own profile and class schedule.
- Instructor and student see different dashboard views.

## MVP Schema

Prisma shape that fits the MVP scope:

```prisma
enum Role {
	instructor
	student
}

model User {
	id           Int          @id @default(autoincrement())
	firstName    String       @map("first_name")
	secondName   String       @map("second_name")
	email        String       @unique
	password     String
	role         Role         @default(student)
	createdAt    DateTime     @default(now()) @map("created_at")
	updatedAt    DateTime     @updatedAt @map("updated_at")

	taughtClasses Class[]     @relation("InstructorClasses")
	enrollments   Enrollment[]

	@@map("users")
}

model Class {
	id           Int          @id @default(autoincrement())
	title        String
	description  String?
	room         String?
	instructorId Int          @map("instructor_id")
	createdAt    DateTime     @default(now()) @map("created_at")
	updatedAt    DateTime     @updatedAt @map("updated_at")

	instructor   User         @relation("InstructorClasses", fields: [instructorId], references: [id], onDelete: Cascade)
	enrollments  Enrollment[]

	@@map("classes")
}

model Enrollment {
	id        Int      @id @default(autoincrement())
	userId    Int      @map("user_id")
	classId   Int      @map("class_id")
	createdAt DateTime @default(now()) @map("created_at")

	user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
	class Class @relation(fields: [classId], references: [id], onDelete: Cascade)

	@@unique([userId, classId])
	@@map("enrollments")
}
```