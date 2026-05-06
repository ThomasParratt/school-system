# School Management System (NEED TO UPDATE!)

## Current Project Status

This project currently provides a working authentication and user-management foundation using one backend API and a simple frontend login/dashboard flow.

Planned MVP scope is documented in [MVP.md](MVP.md).

## What Is Implemented Today

### Backend

- Express server running on port `3000`
- Prisma + PostgreSQL integration
- `User` model with roles (`instructor`, `student`)
- Password hashing with bcrypt
- JWT token generation on login
- JWT authentication middleware on protected user routes
- Instructor-only authorization for user creation and deletion
- Seed script that creates one instructor account

### Frontend

- React + TypeScript app running on port `5173`
- Login form
- Persisted login state in `localStorage`
- Home view after login:
  - list all users
  - add a new user via form (used as "Add Student" in UI)
  - logout

## Seeded Instructor Account

Created by [backend/prisma/seed.ts](backend/prisma/seed.ts).

- Email: `instructor@school.local`
- Password: `password123`

## Current API Endpoints

Base URL: `http://localhost:3000`

- `GET /users` - list users
- `POST /users` - create user, instructor only
- `POST /users/login` - login and receive JWT
- `DELETE /users/:id` - delete user, instructor only

## Known Gaps vs MVP

- No dedicated student/class resources yet
- No update/delete endpoints yet
- No role-based dashboard split yet (instructor vs student)
- No calendar/class scheduling features yet

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
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts
│       ├── lib/prisma.ts
│       └── routes/users.ts
├── frontend/
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── Login.tsx
│           └── Home.tsx
├── MVP.md
├── TO_DO.md
└── docker-compose.yml
```
