## 1. Foundation — Dependencies & Prisma Schema

- [x] 1.1 Install backend dependencies: `bcrypt`, `@types/bcrypt`, `cuid2` (ID generation), `better-sqlite3` (test DB driver)
- [x] 1.2 Install frontend dependencies: `@tanstack/react-router`, `react-multi-date-picker` (Jalali multi-date picker)
- [x] 1.3 Define complete Prisma schema with all 9 models: Course, Class, Student, User, ClassTeacher, ClassStudent, Session, AttendanceRecord, AuthSession — including enums (Role: ADMIN/TEACHER, Gender: MALE/FEMALE), composite uniques, and cuid2 default IDs
- [x] 1.4 Run `prisma db push` and `prisma generate` to sync schema and generate client
- [x] 1.5 Create admin seed script (`prisma/seed.ts`) that creates an initial admin user with hashed password

## 2. Backend Infrastructure — Shared Utilities

- [x] 2.1 Create `api/_lib/body-parser.ts` — `parseBody<T>(req, zodSchema)` utility for reading request stream and validating with Zod
- [x] 2.2 Create `api/_lib/auth.ts` — auth middleware: `requireAuth(handler)` (reads cookie, validates session, attaches user), `requireAdmin(handler)` (admin-only guard)
- [x] 2.3 Create `api/_lib/validation.ts` — shared Zod schemas for all domain entities (reusable across routes and tests)
- [x] 2.4 Create `api/_lib/cookies.ts` — cookie parsing utility (read `session_token` from `Cookie` header) and `setSessionCookie` / `clearSessionCookie` helpers
- [x] 2.5 Update `api/_lib/router.ts` — add route registration from all new domain modules in a central `registerAllRoutes()` function

## 3. Test Infrastructure

- [x] 3.1 Create `tests/setup.ts` — `createTestDb()` function: provisions in-memory SQLite via PrismaLibSQL adapter, pushes schema, returns `{ prisma, cleanup }` tuple
- [x] 3.2 Create `tests/helpers.ts` — shared test factories: `createTestUser()`, `createTestCourse()`, `createTestClass()`, `createTestStudent()`, `createTestSession()` with sensible defaults
- [x] 3.3 Update `vitest.config.ts` — configure test environment for in-memory SQLite, set `setupFiles` and `testTimeout`
- [x] 3.4 Verify test infrastructure works: write a smoke test that creates a DB, seeds a user, queries it, and cleans up

## 4. Auth Module (TDD)

- [x] 4.1 Write tests for `api/auth/service.ts`: login with correct credentials, login with wrong password, login with non-existent email, session creation with 90-day expiry, session validation (valid token, expired token, invalid token), logout/session deletion
- [x] 4.2 Implement `api/auth/service.ts` — `login(prisma, email, password)`, `validateSession(prisma, token)`, `logout(prisma, token)`, `getCurrentUser(prisma, token)`
- [x] 4.3 Create `api/auth/routes.ts` — `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (returns current user from session)
- [x] 4.4 Wire auth middleware into the server — all `/api/*` routes except `/api/auth/login` require valid session

## 5. Users Module (TDD)

- [x] 5.1 Write tests for `api/users/service.ts`: create user (admin), create user (non-admin rejected), list users, get user by ID, update user (name/email/role), password reset, delete user, self-deletion prevention, email uniqueness enforcement
- [x] 5.2 Implement `api/users/service.ts` — `createUser`, `listUsers`, `getUserById`, `updateUser`, `resetPassword`, `deleteUser`
- [x] 5.3 Create `api/users/routes.ts` — full CRUD at `/api/users`, `/api/users/:id`, `POST /api/users/:id/reset-password` (all admin-only)

## 6. Courses Module (TDD)

- [x] 6.1 Write tests for `api/courses/service.ts`: create course, list courses, get course by ID, update course, delete course, create with empty name (rejected), delete course with existing classes (cascade or reject behavior)
- [x] 6.2 Implement `api/courses/service.ts` — `createCourse`, `listCourses`, `getCourseById`, `updateCourse`, `deleteCourse`
- [x] 6.3 Create `api/courses/routes.ts` — CRUD at `/api/courses`, `/api/courses/:id` (create/update/delete admin-only, read any authenticated)

## 7. Classes Module (TDD)

- [x] 7.1 Write tests for `api/classes/service.ts`: create class (admin), list classes (admin sees all, teacher sees own), get class with teachers and students, update class, delete class (admin), assign/remove teacher, enroll/unenroll student, teacher scope filtering
- [x] 7.2 Implement `api/classes/service.ts` — `createClass`, `listClasses(userId, role)`, `getClassById`, `updateClass`, `deleteClass`, `assignTeacher`, `removeTeacher`, `enrollStudent`, `unenrollStudent`
- [x] 7.3 Create `api/classes/routes.ts` — CRUD at `/api/classes`, `/api/classes/:id`, sub-routes: `POST /api/classes/:id/teachers`, `DELETE /api/classes/:id/teachers/:userId`, `POST /api/classes/:id/students`, `DELETE /api/classes/:id/students/:studentId`

## 8. Students Module (TDD)

- [x] 8.1 Write tests for `api/students/service.ts`: create student, list students (admin sees all, teacher sees enrolled in own classes), get student with enrollments, update student, delete student (admin only), field validation (required name, gender enum, optional about)
- [x] 8.2 Implement `api/students/service.ts` — `createStudent`, `listStudents(userId, role)`, `getStudentById`, `updateStudent`, `deleteStudent`
- [x] 8.3 Create `api/students/routes.ts` — CRUD at `/api/students`, `/api/students/:id`

## 9. Sessions Module (TDD)

- [x] 9.1 Write tests for `api/sessions/service.ts`: create single session, bulk-create sessions (multiple dates + one time window), list sessions for a class, get session by ID, update session time/date, delete session, teacher scope enforcement (can only manage sessions in assigned classes), bulk-create atomicity (all-or-none)
- [x] 9.2 Implement `api/sessions/service.ts` — `createSession`, `bulkCreateSessions(classId, dates[], startTime, endTime)`, `listSessionsByClass`, `getSessionById`, `updateSession`, `deleteSession`
- [x] 9.3 Create `api/sessions/routes.ts` — CRUD at `/api/sessions`, `/api/sessions/:id`, `POST /api/sessions/bulk`

## 10. Attendance Module (TDD)

- [x] 10.1 Write tests for `api/attendance/service.ts`: get attendance sheet (lists enrolled students with status), mark present (creates/updates record with timestamp), mark absent (toggles back), toggle idempotency, teacher scope enforcement, non-enrolled student rejected, attendance for non-existent session
- [x] 10.2 Implement `api/attendance/service.ts` — `getAttendanceSheet(prisma, sessionId)`, `toggleAttendance(prisma, sessionId, studentId, present)`
- [x] 10.3 Create `api/attendance/routes.ts` — `GET /api/sessions/:sessionId/attendance`, `POST /api/sessions/:sessionId/attendance`

## 11. Frontend — Routing & Layout

- [x] 11.1 Install and configure TanStack Router / SPA View Router — create route tree with code-based definitions
- [x] 11.2 Create root layout component with sidebar navigation (role-aware menu items) and header
- [x] 11.3 Create `LoginPage` — email/password form, POST to `/api/auth/login`, redirect to dashboard on success
- [x] 11.4 Implement auth guard — `beforeLoad` / session check hook that calls `GET /api/auth/me`, redirects to `/login` if unauthenticated
- [x] 11.5 Create auth context/hook — `useAuth()` providing current user, role, login/logout functions
- [x] 11.6 Create `DashboardPage` — landing page after login showing summary/overview

## 12. Frontend — CRUD Pages

- [x] 12.1 Create `CoursesPage` — list courses in table/card view, create/edit dialog (admin), delete button (admin)
- [x] 12.2 Create `ClassesPage` — list classes (filtered by role), create/edit dialog, teacher assignment UI (admin), student enrollment UI
- [x] 12.3 Create `ClassDetailPage` (`/classes/$classId`) — tabbed view with class info, enrolled students, assigned teachers, sessions
- [x] 12.4 Create `StudentsPage` — list students (filtered by role), create/edit dialog, enrollment info
- [x] 12.5 Create `UsersPage` (admin only) — list users, create/edit dialog, role assignment, password reset

## 13. Frontend — Sessions & Attendance

- [x] 13.1 Create session creation form with Jalali multi-date picker (`react-multi-date-picker` with Persian calendar), start/end time inputs, class selector
- [x] 13.2 Create `SessionsListView` — sessions for a class, sorted by date, with edit/delete actions
- [x] 13.3 Create `AttendanceSheetPage` (`/classes/$classId/sessions/$sessionId/attendance`) — table of enrolled students with present/absent toggle (check icon), real-time toggle via POST
- [x] 13.4 Style attendance toggle — clear visual distinction between present (green check) and absent (default/empty), with loading state during API call

## 14. Frontend — API Integration & Polish

- [x] 14.1 Create TanStack Query hooks for all API endpoints: `useAuth`, `useCourses`, `useClasses`, `useStudents`, `useUsers`, `useSessions`, `useAttendance`
- [x] 14.2 Add Paraglide i18n messages for all new UI strings (Persian + English)
- [x] 14.3 Add error handling and toast notifications (sonner) for all CRUD operations
- [x] 14.4 Ensure all UI follows RTL-first rules (CSS logical properties, no hardcoded ltr/rtl)
- [x] 14.5 Responsive design pass — verify all pages work on mobile viewport

## 15. Integration & Verification

- [x] 15.1 Run full test suite (`vitest run`) — all backend service tests pass
- [x] 15.2 End-to-end smoke test: login as admin → create course → create class → assign teacher → enroll student → create session (bulk) → mark attendance
- [x] 15.3 Test teacher scope: login as teacher → verify can only see/manage assigned classes, sessions, and students
- [x] 15.4 Build check: `tsc -b && vite build` completes without errors
- [x] 15.5 Docker build verification: `docker build` succeeds and container starts correctly
