## Context

See `proposal.md` for motivation. The codebase currently contains an attendance domain implementation across SQLite/Prisma models, Node.js API endpoints, React hooks, types, and UI views. This design outlines how the domain layer will be surgically extracted and how a clean starter template will be established while keeping all architectural foundations intact.

## Goals / Non-Goals

**Goals:**
- Completely remove attendance domain models, endpoints, hooks, types, and domain-specific UI components.
- Retain all 15 Radix UI primitives in `src/components/ui/`.
- Retain the Paraglide i18n RTL-first framework, ThemeProvider, and Node.js production server.
- Establish a clean, extensible application layout in `src/App.tsx` with a generic header and starter workspace canvas.
- Ensure the codebase builds cleanly (`pnpm build`, `pnpm typecheck`, `pnpm compile:i18n`).

**Non-Goals:**
- Modifying core design tokens, Tailwind v4 theme variables, or Vazirmatn font setup.
- Removing or altering containerization files (`Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`).
- Implementing new domain business features (the template will be ready for new features).

## Decisions

### 1. Database Schema & State Reset
- **Choice**: Reset `prisma/schema.prisma` to contain only `datasource db` (SQLite/LibSQL) and `generator client`. Provide a minimal no-op `prisma/seed.ts`.
- **Rationale**: Leaves a clean canvas for any future domain models while maintaining Prisma Client generation and database push workflows.

### 2. Backend Routing & API Client
- **Choice**: Keep `Router` and health check handlers (`/health`, `/api/health`) in `api/_lib/router.ts`. Remove `api/attendance/`, `api/students/`, and `api/stats.ts`. In `src/lib/api.ts`, keep generic `request<T>()` and `ApiResponse<T>` helpers, removing domain query functions.
- **Rationale**: Preserves the unified serverless & production Node.js routing pattern for future API modules.

### 3. Layout & Header Architecture
- **Choice**: Create a generic `Header` component (e.g. in `src/components/Header.tsx` or `src/components/layout/Header.tsx`) featuring brand icon, application title, language toggle, and theme toggle. Replace domain attendance tables in `src/App.tsx` with a starter hero card and workspace placeholder.
- **Rationale**: Gives instant visual feedback that the application is running, bidirectional, and themed, without any lingering attendance domain concepts.

### 4. Internationalization (Paraglide) Cleanup
- **Choice**: Prune student/attendance translation keys from `messages/en.json` and `messages/fa.json`. Retain application title, subtitle, theme names, language names, and common UI strings. Run `compile:i18n`.
- **Rationale**: Eliminates dead translation keys and avoids type errors in Paraglide's typed message accessors (`m.*`).

## Risks / Trade-offs

- **[Risk] Lingering imports causing TypeScript compilation failures** → *Mitigation*: Perform a full `pnpm typecheck` and `pnpm build` validation step after all removals.
- **[Risk] Paraglide compiler desynchronization** → *Mitigation*: Run `pnpm compile:i18n` immediately after updating message files and verify generated code.
- **[Risk] Vitest tests failing on removed attendance files** → *Mitigation*: Prune `tests/stats.test.ts` and `tests/schemas.test.ts`; adapt `tests/date.test.ts` to test remaining utilities.
