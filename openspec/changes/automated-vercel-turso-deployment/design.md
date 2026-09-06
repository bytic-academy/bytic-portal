## Context

See `proposal.md` for motivation and overview.

Currently, the repository uses a Vite-based SPA frontend alongside an internal Node.js router (`api/_lib/router.ts`). The application supports local development via Vite SSR middleware and containerized deployment via a standalone Node server (`server/index.ts`). For Vercel, deploying the `/api` directory currently causes issues because Vercel discovers every TypeScript file in `api/` that does not begin with an underscore as a serverless function endpoint, failing on files without a default handler export. Furthermore, Prisma CLI does not natively connect to remote `libsql://` URLs, requiring an automated mechanism to synchronize schema migrations and seed data on Turso.

## Goals / Non-Goals

**Goals:**
- Provide a clean, unified Vercel Serverless Function entrypoint (`api/index.ts`) that reuses the existing `apiRouter` without code duplication.
- Restructure internal routes into underscored directories (`api/_routes/`) so Vercel treats `api/index.ts` as the sole serverless endpoint.
- Configure `vercel.json` rewrites and function tracing (`includeFiles`) to ensure Prisma and static files are bundled and served reliably.
- Build an idempotent schema sync script (`scripts/sync-turso.ts`) using Prisma's migration engine diffing and `@libsql/client` execution.
- Automate seed data initialization on first deployment when the database is empty.
- Ensure all existing local development and Docker VPS deployment modes continue to function seamlessly.

**Non-Goals:**
- Migrating the frontend from Vite/TanStack Router to Next.js or Remix.
- Replacing Prisma ORM with another ORM (e.g. Drizzle or Kysely).
- Managing multi-tenant or multi-database Turso branching pipelines.

## Decisions

### 1. Unified Serverless Entrypoint vs Multi-Function Layout
- **Decision**: Expose a single catch-all serverless function at `api/index.ts` and route `/api/(.*)` to `/api` in `vercel.json`.
- **Rationale**:
  - Eliminates cold-start penalties across multiple endpoints by sharing a warm Node runtime instance and shared `@prisma/adapter-libsql` connection.
  - Avoids Vercel free-tier serverless function count limits.
  - Keeps router logic 100% unified across local Vite dev middleware, standalone Node Docker server, and Vercel serverless.
- **Alternatives Considered**: Creating individual files per endpoint (e.g. `api/auth/login.ts`). Rejected because it duplicates routing and middleware logic and increases cold starts.

### 2. Underscore-Prefixed Directory Layout for Internal Modules
- **Decision**: Move domain route handlers from `api/<domain>/` to `api/_routes/<domain>/` (or keep in `api/_lib/`).
- **Rationale**: Vercel's build detector strictly ignores any directories beginning with an underscore (`_`). This prevents Vercel from attempting to bundle service and route registration files as independent serverless functions.
- **Alternatives Considered**: Configuring `vercel.json` functions exclusions. Rejected because filesystem-level exclusion (`_`) is robust and standard across Vercel deployments.

### 3. Remote Turso Migration via `prisma migrate diff` + `@libsql/client`
- **Decision**: Implement `scripts/sync-turso.ts` using `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` and execute the generated SQL statements against Turso with `@libsql/client`'s `.executeMultiple()`.
- **Rationale**:
  - Prisma CLI natively errors when given a `libsql://` or HTTP URL in `DATABASE_URL`.
  - `@libsql/client` is already an existing production dependency in `package.json`.
  - Generates exact, type-accurate SQLite DDL matching Prisma schema without requiring external CLI installs like `turso` on the build machine.
- **Alternatives Considered**: Requiring users to install the Turso CLI locally and run `turso db shell`. Rejected because it breaks zero-friction CI/CD and automated push-to-deploy.

### 4. Vercel Build Hook Integration
- **Decision**: Update `package.json`'s `"build"` script to:
  `pnpm compile:i18n && tsx scripts/sync-turso.ts && tsc -b && vite build`.
- **Rationale**: Ensures that every deployment on Vercel automatically checks and applies database migrations prior to building the frontend. If `TURSO_DATABASE_URL` is absent (such as local testing or Docker), `sync-turso.ts` immediately exits cleanly with code 0.

## Risks / Trade-offs

- **[Vercel Serverless Bundle Missing Prisma Engine]** → *Mitigation*: Ensure `vercel.json` specifies `"includeFiles": "prisma/**"` for the `api/index.ts` function, or rely on `@prisma/adapter-libsql` which uses minimal WASM/JS engine dependencies.
- **[DDL Execution Failures on Destructive Changes]** → *Mitigation*: The sync script detects if existing tables conflict and applies safe incremental additions. Non-destructive changes (new tables, columns, indexes) succeed idempotently.
- **[Cold Start Latency]** → *Mitigation*: The libSQL HTTP driver maintains zero persistent TCP connections and connects in <50ms, minimizing serverless cold starts.

## Migration Plan

1. Reorganize `api/` files to move domain modules under `api/_routes/` and update import paths.
2. Create `api/index.ts` exporting the default Vercel serverless request handler.
3. Update `vercel.json` with the new rewrite rules and function configuration.
4. Implement and test `scripts/sync-turso.ts`.
5. Update `package.json` scripts and verify both local Vite dev and production build commands pass.
