# LegalMetriCheck API

Standalone Node.js, Express, TypeScript, PostgreSQL, and Prisma backend
foundation for LegalMetriCheck. Database models are included in this phase;
authentication, OCR, AI, compliance rules, and reports remain deferred.

## Structure

- `src/config` — environment configuration
- `src/config/prisma.ts` — reusable Prisma client
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
