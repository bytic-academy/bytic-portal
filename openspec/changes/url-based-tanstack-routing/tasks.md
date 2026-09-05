## 1. Router Infrastructure & Context

- [x] 1.1 Create `src/router.tsx` defining the code-based TanStack Router tree with `RouterContext`, root route, public `/login` route, and authenticated layout route with `<Outlet />`.
- [x] 1.2 Implement route-level authentication guards and role authorization (`beforeLoad`) for protected routes and `/users` admin-only access.
- [x] 1.3 Register router types in `src/router.tsx` via `declare module '@tanstack/react-router'` for type safety.

## 2. Navigation Components Refactoring

- [x] 2.1 Refactor `src/components/Sidebar.tsx` to replace `onSelectTab` with TanStack Router `<Link>` and automatic active state styling.
- [x] 2.2 Refactor `src/components/MobileDrawer.tsx` to use `<Link>` with drawer auto-close upon navigation.
- [x] 2.3 Verify layout shell integration with `Header.tsx` and global toast notification system.

## 3. Page Route Adaptations & Deep Linking

- [x] 3.1 Update `src/pages/ClassesPage.tsx` to link each class card directly to `/classes/$classId`.
- [x] 3.2 Update `src/pages/ClassDetailPage.tsx` to extract `classId` from route parameters and navigate to flat attendance session URL `/sessions/$sessionId/attendance`.
- [x] 3.3 Update `src/pages/AttendanceSheetPage.tsx` to extract `sessionId` from route parameters and support back navigation to the origin class.
- [x] 3.4 Update `src/pages/DashboardPage.tsx` to link directly to `/classes` and specific `/classes/$classId` URLs.
- [x] 3.5 Update `src/pages/LoginPage.tsx` to read the `redirect` query parameter and navigate to the intended destination upon successful login.

## 4. Application Root Integration

- [x] 4.1 Refactor `src/App.tsx` to connect `RouterProvider` with `useAuth` state and remove in-memory state switching.
- [x] 4.2 Streamline `src/main.tsx` and `src/App.tsx` provider hierarchy to eliminate duplicate `QueryClientProvider` and `I18nProvider` instances.

## 5. Verification & Testing

- [x] 5.1 Run `npm run typecheck` to verify complete type safety across all route definitions and parameters.
- [x] 5.2 Run automated test suite (`npm run test`) to ensure no regressions in existing data and integration tests.
- [x] 5.3 Validate deep linking, browser history back/forward traversal, and authentication redirects.
