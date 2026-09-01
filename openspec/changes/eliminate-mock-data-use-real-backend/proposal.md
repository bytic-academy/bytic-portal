## Why

The frontend currently uses static mock data (`src/data/mockStudents.ts`) as default state and fallback on API errors. Now that the Prisma ORM backend and SQLite/Turso database are fully implemented and operational, the client must be cleanly decoupled from mock data. The application needs true database-driven state management with loading skeletons, clean empty states, and explicit error recovery instead of synthetic local fallbacks.

## What Changes

- Remove `src/data/mockStudents.ts` from the client bundle.
- Refactor `useAttendanceData` hook to initialize with empty state and `isLoading: true`, removing all synthetic mock student generation and silent mock fallbacks.
- Add animated loading skeletons to `AttendanceTable` and `AttendanceStats` to prevent layout shift during initial API queries.
- Add a user-friendly empty state in `AttendanceTable` when the database contains 0 students, explaining how to add students or run `npm run db:seed` via CLI.
- Enhance network/database failure reporting with a clear retry mechanism.
- Keep seed data isolated strictly in `prisma/seed.ts` for developer CLI execution (`npm run db:seed`).

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
- `attendance-system`: Transition client data management and UI lifecycle from mock-initialized state to genuine database-driven state with loading skeletons, empty state rendering, and real API error handling.

## Impact

- **Frontend Code**: `src/hooks/useAttendanceData.ts`, `src/components/attendance/AttendanceTable.tsx`, `src/components/attendance/AttendanceStats.tsx`, `src/App.tsx`.
- **Files Removed**: `src/data/mockStudents.ts`.
- **API & Database**: Consumes existing `/api/students`, `/api/attendance`, `/api/attendance/mark-all`, `/api/stats` directly.
- **Seeding**: Sample students remain maintained exclusively in `prisma/seed.ts`.
