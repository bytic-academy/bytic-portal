## Context

The application is a single-page React 19 application built with Vite and Tailwind CSS. We are introducing persistent storage and serverless APIs to run on Vercel without migrating away from the existing Vite setup. See `proposal.md` for motivation and scope.

## Goals / Non-Goals

**Goals:**
- Implement a Prisma ORM schema supporting students and date-indexed attendance records.
- Support both remote Turso libSQL (via `@prisma/adapter-libsql` and `@libsql/client`) and local SQLite file (`dev.db`) for seamless offline development.
- Expose type-safe serverless endpoints under `/api/` for Vercel deployment.
- Provide a clean, type-safe API client on the frontend with optimistic updates and graceful fallbacks.
- Seed default Bytic student records on initial setup.

**Non-Goals:**
- SMS Gateway integration (omitted per requirements).
- Full user authentication/RBAC system (deferred to future change).
- Rewriting to Next.js or Remix.

## Decisions

### 1. Database & ORM: Turso (libSQL) + Prisma Driver Adapter
- **Decision**: Use `prisma-client-js` with `previewFeatures = ["driverAdapters"]`, coupled with `@prisma/adapter-libsql` and `@libsql/client`.
- **Rationale**: Enables connection over HTTP/WebSockets suitable for stateless Vercel Serverless Functions, avoiding persistent TCP connection pools while retaining SQLite simplicity and blazing speed.
- **Alternatives Considered**:
  - *Drizzle ORM*: Very lightweight, but Prisma has superior automated migration tooling (`prisma db push` / `prisma migrate`) and schema visualization.
  - *Postgres / Neon*: More complex schema and connection pooling setup for this scale compared to Turso SQLite.

### 2. Monorepo Serverless Function Layout (`/api`)
- **Structure**:
  - `api/_lib/prisma.ts`: Singleton Prisma client initialized with Turso or local SQLite adapter.
  - `api/_lib/types.ts` & `schemas.ts`: Zod validation schemas and shared TypeScript types.
  - `api/students/index.ts`: Handler for `GET` (list) and `POST` (create).
  - `api/attendance/index.ts`: Handler for `PATCH` (update single student status).
  - `api/attendance/mark-all.ts`: Handler for `POST` (mark all present for today).
  - `api/stats.ts`: Handler for `GET` (aggregate statistics).
- **Vite Dev Integration**: Configure `vite.config.ts` proxy to route `/api` to local API server during `pnpm dev` or run with `vercel dev`.

### 3. Frontend State Architecture & Optimistic Updates
- **Decision**: Create a dedicated `useAttendanceData` React hook that manages:
  1. Initial data fetching on mount.
  2. Immediate local UI update on status change (optimistic).
  3. Background API mutation with rollback on network failure.
  4. Automatic calculation of statistics and CSV export.

## Data Model

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

model Student {
  id            String             @id @default(cuid())
  studentId     String             @unique
  nameFa        String
  nameEn        String
  course        String
  guardianPhone String
  avatarUrl     String?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  records       AttendanceRecord[]
}

model AttendanceRecord {
  id           String   @id @default(cuid())
  studentId    String
  date         String   // YYYY-MM-DD
  status       String   // present, absent, late, justified
  checkInTime  String?  // HH:mm
  checkOutTime String?
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([studentId, date])
  @@index([date])
}
```

## Risks / Trade-offs

- **[Cold Starts on Vercel Serverless]** → *Mitigation*: libSQL over HTTP is extremely lightweight (<50ms execution time). The Prisma LibSQL adapter avoids heavy engine binaries.
- **[Offline Local Development]** → *Mitigation*: The database client config will fallback to `file:./prisma/dev.db` when `TURSO_DATABASE_URL` is not provided in local environment.
- **[Network Failures during Status Toggle]** → *Mitigation*: Implement optimistic updates with toast / UI notification and state rollback on fetch error.

## Migration & Deployment Plan

1. Install Prisma and libSQL dependencies: `pnpm add @prisma/client @prisma/adapter-libsql @libsql/client zod` and `pnpm add -D prisma tsx @types/node`.
2. Generate schema and run `pnpm prisma db push` or `prisma migrate dev`.
3. Run seed script `prisma/seed.ts` to insert initial student dataset.
4. Set environment variables in Vercel: `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
