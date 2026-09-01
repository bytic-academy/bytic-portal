## Why

To support seamless local testing, easy database modification/backups, VPS self-hosting, and automated Vercel CI/CD deployments, the project needs a production-ready, type-safe Docker Compose setup with persistent SQLite storage, an automated migration lifecycle, and comprehensive English documentation.

## What Changes

- **Production Standalone Server Runtime**: Add a lightweight, type-safe Node.js production server with modular middleware support (CORS, security headers, request logging, error handling), static asset serving (`dist/`), SPA fallback, and API route dispatching.
- **Dynamic Database Adapter Support**: Update Prisma/libSQL database client initialization to seamlessly handle `file:` SQLite paths (embedded local / Docker volume), `http://` / `libsql://` remote endpoints (Turso / sqld), with environment variable precedence.
- **Production-Ready Dockerization**:
  - Multi-stage `Dockerfile` (deps, builder, runner) using hardened non-root `node:22-alpine` image.
  - Startup entrypoint (`docker-entrypoint.sh`) that automatically runs database migrations (`prisma db push --skip-generate`) before launching the server.
- **Docker Compose Configuration**:
  - `docker-compose.yml` for production VPS self-hosting with named persistent volume (`attendance_data`), container health checks, and restart policies.
  - Optional override / sample compose profile for local testing and backup procedures.
- **Automated Vercel CI/CD Build Workflow**: Update build scripts to ensure automated Prisma client generation and database migrations on Vercel deployment.
- **Comprehensive English Documentation (`README.md`)**: Complete rewrite into clear, professional English covering local development, Docker Compose testing, VPS self-hosting (security, reverse proxy with Caddy/Nginx, backups), and Vercel cloud deployment with Turso.

## Capabilities

### New Capabilities
- `deployment-and-database`: Specifications for multi-environment deployment (Local, Docker/VPS, Vercel), container lifecycle, automated database migrations, persistent volume management, and operational documentation.

### Modified Capabilities
<!-- No requirement changes to existing attendance or UI behavior -->

## Impact

- **Build & Runtime**: Adds production server entrypoint (`server.ts` or `server.js`) and build step.
- **Deployment**: Adds `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `docker-entrypoint.sh`.
- **Database Connection**: `api/_lib/prisma.ts` updated to dynamically support `DATABASE_URL` and `TURSO_*` variables.
- **Documentation**: `README.md` updated with complete English guides for testing, self-hosting, and cloud deployment.
