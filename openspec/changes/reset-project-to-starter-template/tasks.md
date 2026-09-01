## 1. Database & Backend API Cleanup

- [x] 1.1 Remove Student and AttendanceRecord models from `prisma/schema.prisma`
- [x] 1.2 Update `prisma/seed.ts` to clean no-op starter script and remove local `prisma/dev.db`
- [x] 1.3 Run `pnpm db:generate` to regenerate Prisma Client without domain models
- [x] 1.4 Delete domain API handler directories (`api/attendance/`, `api/students/`, and `api/stats.ts`)
- [x] 1.5 Clean `api/_lib/router.ts` to unmount domain handlers and retain `/health` & `/api/health`

## 2. Frontend Domain Layer & Types Removal

- [x] 2.1 Remove domain attendance components in `src/components/attendance/`
- [x] 2.2 Create generic `src/components/Header.tsx` with logo branding, language toggle, and theme toggle
- [x] 2.3 Delete `src/hooks/useAttendanceData.ts` and `src/types/attendance.ts`
- [x] 2.4 Refactor `src/lib/api.ts` to retain generic `request<T>()` and `ApiResponse<T>` while removing attendance domain queries
- [x] 2.5 Refactor `src/App.tsx` to render clean starter layout shell with generic Header and toast notifications

## 3. Localization & Test Suite Alignment

- [x] 3.1 Prune attendance domain keys from `messages/en.json` and `messages/fa.json` while keeping base layout, theme, and language strings
- [x] 3.2 Run `pnpm compile:i18n` to recompile Paraglide messages
- [x] 3.3 Remove obsolete domain tests (`tests/stats.test.ts`, `tests/schemas.test.ts`) and ensure test setup remains valid

## 4. Verification & Build Validation

- [x] 4.1 Run `pnpm typecheck` to verify zero TypeScript errors across backend and frontend
- [x] 4.2 Run `pnpm test` to verify Vitest passes
- [x] 4.3 Run `pnpm build` to verify full Vite production build succeeds
