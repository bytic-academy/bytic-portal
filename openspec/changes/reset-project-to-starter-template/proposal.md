## Why

The current repository contains an attendance tracking implementation (domain APIs, Prisma data models, attendance-specific UI views, and seed data). To prepare the codebase for new core feature development without architectural friction or domain coupling, the project must be reset to a clean, foundational starter template while preserving core infrastructure (React 19, Tailwind v4, Paraglide RTL-first i18n, LibSQL/Prisma setup, Radix UI primitives, Node.js production server, and Docker support).

## What Changes

- **REMOVAL (Domain APIs)**: Remove `/api/students`, `/api/attendance`, `/api/attendance/mark-all`, and `/api/stats`. Unmount them from `api/_lib/router.ts`.
- **REMOVAL (Database Models)**: Remove `Student` and `AttendanceRecord` models from `prisma/schema.prisma`. Clear `prisma/seed.ts` of attendance fixtures and reset local database files.
- **REMOVAL (Domain UI Components & Logic)**: Remove `src/components/attendance/` (table, dialogs, stats, date navigator), `src/hooks/useAttendanceData.ts`, and `src/types/attendance.ts`.
- **MODIFICATION (Application Shell & Header)**: Refactor `src/App.tsx` and header components into a clean, generic starter application shell with top bar (brand, language switch, theme switch), toast container, and empty content placeholder.
- **MODIFICATION (API Client & Messages)**: Clean `src/lib/api.ts` to retain generic `request<T>` / `ApiResponse<T>` methods. Prune attendance-specific translation keys in `messages/en.json` and `messages/fa.json` while keeping system, theme, and common action keys.
- **MODIFICATION (Test Suite)**: Remove attendance-specific tests (`stats.test.ts`, `schemas.test.ts`) and maintain core utility/setup tests.

## Capabilities

### New Capabilities
- `starter-template-shell`: Minimal clean application shell providing responsive layout with navigation header (brand identity, language toggle, theme toggle), toast notification system, health check API endpoints (`/health`, `/api/health`), and ready-to-extend structure.

### Modified Capabilities
- `attendance-system`: Deprecate and remove domain attendance tracking capabilities (student roster management, attendance status updating, attendance stats calculation) to reset the repository into a clean base template.

## Impact

- **Affected Code**: `prisma/schema.prisma`, `prisma/seed.ts`, `api/`, `src/App.tsx`, `src/components/`, `src/hooks/`, `src/types/`, `src/lib/api.ts`, `messages/`, `tests/`.
- **Breaking Changes**: All previous `/api/students` and `/api/attendance` endpoints and related frontend widgets are removed.
- **Dependencies**: No external packages removed; all base dependencies (`@prisma/client`, `radix-ui`, `sonner`, `@inlang/paraglide-js`, `tailwindcss`, `vite`, `tsx`) remain intact.
