## Context

Currently, `POST /api/users/:id/reset-password` is wrapped with `requireAdmin` in `api/users/routes.ts`, and `resetPassword` in `api/users/service.ts` unconditionally deletes all active auth sessions in SQLite. On the frontend, only `UsersPage.tsx` provides a reset password dialog (restricted to admins), with a single unconfirmed password input that accepts any password of 6+ characters.

See `proposal.md` for motivation and `specs/password-reset/spec.md` for normative requirements.

## Goals / Non-Goals

**Goals:**
- Enable teachers and administrators to reset their own passwords securely without administrative intervention.
- Allow administrators to reset passwords for other accounts without needing the target user's current password.
- Differentiate session invalidation: keep the active session intact for self-service reset; invalidate all target user sessions on administrative reset.
- Enforce password complexity (min 8 characters, alphanumeric) and confirmation password match both on the frontend and backend.
- Provide responsive UI access points on both mobile drawer and desktop sidebar with interactive show/hide password visibility toggles.

**Non-Goals:**
- Automated email-based forgot password reset links or OTP SMS flows (account recovery continues through administrative reset).
- Password history tracking (e.g., disallowing the last 3 passwords).
- Multi-factor authentication (MFA).

## Decisions

### 1. Unified Route with Subject vs. Actor Authorization
- **Decision**: Retain `POST /api/users/:id/reset-password` as the single canonical endpoint, protected by `requireAuth`. Inside the handler, evaluate actor permissions:
  ```typescript
  const currentUser = getAuthUser(req);
  const isSelf = currentUser.id === params.id;
  const isAdmin = currentUser.role === 'ADMIN';

  if (!isAdmin && !isSelf) {
    sendJson(res, 403, { success: false, error: 'Access denied' });
    return;
  }
  ```
- **Rationale**: Avoids redundant endpoints (`/api/auth/change-password` vs `/api/users/:id/reset-password`) while preserving RESTful URI semantics.
- **Alternatives Considered**: Creating `/api/auth/change-password` for self-service and keeping `/api/users/:id/reset-password` for admin-only. Rejected because it fragments user password management across two distinct route trees.

### 2. Conditional Current Password Verification
- **Decision**: Update `resetPasswordSchema` to require a complex password ($\ge 8$ characters, matching `/^(?=.*[a-zA-Z])(?=.*\d)/`) and accept an optional `currentPassword`.
  - When `isSelf === true`: `currentPassword` is mandatory. The service verifies `currentPassword` with `bcrypt.compare(currentPassword, targetUser.passwordHash)`. If mismatched, it returns HTTP 400.
  - When `isAdmin === true` and `!isSelf`: `currentPassword` is not required or checked.
- **Rationale**: Prevents session hijacking where an unlocked workstation could allow an attacker to change a user's password without knowing their current credential.

### 3. Differentiated Session Lifecycle
- **Decision**: Pass `preserveSessions: boolean` (or derive from `isSelf`) to `resetPassword(prisma, id, newPassword, options)`.
  - For administrative reset: `await prisma.authSession.deleteMany({ where: { userId: id } })`.
  - For self-service reset: skip session deletion, keeping the user's existing HttpOnly session cookie valid.
- **Rationale**: Forcing self-service users to log in again immediately creates unnecessary friction, whereas admin resets are typically done for compromised or forgotten accounts where active sessions must be terminated.

### 4. Shared `<ResetPasswordDialog>` Component
- **Decision**: Extract password reset UI into a reusable component (`src/components/ResetPasswordDialog.tsx`) used across:
  - `src/components/Sidebar.tsx` (desktop user card)
  - `src/components/MobileDrawer.tsx` (mobile slide-out menu)
  - `src/pages/UsersPage.tsx` (administrative user table/cards)
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `targetUser: { id: string; name: string }`
  - `isSelf: boolean`
- **Rationale**: Ensures identical validation, RTL/LTR styling, accessibility, and visibility toggle behavior across all entry points.

### 5. Visibility Toggle (`Eye` / `EyeOff`)
- **Decision**: Provide an eye toggle icon button inside each password field (current, new, confirm) utilizing `lucide-react` icons and accessible button controls.
- **Rationale**: Essential for mobile UX where typing complex passwords on software keyboards frequently leads to mistyping.

## Risks / Trade-offs

- **[Risk] Admin changing their own password via UsersPage**: An admin clicking "تغییر رمز" on their own card in `UsersPage` could be treated as an admin reset and bypass the current password check.
  - **Mitigation**: The dialog checks `currentUser.id === targetUser.id`. If true, it automatically switches to the self-service flow (requiring current password and preserving session).
- **[Risk] Existing user passwords with < 8 chars**: Users whose current password is 6 characters will not be blocked from logging in, but must choose an 8+ character complex password when resetting.
  - **Mitigation**: The complexity regex is only enforced during reset/creation, never during login credential verification.

## Migration Plan

1. Update `api/_lib/validation.ts` schema for `resetPasswordSchema`.
2. Update `api/users/service.ts` and `api/users/routes.ts` with authorization and session logic.
3. Update `useResetPassword` mutation hook in `src/hooks/useData.ts` to accept `currentPassword`.
4. Build `src/components/ResetPasswordDialog.tsx`.
5. Integrate dialog into `Sidebar.tsx`, `MobileDrawer.tsx`, and `UsersPage.tsx`.
6. Add unit and integration tests in `tests/users.test.ts` and `tests/api_integration.test.ts`.
