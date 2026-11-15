# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

Two separate npm projects, `backend/` (Express 5 + Prisma + PostgreSQL) and `frontend/` (React 19 + Vite + Tailwind 4), each with its own `package.json` and lockfile. The root `package.json` only holds repo tooling (Husky, commitlint, secretlint, lint-staged). Run `npm install` in all three.

## Commands

Full dev stack (frontend :5173, backend :3000, Swagger UI at :3000/docs, dev DB :5432, test DB :5433):
```bash
docker compose -f docker-compose.dev.yml up --build
```
The backend container migrates and seeds on start (`npm run dev:docker`); the seeded admin is `admin@school.local` / `password123`.

Backend (`cd backend`):
```bash
npm test                                             # all tests (vitest run)
npx vitest run tests/integration/courses/getCourse.test.ts   # one file
npx vitest run -t "should return requested course"   # one test by name
npm run build                                        # tsc
npx prisma migrate dev --name <name>                 # new migration after editing prisma/schema.prisma
```
Tests need the test database: `docker compose -f docker-compose.dev.yml up -d db_test`. They read `backend/.env.test`, and `tests/globalSetup.ts` runs `prisma migrate deploy` against it first.

Frontend (`cd frontend`):
```bash
npm run lint
npm run build      # tsc -b && vite build
npm run gen:api    # regenerate src/api/schema.d.ts from backend/openapi.yaml
```

Root: `npm run typecheck` (both apps), `npm test` (backend tests).

## Architecture

### `backend/openapi.yaml` is the contract, enforced at runtime
`src/app.ts` mounts `express-openapi-validator` (`src/lib/openapiValidation.ts`) before all routers. Every request is checked against the spec (bearer token, the operation's roles from `security: - bearerAuth: [admin]`, path params, query and body) before a route runs. A route missing from the spec answers 404. Consequences:
- **A new or changed endpoint must be added to `openapi.yaml` first**, including its roles.
- Routes don't re-validate shape. They only enforce rules the spec can't express, such as `endsAt` after `startsAt`, ownership checks, and DB lookups. `requireAuth`/`requireRole` in routes are a second check.
- Validator errors are mapped to the API's error shape `{ error: { message, code } }`. Use `errorResponse()` from `src/lib/validation.ts` for errors in routes. Success bodies are `{ data: ... }`.
- Integration tests assert `expect(response).toSatisfyApiSpec()` (jest-openapi, set up in `tests/setup.ts`), so responses must match the spec too.

### Frontend types are generated from the same spec
`frontend/src/api/schema.d.ts` is generated (`npm run gen:api`). Don't edit it by hand. After any `openapi.yaml` change, regenerate it and commit it, or CI fails. `frontend/src/types.ts` derives the app's types from it (`ApiResponse<"/courses", "get">`, `ApiRequest<...>`).

### List ordering
Every list endpoint must use an explicit order from `src/lib/order.ts` (`USER_ORDER`, `COURSE_ORDER`, `SESSION_ORDER`), or `byName`/`byStart` when combining rows in code. `tests/integration/ordering/listOrder.test.ts` covers this.

### Auth and roles
Roles are `admin`, `instructor` and `student` (Prisma `Role` enum, `AUTH_ROLES` in `src/lib/auth.ts`). The JWT payload is `{ id, role }` and expires after 1h. `JWT_SECRET` must be set or the backend won't start. The frontend keeps the token in `AuthContext`, and `components/Login.tsx` renders `AdminDash`, `InstructorDash` or `StudentDash` based on the role. Instructor- and student-facing endpoints are scoped to the caller, for example `/users/me/...`.

### Frontend → backend
Services in `frontend/src/services/` call `/api/...`. The Vite dev server proxies `/api` to `http://backend:3000` and strips the prefix, and `nginx.conf` does the same in production. Admin CRUD screens share `hooks/useCrud.ts` with `CrudList`/`CrudModal`.

### Tests
The backend tests are integration tests only: supertest against the exported `app` (`src/app.ts`; `src/index.ts` only calls listen). They run serially (`fileParallelism: false`) against the real test DB. Build data with `tests/integration/factories/*`, get tokens with `helpers/auth.ts` (`loginAsAdmin` etc.; factory users have the password `password`), and call `cleanupTestData()` in `afterEach`.

## Git hooks and CI

- pre-commit: secretlint on staged files, and ESLint (`--max-warnings 0`) on staged frontend files.
- commit-msg: Conventional Commits, e.g. `feat(courses): add enrolment limit`.
- pre-push: `npm run typecheck`, then the backend tests (the test DB must be running on :5433).
- CI (`.github/workflows/ci.yml`): the backend tests on Postgres 15, plus frontend checks (gen:api diff, lint, build). The EC2 deploy job is commented out.
