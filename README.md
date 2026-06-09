# School Management System

School Management System is a full-stack app for managing instructors, students, courses, and class sessions. The MVP scope is documented in [MVP.md](MVP.md).

## Current State

### Backend

- Express API on port `3000`
- Prisma + PostgreSQL persistence
- JWT authentication and role-based authorization
- CRUD for users, courses, and class sessions
- Student enrollment and unenrollment flows
- Authenticated student views for enrolled courses and sessions
- Seed script that creates an instructor account

### Frontend

- React + TypeScript + Vite app on port `5173`
- Login flow with session persistence in `localStorage`
- Instructor dashboard with students, courses, and calendar panels
- CRUD actions for students and courses in the dashboard
- Student view is currently a simple placeholder after login

## Seeded Instructor Account

Created by [backend/prisma/seed.ts](backend/prisma/seed.ts).

- Email: `instructor@school.local`
- Password: `password123`

## API Overview

Base URL: `http://localhost:3000`

### Authentication

- `POST /auth/login` - login and receive a JWT

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

## Tech Stack

- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt
- Frontend: React, TypeScript, Vite
- Dev/runtime: Docker Compose

## Run Locally

### Docker

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Postgres: `localhost:5432`

### Local development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Repository Structure

```text
school-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── types/
│   ├── openapi.yaml
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── types.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── bruno/
├── MVP.md
├── TO_DO.md
├── README.md
└── docker-compose.yml
```

## Notes

- The instructor dashboard is implemented in [frontend/src/components/InstructorDash.tsx](frontend/src/components/InstructorDash.tsx).
- Students and courses are managed through [frontend/src/components/Students.tsx](frontend/src/components/Students.tsx) and [frontend/src/components/Courses.tsx](frontend/src/components/Courses.tsx).
- The calendar panel is currently a placeholder in [frontend/src/components/Calendar.tsx](frontend/src/components/Calendar.tsx).

See [MVP.md](MVP.md) for the target feature set.
