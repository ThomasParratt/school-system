# School Management System

## Current Project Status

This project implements a school management system with instructor and student roles. Instructors can manage students, courses, and class sessions, while students can view their own information and enrolled courses. The MVP scope is documented in [MVP.md](MVP.md).

## What Is Implemented Today

### Backend

- Express server running on port `3000`
- Prisma + PostgreSQL integration
- Database models:
  - `User` with roles (`instructor`, `student`) and fields: firstName, secondName, email, password, role, comments
  - `Course` with language level, material, and instructor relationship
  - `ClassSession` with location, start/end times, content, and homework
  - `Enrollment` for student-course relationships
- Password hashing with bcrypt
- JWT token generation on login
- JWT authentication middleware on protected routes
- Role-based authorization (instructor-only operations)
- Full CRUD operations for users, courses, and class sessions
- Student enrollment management
- Seed script that creates one instructor account

### Frontend

- React + TypeScript app running on port `5173`
- Login form with persistent state in `localStorage`
- Home view after login:
  - List all users (instructor only)
  - Add a new user via form (instructor only)
  - Logout

## Seeded Instructor Account

Created by [backend/prisma/seed.ts](backend/prisma/seed.ts).

- Email: `instructor@school.local`
- Password: `password123`

## Current API Endpoints

Base URL: `http://localhost:3000`

### Authentication
- `POST /auth/login` - login and receive JWT

### Users
- `GET /users` - list all users (instructor only)
- `POST /users` - create user (instructor only)
- `GET /users/me` - get authenticated user's info
- `GET /users/:id` - get user by ID (instructor only)
- `PATCH /users/:id` - update user (instructor only)
- `DELETE /users/:id` - delete user (instructor only)
- `GET /users/me/courses` - get authenticated student's enrolled courses
- `GET /users/me/sessions` - get authenticated student's sessions

### Courses
- `GET /courses` - list all courses (instructor only)
- `POST /courses` - create course (instructor only)
- `GET /courses/:id` - get course by ID (instructor only)
- `PATCH /courses/:id` - update course (instructor only)
- `DELETE /courses/:id` - delete course (instructor only)
- `POST /courses/:id/enroll` - enroll student in course (instructor only)

### Class Sessions
- `GET /sessions` - list all sessions (instructor only)
- `POST /courses/:id/sessions` - create session for course (instructor only)
- `GET /sessions/:id` - get session by ID (instructor only)
- `PATCH /sessions/:id` - update session (instructor only)
- `DELETE /sessions/:id` - delete session (instructor only)
- `GET /courses/:id/sessions` - get all sessions for a course

## Known Gaps vs MVP

- Frontend instructor dashboard not yet implemented (student list, course management UI)
- Frontend student dashboard not yet implemented (calendar view)
- No calendar/scheduling UI yet
- No enrollment status tracking beyond basic student-course relationship
- Limited error handling and validation on frontend

See [MVP.md](MVP.md) for the target feature set.

## Tech Stack

- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt
- Frontend: React, TypeScript, Vite
- Dev/runtime: Docker Compose

## Run Locally (Docker)

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Postgres: `localhost:5432`

## Repository Structure

```text
school-system/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   └── prisma.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   └── routes/
│   │       ├── authRoutes.ts
│   │       ├── users.ts
│   │       ├── courses.ts
│   │       └── sessions.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── Dockerfile
│   ├── openapi.yaml
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Login.tsx
│   │       └── Home.tsx
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── package.json
│   └── index.html
├── bruno/
│   └── [API testing collection with endpoint definitions]
├── MVP.md
├── TO_DO.md
├── README.md
└── docker-compose.yml
```
