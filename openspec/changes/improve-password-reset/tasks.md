## 1. Backend Validation & Service Layer

- [x] 1.1 Update `resetPasswordSchema` in `api/_lib/validation.ts` to require at least 8 characters containing both letters and numbers, and accept optional `currentPassword`, verified by Zod schema tests.
- [x] 1.2 Update `resetPassword` in `api/users/service.ts` to verify `currentPassword` when provided and conditionally invalidate sessions only for administrative resets, verified by service unit tests.
- [x] 1.3 Add service-level unit tests in `tests/users.test.ts` verifying self-service reset, incorrect current password rejection, and session preservation vs invalidation.

## 2. API Route & Authorization Guard

- [x] 2.1 Update `POST /api/users/:id/reset-password` in `api/users/routes.ts` using `requireAuth` to permit administrators or the matching authenticated user (`currentUser.id === params.id`), returning 403 otherwise.
- [x] 2.2 Add API integration tests in `tests/api_integration.test.ts` verifying that teachers can reset their own password with valid current password, cannot reset another user's password (403), and admins can reset any user's password.

## 3. Frontend Components & User Interface

- [x] 3.1 Update `useResetPassword` mutation hook in `src/hooks/useData.ts` to accept optional `currentPassword` in the request payload.
- [x] 3.2 Create reusable `src/components/ResetPasswordDialog.tsx` featuring show/hide visibility toggles (`Eye` / `EyeOff`), dynamic self vs. administrative mode, complexity hints, and real-time confirmation matching.
- [x] 3.3 Add the "Change Password" action to the user account card in `src/components/Sidebar.tsx` (desktop) and `src/components/MobileDrawer.tsx` (mobile) opening the self-service dialog.
- [x] 3.4 Refactor `src/pages/UsersPage.tsx` to use the unified `ResetPasswordDialog`, automatically routing the admin's own card to self-service and other cards to administrative reset.

## 4. End-to-End Verification

- [x] 4.1 Run full test suite with `npm test` and verify all tests pass cleanly.
- [x] 4.2 Run TypeScript typecheck (`npx tsc --noEmit`) and Vite build (`npm run build`) to ensure zero typing or compilation errors.
