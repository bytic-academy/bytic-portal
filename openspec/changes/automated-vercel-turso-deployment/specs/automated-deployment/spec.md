## Purpose

Provides an automated cloud deployment pipeline for Vercel and Turso featuring zero-config serverless API routing, automatic remote database schema synchronization, and self-seeding on initial rollout.

## ADDED Requirements

### Requirement: Unified Vercel Serverless Function Routing
The system SHALL expose a unified serverless function entrypoint for Vercel deployment that captures all `/api/*` requests and executes domain handlers without spawning broken individual serverless routes.

#### Scenario: Serverless API endpoint execution
- **WHEN** an HTTP request is made to any registered API endpoint (e.g. `GET /api/health` or `POST /api/auth/login`) on Vercel
- **THEN** the request is routed to `api/index.ts` and successfully dispatches to the corresponding router handler with proper status and JSON payload

#### Scenario: Catch-all SPA routing
- **WHEN** an HTTP request is made to a non-API URL path (e.g. `/`, `/courses`, `/attendance`) on Vercel
- **THEN** the request rewrites to `/index.html` to allow client-side SPA routing

### Requirement: Automated Turso Remote Schema Synchronization
The build pipeline SHALL automatically calculate database schema differences from the Prisma schema and apply required DDL statements directly to the remote Turso database when deployment credentials are provided.

#### Scenario: Remote schema synchronization during deployment
- **WHEN** a build executes in an environment where `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- **THEN** the migration runner generates the DDL diff from `prisma/schema.prisma` and applies it idempotently to the Turso database via libSQL without requiring manual CLI intervention

#### Scenario: Local build without Turso credentials
- **WHEN** a build executes without `TURSO_DATABASE_URL` configured (such as local testing or container builds)
- **THEN** the Turso synchronization script skips execution cleanly without throwing errors or halting the build

### Requirement: Automatic Database Initialization and Seeding
The automated deployment pipeline SHALL detect if the remote database is empty and automatically seed the default administrator account.

#### Scenario: First deployment to fresh Turso database
- **WHEN** the schema synchronization completes on an empty database where no users exist
- **THEN** the system automatically executes the seed script to create the initial admin user (`admin@bytic.ir`)

#### Scenario: Subsequent deployments to populated database
- **WHEN** schema synchronization executes against a database that already has registered users
- **THEN** existing user records are preserved intact and duplicate admin creation is skipped
