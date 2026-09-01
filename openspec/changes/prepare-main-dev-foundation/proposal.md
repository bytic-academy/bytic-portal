## Why

Before entering the main development stage to build out real features, complex API routes, domain models, and rich UI flows, the application requires a robust, extensible foundation. This change establishes a unified API request router (shared between Vite dev mode and Node.js production), client-side Solar Hijri (Jalali) date handling and navigation with UTC persistence, TanStack Query caching, a Sonner toast notification system, Vitest testing infrastructure, and clean Prisma configurations.

## What Changes

- **Unified API Dispatcher**: Introduce a shared lightweight request router/dispatcher (`api/_lib/router.ts`) supporting HTTP method dispatching (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), query parameters, URL path matching, and consistent JSON responses for both `vite.config.ts` and `server/index.ts`.
- **Jalali Date Engine & Day Navigation**: Implement a zero-dependency Solar Hijri converter and date utility (`src/lib/date.ts`), enabling dynamic Persian header dates, localized Persian digit formatting, and an interactive date selector/navigator in the UI to view attendance across dates while retaining ISO/UTC format (`YYYY-MM-DD`) in the database.
- **Client Data Layer & Toasts**: Integrate `@tanstack/react-query` for declarative server-state management, cache invalidation, and optimistic updates. Add `sonner` for RTL-compatible user feedback toasts on attendance marks and updates.
- **UI Components Polish**: Add Radix-based `Select` and reusable `Skeleton` primitives in `src/components/ui/`.
- **Testing Infrastructure**: Setup Vitest with `@testing-library/react` and `jsdom`, adding `npm test` and `npm run typecheck` scripts with baseline tests for date conversion, schema validation, and stats algorithms.
- **Prisma & Config Cleanup**: Remove deprecated `previewFeatures = ["driverAdapters"]` from `prisma/schema.prisma`.

## Capabilities

### New Capabilities
- `api-routing-and-tooling`: Unified API route dispatching between dev and production runtimes, combined with an automated test suite via Vitest.

### Modified Capabilities
- `attendance-system`: Extend attendance tracking to support multi-day navigation with Solar Hijri (Jalali) localization, TanStack Query state synchronization, and toast notifications.

## Impact

- **Dependencies**: `@tanstack/react-query`, `sonner`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- **Server & Build**: `server/index.ts`, `vite.config.ts`, `api/_lib/router.ts`, `package.json`.
- **Frontend Architecture**: `src/lib/date.ts`, `src/hooks/useAttendanceData.ts`, `src/App.tsx`, `src/components/attendance/Header.tsx`, `src/components/ui/select.tsx`, `src/components/ui/skeleton.tsx`.
- **Database Schema**: `prisma/schema.prisma`.
- **Tests**: `tests/` directory with unit and integration tests.
