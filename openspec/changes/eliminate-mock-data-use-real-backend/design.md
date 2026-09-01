## Context

The application backend is equipped with Prisma ORM, SQLite / Turso database connectivity, and REST endpoints (`/api/students`, `/api/attendance`, `/api/stats`). However, `useAttendanceData` still initializes React state with `initialStudents` from `src/data/mockStudents.ts` and falls back to local synthetic mock students on errors. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Completely eliminate `src/data/mockStudents.ts` from the client codebase.
- Initialize `useAttendanceData` with empty array `[]` and `isLoading: true`.
- Implement responsive, animated skeleton loaders for `AttendanceTable` and `AttendanceStats` during initial data retrieval.
- Provide a clean empty state in `AttendanceTable` when 0 students are present in the database, with clear instructions for adding students or running `npm run db:seed`.
- Implement reliable error handling and rollback on network/server failures with a prominent user-facing retry button.
- Keep sample seed records strictly isolated in `prisma/seed.ts` for CLI usage (`npm run db:seed`).

**Non-Goals:**
- Creating student edit/delete dialogs or historical date pickers (deferred to future changes).
- In-browser seed triggers (seeding remains CLI-driven).

## Decisions

### Decision 1: Skeleton Loaders over Spinners or Mock Placeholders
- **Choice**: Display animated skeleton rows and statistics cards matching the exact layout of table rows and metric cards during initial query resolution.
- **Rationale**: Prevents layout shifts (CLS) and eliminates the misleading flash of mock data.
- **Alternatives Considered**: Full-screen spinner (causes harsh layout jumps); keeping initial mock array during load (causes data inconsistency).

### Decision 2: Single Source of Truth for Data & Types
- **Choice**: Move all domain types (`Student`, `AttendanceStatus`, `CourseType`) exclusively to `src/types/attendance.ts` and delete `src/data/mockStudents.ts`.
- **Rationale**: Keeps client bundle clean and ensures TypeScript types are decoupled from seed mock data.
- **Alternatives Considered**: Leaving `mockStudents.ts` as a fallback (causes hidden state drift).

### Decision 3: Reversible Optimistic UI with Error Banner
- **Choice**: In `useAttendanceData`, optimistic updates are reverted to previous state if `api.updateAttendance` fails, and `error` state is populated with the actual server error message.
- **Rationale**: Ensures the UI always reflects persistent database reality while maintaining snappy UI responsiveness.

## Risks / Trade-offs

- **[Risk] Empty Database Initial Experience**: When a new environment is booted, the database has 0 students.
  - **Mitigation**: Render a descriptive empty state guiding the user to click "+ Add Student" or run `npm run db:seed` in their terminal.
- **[Risk] Network Downtime or Database Unavailability**: If the API server is down or unreachable.
  - **Mitigation**: Prominently display an error banner with a "Retry" button calling `refresh()`.
