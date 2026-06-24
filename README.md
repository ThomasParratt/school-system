# School Management System

School Management System is a full-stack app for managing instructors, students, courses, and class sessions. It combines an Express + Prisma backend with a React + Vite frontend and supports role-based access for instructors and students.

## What It Does

- Login with JWT authentication
- Instructor CRUD for users, courses, and class sessions
- Enrollment management between students and courses
- Student dashboard for enrolled courses and lessons
- Swagger/OpenAPI docs served by the backend at `/docs`
- Bruno API collections in `bruno/`

## Tech Stack

- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt
- Frontend: React, TypeScript, Vite, React Router
- Tooling: Docker Compose, Vitest, ESLint

## Project Structure

```text
school-system/
├── backend/
├── frontend/
├── bruno/
├── docker-compose.yml
├── README.md
└── TO_DO.md
```

## Run With Docker

From the repository root:

```bash
docker compose up --build
```

This starts:

- Frontend at `http://localhost:5173`
- Backend at `http://localhost:3000`
- Swagger UI at `http://localhost:3000/docs`
- PostgreSQL at `localhost:5432`

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

The backend seed script creates an instructor account:

- Email: `instructor@school.local`
- Password: `password123`

## API Overview

Base URL: `http://localhost:3000`

### Authentication

- `POST /auth/login` - login and receive a JWT plus user data

### Users

- `GET /users` - list all users (instructor only)
- `POST /users` - create a student user (instructor only)
- `GET /users/me` - get the authenticated user's profile
- `GET /users/me/courses` - get the authenticated user's enrolled courses
- `GET /users/me/sessions` - get the authenticated user's sessions
- `GET /users/:id` - get a user by ID (instructor only)
- `PATCH /users/:id` - update a user (instructor only)
- `DELETE /users/:id` - delete a user (instructor only)
- `GET /users/:id/enrollments` - list enrollments for a user (instructor only)

### Courses

- `GET /courses` - list all courses (instructor only)
- `POST /courses` - create a course (instructor only)
- `GET /courses/:id` - get a course by ID (instructor only)
- `PATCH /courses/:id` - update a course (instructor only)
- `DELETE /courses/:id` - delete a course (instructor only)
- `POST /courses/:id/enroll` - enroll a student in a course (instructor only)
- `DELETE /courses/:courseId/enrollments/:studentId` - remove an enrollment (instructor only)
- `GET /courses/:id/sessions` - list sessions for a course
- `POST /courses/:id/sessions` - create a session for a course (instructor only)

### Sessions

- `GET /sessions/:id` - get a session by ID (instructor only)
- `PATCH /sessions/:id` - update a session (instructor only)
- `DELETE /sessions/:id` - delete a session (instructor only)

## Testing

Backend tests run with Vitest:

```bash
cd backend
npm test
```

## Notes

- The backend OpenAPI definition lives in `backend/openapi.yaml`.
- The frontend login screen routes users into the instructor or student dashboard based on their role.


