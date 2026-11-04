# School Management System (MVP)

This is a full-stack enterprise web application designed to simplify how a school manages its courses, class sessions, and student enrollments. The project was inspired by direct feedback from students and staff at a local language school to fix real administrative headaches. 

The platform supports strict role-based access control (RBAC) with completely separate dashboards and permissions for Administrators, Instructors, and Students.


---

## 🛠️ The Tech Stack

* **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS
* **Backend:** Node.js, Express, Prisma ORM
* **Database:** PostgreSQL (with a separate PostgreSQL instance for isolated testing)
* **Shared packages:** `@school/contracts` (zod schemas of the API) and `@school/domain` (pure business rules), in a pnpm workspace
* **DevOps & Tooling:** pnpm, Docker, Docker Compose, GitHub Actions, Vitest, OpenAPI/Swagger

---

## 🚦 Key Features & Roles

### 1. Authentication
* Users log in via a secure screen using JWT. The frontend parses the token and automatically routes the user to the correct dashboard based on their role (Admin, Instructor, or Student).

### 2. Administrator Dashboard
* Full CRUD operations for managing users, creating courses, and scheduling class sessions.
* Handles student-to-course enrollments via database join tables.

### 3. Instructor Dashboard
* A personal dashboard featuring a weekly calendar of their taught courses, lessons, and assigned students.
* Instructors can click on any calendar session to edit the location, lesson content, or homework payloads without needing admin permissions.

### 4. Student Dashboard
* A read-only interface displaying enrolled courses, upcoming lessons, and homework tasks in a clean chronological timeline.

---

## 📦 Project Structure

```text
school-system/
├── backend/
│   ├── bruno/                 # Bruno collections for testing API endpoints
│   ├── prisma/                # Database schema and seed scripts
│   ├── openapi.base.yaml      # OpenAPI of the routes not yet moved onto the contracts
│   └── src/                   # Express routes, controllers, and middleware
├── frontend/
│   └── src/
│       └── components/        # Separate UI folders for Admin, Instructor, and Student
├── packages/
│   ├── contracts/             # @school/contracts: zod schemas, inferred types, route paths, OpenAPI
│   └── domain/                # @school/domain: business rules as pure functions (no DB, no HTTP)
├── pnpm-workspace.yaml        # The workspace: backend, frontend, packages/*
├── docker-compose.dev.yml     # Docker setup for local development
├── docker-compose.prod.yml    # Hardened Docker setup for production
└── README.md
```

### Contracts and domain

* **`packages/contracts`** holds the API's shapes as zod schemas: request bodies, path
  params and responses. The backend validates input with them and types its answers
  with them, and the frontend imports the same types and route paths, so the two
  cannot drift apart.
* **The OpenAPI document is built from them.** `backend/src/lib/openapi.ts` merges the
  paths the contracts generate into `backend/openapi.base.yaml` (the routes not moved
  yet). `/docs` and the tests' `toSatisfyApiSpec()` use the merged document. A path or
  schema defined in both places stops the backend at startup.
* **`packages/domain`** holds the business rules as pure functions with table-driven
  tests (for example: only an instructor teaches a course, only a student enrolls).
* **Moved so far:** courses and their enrollments. Users, sessions and auth still use
  the hand-written yaml and `src/lib/validation.ts`. Each one moves in its own PR.
* In development, tests and the frontend build, the packages are read from their
  TypeScript source (the `source` export condition), so there is nothing to rebuild.
  Only the backend's production build uses their compiled `dist/`.

---

## 🚀 How to Run the App Locally

### 1. Environment Files
Before running the project, create a `.env` file in the repository root. Docker Compose reads these values when it starts the PostgreSQL containers and backend:

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace-with-a-local-password
POSTGRES_DB=app
JWT_SECRET=replace-with-a-long-random-secret
```


### 2. Install (for running tests and checks outside Docker)

The repository is a pnpm workspace and needs Node 22 or newer. From the repository root:

```bash
pnpm install
```

### 3. Run with Docker Compose
To build the images and spin up the frontend, backend, and databases all at once, run:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This will automatically initialize the following local URLs:
* **Frontend client:** `http://localhost:5173`
* **Backend API engine:** `http://localhost:3000`
* **Swagger/OpenAPI UI:** `http://localhost:3000/docs`
* **Main PostgreSQL Database:** `localhost:5432`
* **Test PostgreSQL Database:** `localhost:5433`

To stop the containers and shut down the network safely, run:
```bash
docker compose -f docker-compose.dev.yml down
```

### 4. Log in as the Seeded Administrator

The development setup seeds an administrator account when the backend starts. For local development, open the frontend at [http://localhost:5173](http://localhost:5173) and use:

| Field | Value |
| --- | --- |
| Email | `admin@school.local` |
| Password | `password123` |

After logging in, the administrator dashboard provides access to user, course,
session, and enrollment management.

### 5. Simulating Production
To run the production-optimized build as a background process, run:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 🛡️ Testing & CI/CD Pipeline

### Automated Backend Tests
Backend unit and integration tests are written using **Vitest**. To keep your development data safe from pollution, the test suite automatically directs its queries to a completely separate test database running on port `5433`.

To run the tests manually (the test database on port `5433` must be up), from the repository root:
```bash
pnpm --filter backend test
```

The contracts and domain tests need no database:
```bash
pnpm run check   # lint, build every workspace, test the packages
```

### GitHub Actions (CI)
The workflow script inside `.github/workflows/ci.yml` runs automatically on every pull request and push to the `main` branch. It runs three jobs: the backend tests against an isolated PostgreSQL 15 (after generating the Prisma client and type-checking), the frontend lint and build, and the contracts and domain packages' build and tests.

---

## ☁️ AWS Production Deployment (Paused)

The AWS EC2 instance is currently stopped, and the deployment job in
`.github/workflows/ci.yml` is commented out. GitHub Actions currently runs
the backend tests and frontend checks only; pushes to `main` do not deploy the
application automatically.

The production Docker configuration remains available for when the instance is
started and deployment is re-enabled.


## 🗺️ Future Roadmap

Now that the core MVP architecture is fully operational, I am actively working on the following iterations to make the platform production-hardened and scalable:

### 🔒 Security & Authentication Upgrades
- [ ] **Secure Token Storage:** Migrate JWT storage away from localStorage to HttpOnly, SameSite cookies to mitigate Cross-Site Scripting (XSS) vulnerability vectors.
- [ ] **Credentials Lifecycle:** Implement a mandatory first-login password change flow and a secure password-reset mechanism.

### 📈 Scalability & Performance
- [ ] **Data Pagination & Search:** Implement cursor or offset pagination alongside query search filters for the `/users`, `/courses`, and `/sessions` administrative grids to prevent bottleneck queries as the database scales.
- [ ] **Code Cleanup:** Conduct a full optimization sweep to strip duplicate middleware definitions (e.g., `express.json()`) and remove stray debugging `console.log` statements from production execution paths.

### 🛡️ Enhanced Test Coverage & DevOps Resilience
- [x] **Infrastructure Health Monitoring:** Integrate declarative `healthcheck` keys into the production `docker-compose.prod.yml` services to track container health natively.
- [ ] **Targeted Backend Testing:** Expand the Vitest testing suite to include explicit edge-case tests proving strict instructor data ownership boundaries and uniform invalid-input exception behaviors.
