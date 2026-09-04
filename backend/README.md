# LegalMetriCheck API

Standalone Node.js, Express, TypeScript, PostgreSQL, and Prisma backend for
LegalMetriCheck, with JWT authentication and role-based access control.
OCR, AI, compliance rules, and reports remain deferred.

## Structure

- `src/config` — environment configuration
- `src/config/prisma.ts` — reusable Prisma client
- `src/middleware/auth.ts` — JWT authentication and active-user checks
- `src/middleware/authorize.ts` — role-based authorization
- `src/services/auth.service.ts` — password and token business logic
- `src/controllers` — HTTP handlers
- `src/middleware` — security, logging, and error handling
- `src/routes` — API route definitions
- `src/services` — application services
- `src/utils` — shared utilities
- `src/validators` — reusable validation helpers
- `src/server.ts` — Express bootstrap
- `prisma/schema.prisma` — normalized inspection workflow schema

## PostgreSQL and Prisma

PostgreSQL is required for database operations. Copy `.env.example` to `.env`
and configure `DATABASE_URL`. The health endpoint remains independent of the
database and works when PostgreSQL is unavailable.

```sh
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:studio
```

The schema stores OCR/AI observations as extracted declarations separately
from future compliance results and checks. No seed data or legal rules are
included.

## Authentication

Authentication uses bcrypt password hashes and JWTs. Public registration
always assigns the `INSPECTOR` role; clients cannot select `ADMIN` or elevate
their privileges. Password hashes are never returned.

Endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/admin/test`
- `GET /api/v1/auth/inspector/test`
- `GET /api/v1/auth/reviewer/test`

Send access tokens using:

```text
Authorization: Bearer <token>
```

Unauthenticated requests receive `401`. Authenticated users without the
required role receive `403`. `JWT_SECRET` and `JWT_EXPIRES_IN` are configured
through the environment; never commit `.env` or real secrets.

## Setup

```sh
cd backend
npm install
copy .env.example .env
```

Use `cp .env.example .env` on macOS/Linux. Set `PORT` and `CORS_ORIGIN` as
needed. The future frontend API base URL will be `VITE_API_BASE_URL`; the
frontend remains on its existing mock service layer for now.

## Run

```sh
npm run dev
```

For a production-style run:

```sh
npm run build
npm start
```

## Health endpoint

`GET http://localhost:5000/api/v1/health`

```json
{
  "success": true,
  "service": "LegalMetriCheck API",
  "version": "v1",
  "status": "healthy"
}
```

The health endpoint is independent of any future database connection.
