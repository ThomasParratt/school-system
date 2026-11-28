<p align="center">
  <img src="frontend/public/favicon.svg" alt="Classdesk logo" width="96">
</p>

<h1 align="center">Classdesk (MVP)</h1>

Classdesk is a full-stack enterprise web application designed to simplify how a school manages its courses, class sessions, and student enrollments. The project was inspired by direct feedback from students and staff at a local language school to fix real administrative headaches. 

The platform supports strict role-based access control (RBAC) with completely separate dashboards and permissions for Administrators, Instructors, and Students.


---

## 🛠️ The Tech Stack

* **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS
* **Backend:** Node.js, Express, Prisma ORM
* **Database:** PostgreSQL (with a separate PostgreSQL instance for isolated testing)
* **DevOps & Tooling:** Docker, Docker Compose, GitHub Actions, Vitest, OpenAPI/Swagger

---

## 🚦 Key Features & Roles

### 1. Authentication
* Users log in with email and password and receive a JWT (valid for 1 hour). The login response includes the user's role, and the frontend shows the matching dashboard (Admin, Instructor, or Student).
* **First-login password change:** an administrator sets the password when creating an account, so the new user must choose their own the first time they log in. Until they do, the API refuses every request except `POST /users/me/password` (403 `PASSWORD_CHANGE_REQUIRED`), and the frontend shows a change-password screen instead of the dashboard.

### 2. Administrator Dashboard
* Full CRUD operations for managing users, creating courses, and scheduling class sessions.
* Handles student-to-course enrollments via database join tables.
* Tabs for the overview, each list and the calendar. The open tab is kept in the URL (`?tab=students`), so a refresh or the back button keeps it.
* The user, course and session lists are paginated and searchable, and sessions can be filtered by date range.

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
│   ├── prisma/                # Database schema, migrations and seed script
│   ├── src/                   # Express app: routes, middleware and shared lib code
│   ├── tests/                 # Vitest integration tests (run against the test database)
│   └── openapi.yaml           # API contract, validated on every request
├── frontend/
│   └── src/
│       ├── api/               # Types generated from backend/openapi.yaml
│       ├── components/        # Separate UI folders for Admin, Instructor, and Student
│       └── services/          # API calls to the backend
├── infra/                     # Infrastructure (Terraform) for the AWS deployment
├── docker-compose.dev.yml     # Docker setup for local development
├── docker-compose.prod.yml    # Hardened Docker setup for production
└── README.md
```

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


### 2. Run with Docker Compose
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

`backend/openapi.yaml` is the API contract, not only its documentation: every request is checked against it (token, role, path params and body) before it reaches a route, so a new or changed route must be described there first. Rules the spec cannot express, such as `endsAt` after `startsAt` or checks that need the database, stay in the route.

The frontend's API types come from the same file: `frontend/src/api/schema.d.ts` is generated from it. After changing `openapi.yaml`, run `npm run gen:api` in `frontend/` and commit the result; CI fails if the two are out of step.

To stop the containers and shut down the network safely, run:
```bash
docker compose -f docker-compose.dev.yml down
```

### 3. Log in as the Seeded Administrator

The development setup seeds an administrator account when the backend starts. For local development, open the frontend at [http://localhost:5173](http://localhost:5173) and use:

| Field | Value |
| --- | --- |
| Email | `admin@school.local` |
| Password | `password123` |

After logging in, the administrator dashboard provides access to user, course,
session, and enrollment management.

The seeded accounts are not asked to change their password. Accounts you create from the
administrator dashboard are: log in as one to see the first-login password change.

### 4. Simulating Production
To run the production-optimized build as a background process, run:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 🛡️ Testing & CI/CD Pipeline

### Automated Backend Tests
The backend tests are integration tests written with **Vitest** and supertest. Each one sends real HTTP requests to the Express app and checks the response against `openapi.yaml`. To keep your development data safe from pollution, the test suite automatically directs its queries to a completely separate test database running on port `5433`.

To run the tests manually, start the test database, then run them from the backend directory:
```bash
docker compose -f docker-compose.dev.yml up -d db_test
cd backend
npm test
```

### Git Hooks
Run `npm install` once in the repository root to install the Git hooks (Husky):

- **pre-commit:** scans staged files for secrets (secretlint) and lints staged frontend files (ESLint).
- **commit-msg:** checks the message follows [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(courses): add enrolment limit`.
- **pre-push:** type checks the backend and frontend, then runs the backend tests. Start the test database first with `docker compose -f docker-compose.dev.yml up -d db_test`.

### GitHub Actions (CI)
The workflow script inside `.github/workflows/ci.yml` runs automatically on every pull request and push to the `main` branch. It has two jobs:

- **Backend tests:** spins up PostgreSQL 15, installs Node modules, generates the Prisma client, and runs the Vitest test suite.
- **Frontend checks:** confirms `frontend/src/api/schema.d.ts` matches `backend/openapi.yaml`, then runs ESLint and the production build.

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
- [x] **First-Login Password Change:** Accounts an administrator creates must choose their own password before they can use the app.
- [ ] **Password Reset:** A secure password-reset mechanism for users who forget their password.

### 📈 Scalability & Performance
- [x] **Data Pagination & Search:** Offset pagination (`page`, `limit`) and search on `/users`, `/courses`, and `/sessions`, plus a `from`/`to` date filter on `/sessions`.
- [x] **Code Cleanup:** Removed duplicate middleware definitions (e.g., `express.json()`) and stray debugging `console.log` statements from production execution paths.

### 🛡️ Enhanced Test Coverage & DevOps Resilience
- [x] **Infrastructure Health Monitoring:** Integrate declarative `healthcheck` keys into the production `docker-compose.prod.yml` services to track container health natively.
- [x] **Targeted Backend Testing:** Edge-case tests for instructor data ownership boundaries (e.g., an instructor can't edit another instructor's session, and a student can't read a session from a course they aren't enrolled in) and uniform invalid-input error responses.
