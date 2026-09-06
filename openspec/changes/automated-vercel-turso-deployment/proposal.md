## Why

Currently, deploying Bytic Attendance to Vercel and Turso requires manual interventions and fails due to incompatible routing in `api/` (where non-underscored subdirectories cause Vercel to create broken serverless functions) and Prisma CLI's inability to directly push schemas to remote `libsql://` URLs. This change provides an automated, zero-friction "Push to Deploy" pipeline on Vercel and Turso so any code changes pushed to GitHub automatically sync database schema changes, ensure initial seed data exists, and deploy the full stack.

## What Changes

- Add a unified Vercel serverless function entrypoint (`api/index.ts`) and organize internal routes under `api/_routes/` so Vercel builds a single, high-performance serverless function covering all `/api/*` endpoints.
- Update `vercel.json` rewrites and configuration to seamlessly route API traffic to the serverless entrypoint and static assets to the SPA.
- Create an automated Turso schema sync script (`scripts/sync-turso.ts`) that calculates Prisma schema DDL diffs and applies them directly to remote Turso databases using `@libsql/client`.
- Add automatic seed verification to ensure default admin credentials (`admin@bytic.ir`) are populated upon first deployment.
- Update `package.json` build scripts so that Vercel builds automatically execute the Turso sync and i18n compilation.
- Provide comprehensive, step-by-step setup documentation for connecting Vercel and Turso.

## Capabilities

### New Capabilities
- `automated-deployment`: Automated cloud deployment pipeline for Vercel and Turso featuring zero-config serverless function routing, automated remote libSQL schema synchronization, and self-seeding.

### Modified Capabilities
<!-- No requirement-level changes to existing functional capabilities (attendance-system, ui-and-theming) -->

## Impact

- **Serverless API**: `api/index.ts` becomes the dedicated Vercel Serverless entrypoint. Internal routes are relocated cleanly under `api/_routes/`.
- **Routing Configuration**: `vercel.json` rewrites are updated for standard Vercel SPA + API proxying.
- **Build Pipeline**: `package.json` `"build"` script incorporates `compile:i18n` and `sync-turso.ts` before `vite build`.
- **Database Operations**: Introduces automated remote DDL migration against Turso without requiring the Turso CLI.
