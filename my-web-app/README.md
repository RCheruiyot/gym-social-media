# Gym Social Media App (Starter)

This project now includes:
- `frontend`: React + TypeScript app (`http://localhost:3000`)
- `backend`: Express + TypeScript API (`http://localhost:5000`)
- `db`: PostgreSQL (Docker, `localhost:5432`)

## 1. Prerequisites

- Node.js 18+ (or 20+ recommended)
- npm
- Docker Desktop (for database / full stack with Docker Compose)

## 2. Quick Start (Recommended: Docker Compose)

From project root (`my-web-app`):

```bash
docker compose up --build
```

Then open:
- Frontend: `http://localhost:3000`
- Backend health endpoint: `http://localhost:5000/api/health`

If ports are already in use, override them when starting:

```bash
FRONTEND_PORT=3001 BACKEND_PORT=5001 DB_PORT=5433 docker compose up --build
```

Then open:
- Frontend: `http://localhost:3001`
- Backend health endpoint: `http://localhost:5001/api/health`

Stop services:

```bash
docker compose down
```

If you want to also remove database data:

```bash
docker compose down -v
```

## 3. Local Dev (Run Frontend + Backend without Docker, DB with Docker)

### Step A: Start Postgres in Docker

```powershell
docker compose up -d db
```

### Step B: Start Backend

```powershell
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### Step C: Start Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

## 4. API Endpoints

- `GET /api/health`
- `GET /api/posts`
- `POST /api/posts`

Example POST body:

```json
{
  "title": "Leg day complete",
  "content": "Hit a new PR on squats today.",
  "authorName": "Roy"
}
```

## 5. Database Notes

- Table creation is automatic through `backend/sql/init.sql` when the `db` container starts for a fresh volume.
- Default connection string used by backend:
  `postgresql://postgres:postgres@localhost:5432/gym_social`
