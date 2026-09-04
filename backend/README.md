# LegalMetriCheck API

Standalone Node.js, Express, and TypeScript backend foundation for
LegalMetriCheck. This phase provides only the versioned API foundation and
health endpoint; database, authentication, OCR, AI, compliance rules, and
reports are intentionally deferred.

## Structure

- `src/config` — environment configuration
- `src/controllers` — HTTP handlers
- `src/middleware` — security, logging, and error handling
- `src/routes` — API route definitions
- `src/services` — application services
- `src/utils` — shared utilities
- `src/validators` — reusable validation helpers
- `src/server.ts` — Express bootstrap

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
