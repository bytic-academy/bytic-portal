## Why

The application currently relies entirely on local component state (`useState`) in `App.tsx` for view switching. As a result, page reloads reset the application to the dashboard, browser history buttons (back/forward) do not navigate between pages, and deep linking or bookmarking specific classes or attendance sessions is impossible. 

Introducing URL-based routing powered by TanStack Router solves these issues, establishing bookmarkable URLs, native browser history integration, centralized route-level authentication guards, and clean declarative links across all navigation menus and cards.

## What Changes

- Implement a type-safe **code-based TanStack Router** configuration in `src/router.tsx` that links existing pages in `src/pages/`.
- Establish clean URL patterns:
  - Public `/login` route.
  - Authenticated shell layout covering `/dashboard`, `/courses`, `/classes`, `/classes/:classId`, `/sessions/:sessionId/attendance`, `/students`, and admin-only `/users`.
  - Default index redirect `/` -> `/dashboard`.
- Refactor navigation components ([`Sidebar`](file:///e:/arash/dev/projects/bytic/attendance/src/components/Sidebar.tsx), [`MobileDrawer`](file:///e:/arash/dev/projects/bytic/attendance/src/components/MobileDrawer.tsx), [`Header`](file:///e:/arash/dev/projects/bytic/attendance/src/components/Header.tsx)) to use TanStack Router `<Link>` with active styling instead of state callbacks.
- Update [`ClassesPage`](file:///e:/arash/dev/projects/bytic/attendance/src/pages/ClassesPage.tsx), [`ClassDetailPage`](file:///e:/arash/dev/projects/bytic/attendance/src/pages/ClassDetailPage.tsx), and [`DashboardPage`](file:///e:/arash/dev/projects/bytic/attendance/src/pages/DashboardPage.tsx) to use URL params and declarative navigation instead of prop drilling.
- Add route-level authentication & role authorization checks (`beforeLoad` / layout guards) redirecting unauthenticated users to `/login?redirect=...`.
- Clean up redundant provider wrapping in `src/App.tsx` and `src/main.tsx`.

## Capabilities

### New Capabilities
- `url-routing`: URL-based client-side routing, deep linking, parameter resolution, history navigation, and route guards using TanStack Router.

### Modified Capabilities
<!-- None -->

## Impact

- Frontend entry points: `src/main.tsx`, `src/App.tsx`.
- Layout components: `src/components/Sidebar.tsx`, `src/components/MobileDrawer.tsx`.
- Page components: `src/pages/ClassesPage.tsx`, `src/pages/ClassDetailPage.tsx`, `src/pages/AttendanceSheetPage.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/LoginPage.tsx`.
- Dependencies: `@tanstack/react-router` (already installed in `package.json`).
- Backend/Server: Node.js server (`server/index.ts`) already handles SPA index.html fallback for client-side routing.
