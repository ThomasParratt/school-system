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

## Suggested MVP API Surface

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

## Acceptance Criteria

- Seeded instructor can log in.
- Instructor can complete full CRUD for students.
- Instructor can complete full CRUD for classes.
- Student login only exposes their own profile and class schedule.
- Instructor and student see different dashboard views.