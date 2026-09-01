## Context

See `proposal.md` for motivation. The application currently couples API route dispatching to duplicated `if-else` trees in `vite.config.ts` and `server/index.ts`. On the client, dates are static Gregorian strings with no Jalali date conversions or day navigation, state is managed in a single monolithic `useAttendanceData` hook, toast notifications are missing, and no automated testing framework is installed.

## Goals / Non-Goals

**Goals:**
- Provide a unified, framework-agnostic API request router (`api/_lib/router.ts`) matching method and path, parsing query params/body, and returning consistent JSON for Vite dev server and Node production server.
- Provide client-side Jalali/Solar Hijri conversion and formatting utilities with Persian numeral support, plus a Date Navigator component to browse attendance across dates (UTC `YYYY-MM-DD` persisted in DB).
- Introduce TanStack Query (`@tanstack/react-query`) for cache management and optimistic mutations with Sonner toast feedback.
- Add Radix `Select` and reusable `Skeleton` primitives.
- Configure Vitest with `@testing-library/react` and `jsdom` with baseline unit and integration tests.
- Clean up `previewFeatures = ["driverAdapters"]` in `prisma/schema.prisma`.

**Non-Goals:**
- Adding Course/Session/Cohort database models (deferred to subsequent feature changes).
- Implementing authentication or user permission systems.

## Decisions

### 1. Unified Router Architecture (`api/_lib/router.ts`)
- **Choice**: Implement a lightweight, pattern-based route registry that accepts standard `(req: IncomingMessage, res: ServerResponse)` and executes mapped handlers.
- **Rationale**: Keeps serverless compatibility (Vercel/Node/Vite) without introducing heavy external frameworks like Express, while avoiding duplication between `server/index.ts` and `vite.config.ts`.
- **Alternative considered**: Express/Fastify. Rejected because the project runs in lightweight Node and Vite dev server middleware without heavy server dependencies.

### 2. Jalali Conversion Strategy
- **Choice**: Implement pure, zero-dependency Gregorian-to-Jalali algorithms in `src/lib/date.ts` based on standard astrological astronomical algorithms.
- **Rationale**: High performance, zero runtime overhead, exact date conversions between ISO `YYYY-MM-DD` and Solar Hijri (e.g., `۱۴۰۵/۰۶/۰۲`).
- **Alternative considered**: Heavy moment-jalaali library. Rejected due to large bundle weight and legacy architecture.

### 3. Server State with TanStack Query
- **Choice**: `@tanstack/react-query` v5 with dedicated query keys (`['students', date, course, search]`, `['stats', date, course]`).
- **Rationale**: Standard industry solution for caching, background syncing, deduplication, and optimistic updates.

### 4. Toast Notifications with Sonner
- **Choice**: `sonner` configured with `dir="rtl"` (or dynamic direction) and styled to match Bytic theme tokens.
- **Rationale**: Best-in-class accessibility, smooth animations, lightweight, and native RTL support.

### 5. Testing with Vitest
- **Choice**: `vitest` + `jsdom` + `@testing-library/react`.
- **Rationale**: Native Vite ecosystem support, ultra-fast execution, zero config transformation overhead.

## Risks / Trade-offs

- **[Risk] State Synchronization across Date Changes**: Changing active date could cause stale data flicker if cache keys are not granular.
  → *Mitigation*: Ensure all queries and mutations include canonical `date` in their query key (`['students', { date, course, search }]`).
- **[Risk] Windows Prisma DLL lock**: On Windows, running node processes can lock Prisma client query engine dll.
  → *Mitigation*: Remove deprecated preview feature; clean up build script to run `tsc -b && vite build` and ensure Prisma generator is clean.

## Migration Plan

1. Install `@tanstack/react-query`, `sonner`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@radix-ui/react-select`.
2. Refactor router in `api/_lib/router.ts`, then hook into `server/index.ts` and `vite.config.ts`.
3. Create `src/lib/date.ts` and update `Header.tsx` and `DateNavigator.tsx`.
4. Refactor state layer with TanStack Query and add `Toaster` from `sonner`.
5. Add unit tests in `tests/` and verify with `npm test`.
