## 1. Setup & Database Layer

- [x] 1.1 Install Prisma ORM, Turso libSQL adapter, and Zod dependencies (`@prisma/client`, `@prisma/adapter-libsql`, `@libsql/client`, `zod`, and `prisma`, `tsx` devDependencies)
- [x] 1.2 Create `prisma/schema.prisma` with `Student` and `AttendanceRecord` models and driver adapter configuration
- [x] 1.3 Implement singleton Prisma client in `api/_lib/prisma.ts` with Turso libSQL client and local SQLite fallback
- [x] 1.4 Create `prisma/seed.ts` with initial Bytic students data and run database push / seed

## 2. Serverless API Endpoints

- [x] 2.1 Create shared validation schemas and types in `api/_lib/types.ts` and `api/_lib/response.ts`
- [x] 2.2 Implement `api/students/index.ts` for listing students with today's attendance (`GET`) and creating new students (`POST`)
- [x] 2.3 Implement `api/attendance/index.ts` (`PATCH` single student status) and `api/attendance/mark-all.ts` (`POST` batch mark all present)
- [x] 2.4 Implement `api/stats.ts` (`GET` real-time aggregate attendance statistics)

## 3. Frontend Integration & Client Layer

- [x] 3.1 Implement type-safe API client in `src/lib/api.ts`
- [x] 3.2 Implement `useAttendanceData` React hook supporting initial fetch, optimistic UI updates, and error rollback
- [x] 3.3 Wire `src/App.tsx`, `AddStudentDialog.tsx`, `AttendanceTable.tsx`, and `AttendanceStats.tsx` to the API hook
- [x] 3.4 Configure Vite dev server proxy in `vite.config.ts` and create `vercel.json` for deployment

## 4. Verification & Validation

- [x] 4.1 Verify database operations, seeding, and endpoint responses
- [x] 4.2 Verify UI interactions (student creation, status toggles, mark all present, filter, CSV export)
- [x] 4.3 Verify full TypeScript type checking and production build (`pnpm run build`)
