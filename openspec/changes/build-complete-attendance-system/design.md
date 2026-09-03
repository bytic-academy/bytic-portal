## Context

See proposal.md for motivation. The project has a clean foundation — React 19 + Vite frontend, custom Node.js HTTP server with hand-rolled router, Prisma ORM with LibSQL adapter (supports both local SQLite and Turso), Paraglide i18n (RTL-first), and Radix UI + Tailwind v4 for components. The Prisma schema is empty and there are no domain routes or UI pages. Everything described here is greenfield.

Key constraints:
- SQLite-compatible schema (no Postgres-specific features)
- RTL-first UI with CSS logical properties (existing `ui-and-theming` spec)
- Bilingual: Persian (fa) / English (en) via Paraglide
- Existing custom `Router` class in `api/_lib/router.ts` (no Express/Hono)
- Deployment: Docker + VPS (existing `Dockerfile` and `docker-compose.yml`)

## Goals / Non-Goals

**Goals:**
- Build a complete, functional attendance management system
- Maintainable architecture that separates concerns (routes → services → database)
- Full test coverage of backend business logic using TDD with real database queries (in-memory SQLite)
- Extensible domain model (easy to add features like reports, notifications, analytics later)
- Clean role-based access control that's easy to reason about

**Non-Goals:**
- OAuth, SSO, or social login (only username/password)
- User self-registration or password reset flow
- Real-time updates (WebSocket, SSE) — polling or manual refresh is acceptable for v1
- PDF report generation or analytics dashboards
- Mobile app or PWA features
- Attendance statuses beyond present/absent (tardy, excused — deferred to future)
- Recurring session patterns (e.g., "every Wednesday") — only explicit multi-date selection

## Decisions

### D1: Database Schema Design

**Choice**: Prisma schema with 9 models using explicit join tables for M:M relationships.

```
Course ──1:M──▶ Class
Class  ◀──M:M──▶ User (via ClassTeacher)
Class  ◀──M:M──▶ Student (via ClassStudent)
Class  ──1:M──▶ Session
Session ──1:M──▶ AttendanceRecord ◀──M:1── Student
User   ──1:M──▶ AuthSession
```

**Alternatives considered**:
- Implicit M:M (Prisma's implicit many-to-many): Rejected because explicit join tables allow adding metadata later (e.g., enrollment date on ClassStudent, assignment date on ClassTeacher) without migration pain.
- Single `Enrollment` table for both teachers and students: Rejected — they are semantically different relationships with different permission implications.

**Key schema decisions**:
- `User.email` is the login identifier (unique constraint)
- `User.role` is an enum: `ADMIN | TEACHER`
- `Session.date` stored as ISO date string (`YYYY-MM-DD`), `startTime`/`endTime` as time strings (`HH:MM`)
- `AttendanceRecord` uses composite unique on `(sessionId, studentId)` — one record per student per session
- `AuthSession.token` is a 64-byte hex string from `crypto.randomBytes(32)`
- `AuthSession.expiresAt` set to creation time + 90 days
- All models have `createdAt` and `updatedAt` timestamps
- `Student.gender` is an enum: `MALE | FEMALE`

### D2: Service-Layer Architecture (TDD-First)

**Choice**: Every business operation is a pure function in a `service.ts` file that receives `PrismaClient` as its first argument. Route handlers are thin wrappers that parse the request, call the service, and send the response.

```
api/
├── _lib/
│   ├── router.ts          (existing)
│   ├── prisma.ts           (existing)
│   ├── response.ts         (existing)
│   ├── auth.ts             (auth middleware)
│   ├── body-parser.ts      (JSON body parsing utility)
│   └── validation.ts       (Zod schemas + validation helper)
├── auth/
│   ├── service.ts          (login, logout, validateSession)
│   └── routes.ts           (POST /api/auth/login, POST /api/auth/logout)
├── users/
│   ├── service.ts          (createUser, listUsers, updateUser, deleteUser)
│   └── routes.ts           (CRUD at /api/users)
├── courses/
│   ├── service.ts
│   └── routes.ts           (CRUD at /api/courses)
├── classes/
│   ├── service.ts          (CRUD + assignTeacher, enrollStudent, etc.)
│   └── routes.ts           (CRUD at /api/classes, sub-routes for teachers/students)
├── students/
│   ├── service.ts
│   └── routes.ts           (CRUD at /api/students)
├── sessions/
│   ├── service.ts          (CRUD + bulkCreate)
│   └── routes.ts           (CRUD at /api/sessions, POST /api/sessions/bulk)
└── attendance/
    ├── service.ts          (getSheet, toggleAttendance)
    └── routes.ts           (GET sheet, POST toggle)
```

**Why**: Functions that take `PrismaClient` as a parameter are trivially testable — in tests, pass an in-memory SQLite client; in production, pass the real one. No mocking frameworks needed. Real SQL queries run in tests.

**Alternatives considered**:
- Class-based services with constructor injection: More complex, no benefit for this scale.
- Repository pattern abstracting Prisma: Over-engineering — Prisma already is the repository.
- Testing with mocked Prisma: Fragile, doesn't catch real query bugs.

### D3: Authentication — DB-Backed Sessions with HTTP-Only Cookies

**Choice**: Server-side session tokens stored in `AuthSession` table, transported via HTTP-only cookies.

Flow:
1. `POST /api/auth/login` — validate email/password → create `AuthSession` row → set `Set-Cookie: session_token=<token>; HttpOnly; SameSite=Lax; Path=/; Max-Age=7776000`
2. Auth middleware on every `/api/*` route (except `/api/auth/login`) — read cookie → lookup session in DB → check expiry → attach `req.user = { id, role }` to request
3. `POST /api/auth/logout` — delete `AuthSession` row → clear cookie
4. Admins can delete other users' sessions (implicit logout)

**Why not JWT**: JWTs can't be revoked without a blacklist (which is essentially a DB session table anyway). DB sessions are simpler, support revocation natively, and the 90-day lifetime makes stateless tokens risky.

**Password hashing**: `bcrypt` with cost factor 12. Using the `bcrypt` npm package (pure JS, no native compilation issues in Docker).

### D4: Authorization — Role Guards as Middleware Helpers

**Choice**: Two levels of authorization checks:

1. **Route-level guards**: Middleware helpers like `requireAuth(handler)`, `requireAdmin(handler)`, and `requireClassAccess(handler)` that wrap route handlers.
2. **Service-level ownership checks**: For teacher-scoped operations, the service verifies `ClassTeacher` membership before proceeding.

```typescript
// Route-level: only authenticated users
router.get('/api/courses', requireAuth(listCoursesHandler));

// Route-level: only admins
router.post('/api/users', requireAdmin(createUserHandler));

// Service-level: teacher scope check
async function listClassesForUser(prisma: PrismaClient, userId: string, role: Role) {
  if (role === 'ADMIN') return prisma.class.findMany();
  return prisma.class.findMany({
    where: { teachers: { some: { userId } } }
  });
}
```

**Why split**: Route guards handle the common case (is the user logged in? are they admin?). Service functions handle the nuanced case (is this teacher assigned to this specific class?). This keeps routes clean and logic testable.

### D5: Client-Side Routing — TanStack Router (Code-Based)

**Choice**: TanStack Router with code-based route definitions (not file-based).

Route tree:
```
/ (root layout — sidebar nav + header)
├── /login (public)
├── /dashboard (authenticated)
├── /courses (authenticated)
├── /classes (authenticated)
│   └── /classes/$classId (class detail)
│       ├── /classes/$classId/students (enrolled students)
│       └── /classes/$classId/sessions (sessions list)
│           └── /classes/$classId/sessions/$sessionId/attendance (attendance sheet)
├── /students (authenticated, admin sees all, teacher sees own)
└── /users (admin only)
```

**Why code-based**: The project is small enough that file-based routing adds unnecessary tooling complexity. Code-based gives explicit control over route guards and data loading.

**Auth guard pattern**: A `beforeLoad` hook on the root authenticated layout that checks session status (via `/api/auth/me` endpoint) and redirects to `/login` if unauthenticated.

### D6: Jalali Multi-Date Picker

**Choice**: Use `react-multi-date-picker` library with its Persian calendar plugin and built-in multi-select mode.

**Why**: Purpose-built for exactly this use case — Jalali calendar with multi-date selection. Well-maintained (400+ GitHub stars), supports React 18/19, has locale support for Persian. Building a custom Jalali picker from scratch would be significant effort for a solved problem.

**Integration**: The picker sends selected dates to the backend as ISO (Gregorian) date strings. All Jalali ↔ Gregorian conversion happens client-side via the library. Backend is calendar-agnostic.

### D7: Request Body Parsing

**Choice**: A shared `parseBody<T>(req, schema)` utility that reads the raw Node.js request stream, parses JSON, and validates against a Zod schema.

**Why**: The custom HTTP server has no built-in body parsing (no Express `req.body`). A single utility keeps this consistent across all routes. Zod validation at the boundary ensures services receive clean, typed data.

### D8: Test Infrastructure

**Choice**: Vitest with in-memory SQLite via `better-sqlite3` driver, Prisma pushes schema to fresh in-memory DB before each test suite.

```typescript
// tests/setup.ts
export async function createTestDb() {
  // Create in-memory SQLite Prisma client
  // Push schema
  // Return { prisma, cleanup }
}
```

**Test pattern**: Each test file imports `createTestDb()`, gets a fresh Prisma client, calls service functions directly, asserts results. No HTTP layer in unit tests — services are tested in isolation.

**Why in-memory SQLite over mocks**: Real queries, real constraints, real behavior. A uniqueness violation in production will also fail in tests. Mock-based tests can pass while production breaks on query edge cases.

### D9: API Response Format

**Choice**: Consistent JSON envelope for all API responses:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Human-readable message" }
```

This is consistent with the existing `response.ts` helper (`sendJson`). All new routes use the same pattern.

### D10: ID Generation

**Choice**: Use `cuid2` for all entity IDs. CUIDs are URL-safe, globally unique, sortable, and don't leak creation timing like UUIDs v1.

**Why not autoincrement**: Auto-increment IDs leak entity count and ordering, making enumeration attacks trivial. CUIDs are standard practice for web APIs.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large scope — 9 models + full CRUD + auth in one change | Phased task breakdown with clear dependency order. Each module is independent once schema exists. |
| In-memory SQLite may behave differently from Turso in edge cases | SQLite is the common denominator. Turso is SQLite-compatible. Test on both during integration. |
| `bcrypt` pure-JS performance on login | Cost factor 12 is ~250ms per hash — acceptable for login. Not on hot paths. |
| Custom router lacks middleware chaining | Auth/role guards are function wrappers, not true middleware. Works for current scale but may need refactoring if route count exceeds ~50. |
| `react-multi-date-picker` adds a 3rd-party UI dependency | Library is actively maintained and purpose-built. The alternative (building from scratch) is weeks of work. |
| Session cookie + SPA routing may conflict with preflight CORS | SameSite=Lax + same-origin deployment avoids this. CORS middleware already exists for dev. |
| No migration system — using `prisma db push` | Acceptable for v1 / pre-production. Switch to `prisma migrate` before production data matters. |
