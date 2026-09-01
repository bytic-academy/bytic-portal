## Purpose

Provides a multi-environment deployment and database management framework supporting local testing, production VPS self-hosting with persistent SQLite volumes, and automated Vercel cloud deployments.

## ADDED Requirements

### Requirement: Standalone Production Server
The application SHALL provide a production server that serves built static web assets, provides client-side SPA routing fallback, handles health checks, and dispatches HTTP API requests to typed backend handlers.

#### Scenario: Production Static Asset Serving
- **WHEN** a client requests a static asset or HTML route under production mode
- **THEN** the server returns the requested asset with appropriate cache headers or falls back to `index.html` for client-side navigation.

#### Scenario: Production API Request Handling
- **WHEN** a client sends an HTTP request to any `/api/*` endpoint
- **THEN** the server executes the corresponding API handler with error catching and JSON responses.

#### Scenario: Health Check Endpoint
- **WHEN** a monitoring agent or Docker healthcheck queries `GET /health` or `GET /api/stats`
- **THEN** the server responds with HTTP 200 and system health status.

### Requirement: Dynamic Database Connectivity
The database layer SHALL automatically adapt between local SQLite file storage, Docker volume mounted paths, and remote libSQL endpoints (Turso) based on environment configuration.

#### Scenario: Embedded SQLite File Mode
- **WHEN** `DATABASE_URL` is set to a `file:` URI (or defaults to local SQLite) and `TURSO_DATABASE_URL` is not provided
- **THEN** the system initializes the libSQL Prisma adapter pointing to the local/mounted file path.

#### Scenario: Remote Turso Cloud Mode
- **WHEN** `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are configured in the environment
- **THEN** the system initializes the libSQL Prisma adapter connecting securely over HTTPS/libSQL protocol to Turso.

### Requirement: Automated Migration Lifecycle
The deployment pipeline SHALL ensure that database schema migrations are applied automatically before the application accepts incoming requests.

#### Scenario: Docker Container Startup Migration
- **WHEN** the Docker container starts up
- **THEN** the startup script executes schema synchronization (`prisma db push --skip-generate`) against the persistent database volume before launching the web server.

#### Scenario: Vercel CI/CD Build Migration
- **WHEN** a new commit is built on Vercel
- **THEN** the build script generates the Prisma Client and synchronizes the target database schema before static bundle compilation.

### Requirement: Production Docker Compose Topology
The project SHALL provide a Docker Compose configuration that runs the application securely as a non-privileged user with persistent volume storage for the SQLite database.

#### Scenario: Persistent Volume Mount
- **WHEN** the Docker Compose stack is started with `docker compose up -d`
- **THEN** SQLite database files reside on a dedicated persistent volume (`attendance_data`), preserving data across container restarts and updates.

#### Scenario: Container Security Hardening
- **WHEN** the container executes in production
- **THEN** all processes run under the non-root `node` user with isolated file permissions.

### Requirement: English Testing and Deployment Documentation
The repository SHALL contain comprehensive, clear documentation in English within `README.md` detailing local testing, Docker Compose VPS deployment, database maintenance and backups, and Vercel cloud setup.

#### Scenario: Documentation Comprehensiveness
- **WHEN** a developer or operator reads `README.md`
- **THEN** they find step-by-step instructions for local dev, Docker Compose local testing, VPS production self-hosting with reverse proxies (Caddy/Nginx), SQLite backup/restore routines, and Vercel + Turso deployment.
