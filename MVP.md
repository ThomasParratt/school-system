# MVP Scope

## Goal

Deliver a usable first version of the school system centered on one instructor and student/course management.

## Roles

### Instructor

One instructor account is seeded in [backend/prisma/seed.ts](backend/prisma/seed.ts).

Instructor capabilities:

- View students
- Add students
- Update student information
- Delete students
- View all students' courses and sessions
- Add courses
- Update course information
- Delete courses
- Add, update, and delete course sessions

### Student

Student capabilities:

- View their own information
- View their own courses and sessions

## Dashboards

### Instructor Dashboard

- Student list
- Course session calendar

### Student Dashboard

- Course session calendar

## MVP API Surface

### Instructor

- `GET /students`
- `POST /students`
- `PATCH /students/:id`
- `DELETE /students/:id`
- `GET /courses`
- `POST /courses`
- `PATCH /courses/:id`
- `DELETE /courses/:id`
- `GET /sessions`
- `POST /sessions`
- `PATCH /sessions/:id`
- `DELETE /sessions/:id`

### Student

- `GET /me`
- `GET /me/courses`
- `GET /me/sessions`

## Criteria

- Seeded instructor can log in.
- Instructor can complete full CRUD for students.
- Instructor can complete full CRUD for courses and sessions.
- Student login only exposes their own profile and course session schedule.
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
    level        String?
    comments     String?
	createdAt    DateTime     @default(now()) @map("created_at")
	updatedAt    DateTime     @updatedAt @map("updated_at")

	taughtCourses Course[]     @relation("InstructorCourses")
	enrollments   Enrollment[]

	@@map("users")
}

model Course {
	id           Int            @id @default(autoincrement())
	title        String
	language     String
    level        String
    material     String
	room         String?
	instructorId Int            @map("instructor_id")
	createdAt    DateTime       @default(now()) @map("created_at")
	updatedAt    DateTime       @updatedAt @map("updated_at")

	instructor   User           @relation("InstructorCourses", fields: [instructorId], references: [id], onDelete: Cascade)
	sessions     ClassSession[]
	enrollments  Enrollment[]

	@@map("courses")
}

model ClassSession {
	id        Int      @id @default(autoincrement())
	courseId  Int      @map("course_id")
	startsAt  DateTime @map("starts_at")
	endsAt    DateTime? @map("ends_at")
	content   String?
    homework  String?
	createdAt DateTime @default(now()) @map("created_at")

	course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

	@@map("class_sessions")
}

model Enrollment {
	id        Int      @id @default(autoincrement())
	userId    Int      @map("user_id")
	courseId  Int      @map("course_id")
	createdAt DateTime @default(now()) @map("created_at")

	user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
	course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

	@@unique([userId, courseId])
	@@map("enrollments")
}
```

## How The Schema Works

The schema uses one shared `User` table for both instructors and students. The `role` field is what tells the app how to treat each account.

`Course` stores the overall class offering that instructors manage. Each course belongs to exactly one instructor through `instructorId`, which points back to `User.id`. The `taughtCourses` relation on `User` lets Prisma load all courses owned by that instructor.

`ClassSession` stores the individual lessons on the calendar. Each session belongs to one course through `courseId`, so a course can have many sessions while each session belongs to only one course.

`Enrollment` is the link table between students and courses. It stores one row for each student-course pair, using `userId` and `courseId`. One student can join many courses, and one course can contain many students. The `@@unique([userId, courseId])` rule prevents duplicate enrollments.

In practice, the app uses these relations like this:

- Instructor CRUD works through `User` and `Course`.
- `GET /courses` can return courses with their instructor attached.
- `GET /me/courses` can find the current student’s enrollments and return their courses.
- `GET /me/sessions` can return the current student’s scheduled sessions.
- `GET /me` can read the logged-in user from `User` and show their profile.