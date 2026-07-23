# FitMarket

FitMarket is a small marketplace app for clients and trainers. It provides account signup/login, trainer availability, client session booking, and a basic social-post API.

## Stack

- Frontend: React 18 (Create React App)
- Backend: PHP 8.3 with PDO PostgreSQL
- Database: PostgreSQL 16
- Local orchestration: Docker Compose

## Quick start

Docker Compose is the supported development environment. From the repository root, run:

```bash
docker compose up --build
```

Open the app at <http://localhost:3000>. The API health endpoint is available at <http://localhost:5000/api/health>.

To use different host ports:

```bash
FRONTEND_PORT=3001 BACKEND_PORT=5001 DB_PORT=5433 docker compose up --build
```

The frontend calls the backend at `http://localhost:<BACKEND_PORT>`, so no additional frontend configuration is required for this Compose setup.

Stop the services with:

```bash
docker compose down
```

To also remove local database data:

```bash
docker compose down -v
```

## Local development without the backend container

Start Postgres with Docker:

```bash
docker compose up -d db
```

The backend requires PHP 8.3+ with the `pdo_pgsql` extension enabled. Start it from the repository root:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gym_social \
php -S 0.0.0.0:5000 -t backend/public
```

In another terminal, start the frontend:

```bash
cd frontend
npm ci
REACT_APP_API_BASE_URL=http://localhost:5000 npm start
```

## API

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET`, `POST /api/posts`
- `GET`, `POST /api/trainer-sessions`
- `PUT /api/trainer-sessions/:id`
- `POST /api/trainer-sessions/:id/cancel`
- `GET`, `POST /api/client-sessions`

For a fresh database volume, schema initialization runs automatically from `backend/sql/init.sql`.

## Checks

```bash
php -l backend/public/index.php
php -l backend/src/postsClass.php
php -l backend/src/schedulingClass.php
php -l backend/src/signupClass.php

cd frontend && npm ci && npm run build
```

There are currently no automated application tests.
