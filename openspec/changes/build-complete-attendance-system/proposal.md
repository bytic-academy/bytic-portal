## Why

The Bytic Attendance project has been reset to a clean foundation (React 19, Vite, Tailwind v4, Prisma + SQLite/Turso, Paraglide i18n) but contains no domain logic — the Prisma schema is empty, there are no API routes beyond `/health`, and the frontend is a static landing page. The system needs to be built end-to-end to fulfill its core purpose: tracking student attendance across Bytic's educational courses.

## What Changes

- **Database schema**: Define all domain models in Prisma — Course, Class, Student, User, ClassTeacher, ClassStudent, Session, AttendanceRecord, and AuthSession.
- **Authentication system**: Username/password login with bcrypt hashing, DB-backed sessions (90-day expiry), HTTP-only cookie transport. No registration — admins create all user accounts.
- **Role-based authorization**: Admin (full CRUD on all entities + teacher capabilities) and Teacher (manage only assigned classes). Middleware-enforced on all API routes.
- **Course management**: Full CRUD API and UI for courses.
- **Class management**: Full CRUD with many-to-many teacher assignment. Teachers see only their own classes.
- **Student management**: Full CRUD with many-to-many class enrollment. Students can be enrolled in multiple classes simultaneously or historically.
- **Session scheduling**: CRUD for class sessions with a bulk-creation flow — select multiple dates via a Jalali multi-date picker with a single start/end time, backend generates one session per date. Individual session editing supported.
- **Attendance tracking**: Per-session attendance sheet showing enrolled students with a simple present/absent toggle. Each check records a timestamp. Toggle is reversible.
- **Client-side routing**: TanStack Router for multi-page SPA navigation.
- **TDD backend**: Service-layer architecture with dependency-injected Prisma client. All business logic covered by unit tests using in-memory SQLite.
- **Test infrastructure**: Vitest setup with shared test utilities for in-memory database provisioning, seeding, and teardown.

## Capabilities

### New Capabilities
- `auth`: User authentication (login/logout), DB-backed sessions, password hashing, session middleware
- `users`: User account management (admin-only CRUD), role assignment (ADMIN/TEACHER)
- `courses`: Course entity CRUD operations
- `classes`: Class entity CRUD with many-to-many teacher and student enrollment management
- `students`: Student entity CRUD with multi-class enrollment
- `sessions`: Session scheduling with Jalali multi-date bulk creation, individual CRUD
- `attendance`: Per-session attendance tracking (present/absent toggle with timestamp)
- `routing`: TanStack Router setup with authenticated route guards and role-based navigation
- `testing`: TDD infrastructure — service-layer pattern, in-memory SQLite test database, shared test utilities

### Modified Capabilities
- `attendance-system`: Core capability requirements are being fully defined (current spec is a high-level overview that predates the reset)
- `ui-and-theming`: No requirement changes — existing color system, typography, and RTL rules remain as-is

## Impact

- **Database**: Complete schema creation (9 models). Requires `prisma db push` / migration.
- **API surface**: ~30+ new REST endpoints across 7 resource areas (auth, users, courses, classes, students, sessions, attendance).
- **Frontend**: Entire SPA rebuild — login page, dashboard, CRUD pages for each entity, session scheduler with Jalali picker, attendance sheet.
- **Dependencies**: New packages needed — bcrypt (password hashing), TanStack Router, Jalali date library (jalaali-js or react-multi-date-picker with Jalali), possibly cookie-parsing utility.
- **Existing code**: `api/_lib/router.ts` gains route registration from new modules. `server/index.ts` unchanged. `src/App.tsx` replaced by router-based layout.
- **Test infrastructure**: New `tests/` directory with setup utilities, per-service test files. `vitest.config.ts` updated for in-memory SQLite.
