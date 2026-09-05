## Context

The application currently manages screen transitions via local state (`useState`) in [`src/App.tsx`](file:///e:/arash/dev/projects/bytic/attendance/src/App.tsx). `@tanstack/react-router` (v1.170.32) is already installed in `package.json`. Server-side SPA fallback to `dist/index.html` is already supported in [`server/index.ts`](file:///e:/arash/dev/projects/bytic/attendance/server/index.ts) and the Vite dev server.

## Goals / Non-Goals

**Goals:**
- Implement a type-safe code-based TanStack Router tree that coordinates all views in `src/pages/`.
- Support bookmarkable and shareable URLs for all primary entities (`/classes/:classId` and `/sessions/:sessionId/attendance`).
- Enable native browser back/forward history navigation across all sections.
- Centralize route-level authentication and role authorization guards using TanStack Router context.
- Replace prop-drilled tab selection callbacks in `Sidebar` and `MobileDrawer` with declarative `<Link>` components.
- Eliminate duplicate provider instantiations (`QueryClientProvider`, `I18nProvider`) between `main.tsx` and `App.tsx`.

**Non-Goals:**
- Migrate to file-based routing or introduce `@tanstack/router-plugin` code generation.
- Modify the existing data fetching layer (`useData.ts` React Query hooks) or API routes.
- Redesign UI components in `src/pages/` beyond routing integration (params/links).

## Decisions

### 1. Code-Based Router Configuration in `src/router.tsx`
- **Decision**: Define routes programmatically using `createRootRouteWithContext()`, `createRoute()`, and `createRouter()`. Register the router type via `declare module '@tanstack/react-router'`.
- **Rationale**: Keeps existing `src/pages/` structure completely untouched, avoids adding Vite plugins or watching auto-generated `.gen.ts` files, and provides instant TypeScript safety.
- **Alternative considered**: File-based routing with `src/routes/` and `@tanstack/router-plugin` — rejected per user preference and to minimize tooling complexity.

### 2. URL Schema & Flat Session Attendance
- **Decision**: Adopt a flat URL structure for attendance sessions:
  - `/`: Redirects to `/dashboard`
  - `/login`: Public login page
  - `/dashboard`: Dashboard overview
  - `/courses`: Courses list
  - `/classes`: Classes list
  - `/classes/:classId`: Class details, roster, and sessions
  - `/sessions/:sessionId/attendance`: Session attendance sheet
  - `/students`: Student directory
  - `/users`: User and teacher management (Admin only)
- **Rationale**: Flat session URLs (`/sessions/:sessionId/attendance`) keep links concise and independent of class ID nesting since `sessionId` is unique (`cuid2`).
- **Alternative considered**: Nested `/classes/:classId/sessions/:sessionId` — rejected in favor of concise flat URLs.

### 3. Centralized Router Context & Guard Flow
- **Decision**: Pass an explicit context interface to the router:
  ```ts
  export interface RouterContext {
    auth: AuthContextType;
    queryClient: QueryClient;
  }
  ```
  An authenticated shell route acts as parent to protected pages. Its `beforeLoad` checks `context.auth`:
  - If `auth.isLoading` is true, pause or show loading spinner.
  - If `!auth.user`, throw `redirect({ to: '/login', search: { redirect: location.href } })`.
  - On `/users`, check `auth.isAdmin`; if not admin, throw `redirect({ to: '/dashboard' })`.
  - On `/login`, if `auth.user` exists, throw `redirect({ to: search.redirect || '/dashboard' })`.
- **Rationale**: Clean separation of route security concerns from visual presentation components.

### 4. Layout & Navigation Refactoring
- **Decision**:
  - The authenticated layout route renders `Header`, `Sidebar`, `MobileDrawer`, and `<Outlet />`.
  - `Sidebar` and `MobileDrawer` use `<Link to={item.to}>` with `activeProps` for styling instead of taking `currentTab` and `onSelectTab` props.
  - `ClassesPage` cards wrap or trigger navigation to `/classes/$classId`.
  - `ClassDetailPage` reads `classId` from route parameters and links to `/sessions/$sessionId/attendance`.
  - `AttendanceSheetPage` reads `sessionId` from route parameters and links back to the class or uses browser history back.

### 5. Application Root & Provider Pipeline
- **Decision**: In `src/main.tsx` / `src/App.tsx`, arrange providers in order:
  ```
  QueryClientProvider
    └── ThemeProvider
          └── I18nProvider
                └── AuthProvider
                      └── InnerApp (uses useAuth to pass auth to RouterProvider)
  ```
  Remove duplicate `QueryClientProvider` and `I18nProvider` from `src/App.tsx`.

## Risks / Trade-offs

- **[Risk] Auth loading flicker on page refresh**
  → *Mitigation*: In the root component or router shell, render the splash spinner (`Sparkles` pulse) whenever `auth.isLoading` is true, avoiding premature redirects.
- **[Risk] Browser back button after login**
  → *Mitigation*: Use `replace: true` when redirecting from `/login` to `/dashboard` so the user does not cycle back to `/login` when clicking back.
- **[Risk] Type safety of dynamic route params**
  → *Mitigation*: Use TanStack Router's `useParams({ from: '...' })` to ensure `classId` and `sessionId` are strictly typed as strings.
