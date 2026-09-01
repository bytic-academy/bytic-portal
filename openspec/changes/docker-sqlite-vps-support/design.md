## Context

See `proposal.md` for motivation.
Currently, the application runs a Vite dev server with `server.middlewares` intercepting `/api/*` routes. On Vercel, serverless handlers in `api/*.ts` process requests. To enable self-hosting and containerized testing without Vercel, a lightweight Node.js production server, an adaptive Prisma/libSQL database client, a multi-stage Docker build, and container lifecycle automation are needed.

## Goals / Non-Goals

**Goals:**
- Provide a robust, standalone TypeScript/Node.js production server (`server/index.ts`) that serves static assets from `dist/`, routes `/api/*` requests, and supports modular middlewares (security headers, CORS, request logging).
- Enhance `api/_lib/prisma.ts` to dynamically resolve `DATABASE_URL` (supporting arbitrary `file:` paths for mounted volumes) or remote Turso credentials (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`).
- Create a multi-stage `Dockerfile` and `docker-compose.yml` configured for persistent volume storage (`attendance_data`), non-root execution (`USER node`), and container healthchecks.
- Create `docker-entrypoint.sh` for automated database migrations on startup.
- Update `package.json` build scripts to ensure smooth CI/CD on Vercel and standalone builds.
- Rewrite `README.md` into comprehensive, professional English documentation.

**Non-Goals:**
- Replacing SQLite/Turso with PostgreSQL/MySQL.
- Adding complex distributed clustering or multi-master replication.

## Decisions

### 1. Standalone Server Runtime: Native Node HTTP + Modular Middlewares
- **Decision**: Implement a clean, dependency-minimal production server using Node's `node:http` and `node:fs` (or lightweight dispatcher) that directly imports and executes the existing Vercel-compatible API handlers in `api/**/*.ts`.
- **Rationale**: Keeps the Docker image footprint tiny (< 80MB), eliminates framework bloat, and preserves 100% code reuse between Vercel Serverless and Docker containers.
- **Alternatives Considered**:
  - *Express / Fastify*: Adds additional dependency weight without substantial benefit for 4 REST endpoints.
  - *Hono*: Excellent, but requires changing API handler signatures from `(req, res)` standard Node streams.

### 2. Database Storage: Embedded SQLite File on Persistent Docker Volume
- **Decision**: Use a single SQLite file mounted at `/data/attendance.db` on a Docker named volume (`attendance_data`).
- **Rationale**: Minimal RAM usage (< 80MB), instant setup, zero network hops, and straightforward hot backups via `sqlite3 .backup` or GUI inspection (DBeaver, TablePlus).
- **Alternatives Considered**:
  - *Running `sqld` in a separate container*: Adds memory and network complexity for single-node VPS setups.

### 3. Automated Migration Lifecycle
- **Decision**:
  - In Docker: `docker-entrypoint.sh` executes `npx prisma db push --skip-generate` before starting the server.
  - On Vercel: CI/CD runs `prisma generate && prisma db push && tsc -b && vite build`.
- **Rationale**: Guarantees database schemas are always synchronized before application traffic arrives.

### 4. Dynamic Path & Connection Adapter in `prisma.ts`
- **Decision**: Parse `DATABASE_URL` dynamically:
  - If `TURSO_DATABASE_URL` is set $\rightarrow$ connect to Turso with auth token.
  - If `DATABASE_URL` starts with `file:` $\rightarrow$ extract path and resolve properly (supporting absolute `/data/attendance.db` or relative paths).
  - Fallback to `./prisma/dev.db` for local dev.

## Risks / Trade-offs

- **[Risk] SQLite Concurrent Write Locks under High Load** → **Mitigation**: libSQL adapter enables WAL (Write-Ahead Logging) mode by default, easily handling thousands of concurrent read/write queries for classroom attendance.
- **[Risk] Docker Volume File Permissions for Non-Root User** → **Mitigation**: `docker-entrypoint.sh` and `Dockerfile` pre-create `/data` with `chown -R node:node /data` and run as `USER node`.
- **[Risk] Schema Drift on Auto-Push** → **Mitigation**: `prisma db push` safely updates tables with non-destructive changes and warns on data loss.
