# School Management System

A system for managing courses and schuduling at a language school.

## Features so far

- **User Authentication**: Register, login, and manage user profiles

## Tech Stack

### Backend
- Node.js with Express framework
- PostgreSQL for database storage
- JWT for authentication
- bcrypt for password encryption

### Frontend
- TypeScript
- React
- TailwindCSS

## Project Structure

```
ft_transcendence/
├── backend/              # Backend server code
│   ├── src/              # Source code
│   │   ├── routes/       # API endpoints
│   │   ├── db.ts         # PostgreSQL connection setup
│   │   └── index.ts      # Main server file
│   ├── Dockerfile        # Backend Docker configuration
│   ├── package.json      # Backend dependencies
│   ├── tsconfig.json     # TypeScript configuration
├── frontend/             # Frontend application code
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   └── components/   # React components
│   ├── App.tsx           # Route component
│   ├── index.css         # Global css file
│   ├── main.tsx          # Frontend entry point
│   ├── Dockerfile        # Frontend Docker configuration
│   ├── package.json      # Frontend dependencies
│   └── tsconfig.json     # TypeScript configuration
├──  data/                # Database files (mounted as volume)
└── docker-compose.yml    # Docker configuration
```

## Installation

### Prerequisites
- Docker and Docker Compose
- Node.js (for development outside Docker)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ThomasParratt/school-system.git
   cd school-system
   ```

2. Build and start the containers:
   ```bash
   docker compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Database

The application uses PostgreSQL for data storage. The database file is stored in the `data/` directory, which is mounted as a volume in the Docker containers.

## API Documentation

The API provides endpoints for user management.

### User Management so far
- `GET /admin`: Get all admin users
- `GET /instructors`: Get all instructors
- `GET /students`: Get all students
- `POST /admin`: Create new administrator
- `POST /instructors`: Create new instructor
- `POST /students`: Create new student
- `POST /admin/login`: Administrator login
- `POST /instructors/login`: Instructor login
- `POST /students/login`: Student login
