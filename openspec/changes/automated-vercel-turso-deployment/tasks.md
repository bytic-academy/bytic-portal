## 1. Serverless Entrypoint & Route Organization

- [x] 1.1 Move domain route and service modules from `api/<domain>` to `api/_routes/<domain>` and update router registrations in `api/_lib/router.ts`
- [x] 1.2 Create the unified Vercel serverless function entrypoint `api/index.ts` exporting a default handler that delegates to `apiRouter.handle(req, res)`
- [x] 1.3 Update `vercel.json` to route `/api/(.*)` to `/api` and configure function bundling settings with `includeFiles`

## 2. Automated Turso Schema Migration & Self-Seeding

- [x] 2.1 Implement `scripts/sync-turso.ts` using Prisma migration diffing and `@libsql/client` to automatically apply DDL statements to remote Turso databases
- [x] 2.2 Add self-seeding detection in `scripts/sync-turso.ts` to automatically populate the default administrator (`admin@bytic.ir`) if the database is newly initialized
- [x] 2.3 Add `db:sync:turso` script to `package.json` and verify the script exits cleanly (code 0) when `TURSO_DATABASE_URL` is omitted

## 3. Build Pipeline & Documentation

- [x] 3.1 Update `package.json` `"build"` script to run `compile:i18n`, `sync-turso.ts`, `typecheck`, and `vite build` in sequence
- [x] 3.2 Update `README.md` and `.env.example` with clear, zero-friction instructions for Vercel + Turso integration

## 4. End-to-End Verification

- [x] 4.1 Run test suite (`pnpm test`) and TypeScript check (`pnpm typecheck`) to ensure all route and module relocations compile without error
- [x] 4.2 Run full production build (`pnpm run build`) and verify successful asset bundling in `dist/` and clean migration skip

