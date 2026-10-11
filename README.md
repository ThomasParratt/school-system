# School Management System (MVP)

This is a full-stack enterprise web application designed to simplify how a school manages its courses, class sessions, and student enrollments. The project was inspired by direct feedback from students and staff at a local language school to fix real administrative headaches. 

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
│   └── src/                   # Express routes, controllers, and middleware
├── frontend/
│   └── src/
│       └── components/        # Separate UI folders for Admin, Instructor, and Student
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

### 4. Simulating Production
To run the production-optimized build as a background process, run:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 🛡️ Testing & CI/CD Pipeline

### Automated Backend Tests
Backend unit and integration tests are written using **Vitest**. To keep your development data safe from pollution, the test suite automatically directs its queries to a completely separate test database running on port `5433`.

To run the tests manually, go to the backend directory and execute:
```bash
cd backend
npm test
```

### GitHub Actions (CI)
The workflow script inside `.github/workflows/ci.yml` runs automatically on every pull request and push to the `main` branch. It spins up an isolated Ubuntu container with PostgreSQL 15, installs Node modules, generates the Prisma client, and runs the Vitest test suite to make sure no broken code gets merged.

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
- [ ] **Infrastructure Health Monitoring:** Integrate declarative `healthcheck` keys into the production `docker-compose.prod.yml` services to track container health natively.
- [ ] **Targeted Backend Testing:** Expand the Vitest testing suite to include explicit edge-case tests proving strict instructor data ownership boundaries and uniform invalid-input exception behaviors.
