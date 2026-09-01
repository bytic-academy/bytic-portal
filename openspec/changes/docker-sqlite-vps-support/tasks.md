## 1. Database Client & Configuration Enhancement

- [x] 1.1 Update `api/_lib/prisma.ts` to dynamically resolve `DATABASE_URL` (file paths for local dev and persistent Docker volumes) and `TURSO_*` credentials
- [x] 1.2 Create `.env.example` and update `.env` with clear comments for SQLite, Docker volumes, and Turso

## 2. Standalone Production Server Runtime

- [x] 2.1 Create type-safe production server `server/index.ts` with static asset serving (`dist/`), SPA fallback routing, and health checks
- [x] 2.2 Implement modular middleware pipeline in server (security headers, CORS, request logging, error handling)
- [x] 2.3 Route `/api/*` endpoints to existing API handlers (`students`, `attendance`, `attendance/mark-all`, `stats`)
- [x] 2.4 Update `package.json` scripts (`start`, `build`, `build:server`) for standalone and CI/CD execution

## 3. Production Dockerization & Docker Compose

- [x] 3.1 Create multi-stage `Dockerfile` (deps, builder, runner) with non-root `node` user and healthcheck
- [x] 3.2 Create `docker-entrypoint.sh` for automated database schema synchronization (`prisma db push --skip-generate`) on container startup
- [x] 3.3 Create `docker-compose.yml` configured for persistent volume storage (`attendance_data`), non-root permissions, and restart policies
- [x] 3.4 Create `.dockerignore` to optimize build context and cache efficiency

## 4. Documentation & Verification

- [x] 4.1 Rewrite `README.md` in comprehensive English covering Local Dev, Docker Compose testing, VPS Self-Hosting (reverse proxy, SSL, backups), and Vercel + Turso deployment
- [x] 4.2 Verify TypeScript compilation, build pipeline, and validate change artifacts
