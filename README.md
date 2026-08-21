# School Management System

School Management System is a full-stack app for managing instructors, students, courses, and class sessions. It combines an Express + Prisma backend with a React + Vite frontend and supports role-based access for administrators, instructors, and students.

## What It Does

- Login with JWT authentication
- Administrator CRUD for users, courses, and class sessions
- Instructor dashboard with taught courses, enrolled students, lessons, and a weekly calendar
- Instructor editing of session location, content, and homework from the lessons list or calendar
- Enrollment management between students and courses
- Student dashboard for enrolled courses, lessons, and calendar events
- Swagger/OpenAPI docs served by the backend at `/docs`
- Bruno API collections in `backend/bruno/`

## Tech Stack

- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt
- Frontend: React, TypeScript, Vite, React Router
- Tooling: Docker Compose, Vitest, ESLint

## Project Structure

```text
school-system/
├── backend/
│   └── bruno/
├── frontend/
│   └── src/components/
│       ├── admin/
│       ├── instructor/
│       └── student/
├── docker-compose.yml
└── README.md
```

## Run With Docker

From the repository root:

```bash
docker compose up --build
```

This starts the following services:

- Frontend at `http://localhost:5173`
- Backend at `http://localhost:3000`
- Swagger UI at `http://localhost:3000/docs`
- PostgreSQL at `localhost:5432`
- Test PostgreSQL at `localhost:5433`

## Run Locally

### Backend

The backend expects a `DATABASE_URL` environment variable. `JWT_SECRET` is optional and defaults to `supersecretkey`.

```bash
cd backend
npm install
npm run dev
```

If you want to generate Prisma client code, apply migrations, seed the database, and then start the server, use:

```bash
npm run dev:docker
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Seeded Account

The backend seed script creates an administrator account:

- Email: `admin@school.local`
- Password: `password123`

## API Overview

Base URL: `http://localhost:3000`

### Authentication

- `POST /auth/login` - login and receive a JWT plus user data

### Users

- `GET /users` - list all users (admin only)
- `POST /users` - create a student user (admin only)
- `GET /users/me` - get the authenticated user's profile
- `GET /users/me/courses` - get the authenticated user's enrolled courses
- `GET /users/me/sessions` - get the authenticated user's sessions
- `GET /users/me/students` - list students enrolled in the instructor's courses (instructor only)
- `GET /users/:id` - get a user by ID (admin only)
- `PATCH /users/:id` - update a user (admin only)
- `DELETE /users/:id` - delete a user (admin only)
- `GET /users/:id/enrollments` - list enrollments for a user (admin only)

### Courses

- `GET /courses` - list all courses (admin only)
- `POST /courses` - create a course (admin only)
- `GET /courses/:id` - get a course by ID (admin only)
- `PATCH /courses/:id` - update a course (admin only)
- `DELETE /courses/:id` - delete a course (admin only)
- `POST /courses/:id/enroll` - enroll a student in a course (admin only)
- `DELETE /courses/:courseId/enrollments/:studentId` - remove an enrollment (admin only)
- `GET /courses/:id/sessions` - list sessions for a course
- `POST /courses/:id/sessions` - create a session for a course (admin only)

### Sessions

- `GET /sessions` - list all sessions (admin only)
- `GET /sessions/:id` - get a session by ID (authenticated users)
- `PATCH /sessions/:id` - update a session (admin or instructor)
- `DELETE /sessions/:id` - delete a session (admin only)

## Testing

Backend tests run with Vitest:

```bash
cd backend
npm test
```

## Notes

- The backend OpenAPI definition lives in `backend/openapi.yaml`.
- The frontend login screen routes users into the admin, instructor, or student dashboard based on their role.
- Docker Compose uses the `DATABASE_URL` and `JWT_SECRET` values defined for the backend service; override them with a root `.env` file when needed.


