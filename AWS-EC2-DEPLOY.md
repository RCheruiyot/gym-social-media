# AWS EC2 Deployment Guide

This project now includes a production deployment path for a single EC2 instance using Docker Compose.

## Files Added

- `docker-compose.aws.yml`: production compose file for EC2
- `frontend/Dockerfile.prod`: builds the React app and serves it with Nginx
- `frontend/nginx.conf`: serves the frontend and proxies `/api` requests to the PHP backend
- `.env.aws.example`: template for the values you need to fill in before deployment

## Where To Plug In AWS Information

Create a real `.env.aws` file in the project root by copying `.env.aws.example`, then replace these values:

- `AWS_PUBLIC_HOST`
  Use your EC2 public IPv4 address or your domain name.
- `POSTGRES_PASSWORD`
  Set your database password.
- `DATABASE_URL`
  Keep `db` as the hostname if Postgres stays in Docker on the same EC2 instance.
  If you later move the database to RDS, replace `db` with your RDS endpoint.
- `CORS_ALLOWED_ORIGIN`
  Set this to your frontend URL, for example `http://YOUR_EC2_IP` or `https://yourdomain.com`.
- `REACT_APP_API_BASE_URL`
  Leave this blank for the current setup. Nginx will route `/api` to the backend for you.

Example:

```env
AWS_PUBLIC_HOST=54.123.45.67
FRONTEND_PORT=80
POSTGRES_USER=postgres
POSTGRES_PASSWORD=super-secret-password
POSTGRES_DB=gym_social
DATABASE_URL=postgresql://postgres:super-secret-password@db:5432/gym_social
CORS_ALLOWED_ORIGIN=http://54.123.45.67
REACT_APP_API_BASE_URL=
```

## What The Production Setup Does

- `db` runs PostgreSQL privately inside Docker
- `backend` runs the PHP API privately inside Docker
- `frontend` builds the React app and serves it on port `80`
- Nginx inside the frontend container proxies `/api/*` to the backend container

That means:

- users visit `http://YOUR_EC2_IP`
- API requests go to `http://YOUR_EC2_IP/api/...`
- the database is not exposed to the public internet
- the backend is not exposed directly to the public internet

## How To Run It On EC2

After cloning the repo onto your EC2 instance:

```bash
cp .env.aws.example .env.aws
```

Edit `.env.aws`, then start the app:

```bash
docker compose --env-file .env.aws -f docker-compose.aws.yml up --build -d
```

To stop it:

```bash
docker compose --env-file .env.aws -f docker-compose.aws.yml down
```

## AWS Settings You Still Need In The Console

For your EC2 instance:

- open inbound `80` for HTTP
- open inbound `22` for SSH from your IP only

If you add HTTPS later:

- open inbound `443`
- add a domain and SSL certificate

## Recommended Next Upgrade

Once this is working, the next clean upgrade is:

1. Move Postgres from Docker to Amazon RDS
2. Point `DATABASE_URL` at the RDS endpoint
3. Add HTTPS with Nginx and a domain name
