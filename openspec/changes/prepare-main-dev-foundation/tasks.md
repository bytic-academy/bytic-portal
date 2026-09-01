## 1. Dependencies & Tooling Setup

- [x] 1.1 Install `@tanstack/react-query`, `sonner`, `@radix-ui/react-select`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`
- [x] 1.2 Configure `vitest.config.ts` and add `test` and `typecheck` scripts to `package.json`
- [x] 1.3 Clean up deprecated `driverAdapters` preview feature in `prisma/schema.prisma`

## 2. Unified API Router

- [x] 2.1 Implement `api/_lib/router.ts` supporting method dispatch, URL pattern matching, query params, and JSON responses
- [x] 2.2 Wire `api/_lib/router.ts` into `vite.config.ts` replacing manual if-else branching in `apiDevPlugin`
- [x] 2.3 Wire `api/_lib/router.ts` into `server/index.ts` replacing manual if-else branching in production server

## 3. Date & Solar Hijri (Jalali) Engine

- [x] 3.1 Implement zero-dependency Solar Hijri conversion utilities and Persian digit formatters in `src/lib/date.ts`
- [x] 3.2 Update `Header.tsx` to display dynamic localized today date using the date utility
- [x] 3.3 Create interactive `DateNavigator.tsx` component supporting day increment/decrement, today jump, and active date selection

## 4. UI Primitives & Toast System

- [x] 4.1 Create `src/components/ui/skeleton.tsx` reusable loading skeleton
- [x] 4.2 Create `src/components/ui/select.tsx` based on `@radix-ui/react-select` with RTL support
- [x] 4.3 Configure `Sonner` Toaster in `App.tsx` with RTL awareness matching Bytic theme tokens

## 5. React Query Client Data Layer

- [x] 5.1 Setup `QueryClientProvider` in `main.tsx`
- [x] 5.2 Refactor data fetching and mutations in `src/hooks/useAttendanceData.ts` to use TanStack Query with optimistic updates and toast feedback
- [x] 5.3 Integrate `DateNavigator` and date-scoped queries into `App.tsx`, `AttendanceTable.tsx`, and `AttendanceStats.tsx`

## 6. Testing & Quality Verification

- [x] 6.1 Add unit tests for `src/lib/date.ts` verifying Jalali/Gregorian conversions and leap years
- [x] 6.2 Add unit tests for `api/_lib/types.ts` Zod validation schemas
- [x] 6.3 Add unit tests for attendance stats calculation logic
- [x] 6.4 Execute `npm test`, `npm run typecheck`, and `npm run build` to verify full system integrity
