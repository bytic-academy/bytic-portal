## Why

Currently, password reset is restricted exclusively to administrators via the `/api/users/:id/reset-password` endpoint and the admin-only `/users` page. Non-admin users (such as teachers) have no way to change their own password without administrator intervention. Furthermore, the existing reset form only presents a single unconfirmed input, allows short passwords (minimum 6 characters) without complexity checks, and aggressively terminates all active user sessions regardless of whether the reset was performed by an administrator or the user themselves.

## What Changes

- **Self-Service & Administrative Authorization**: Allow password reset by either an `ADMIN` or the account owner (`currentUser.id === targetId`). Non-admin users can reset their own password, while admins can reset any user's password.
- **Current Password Verification for Self-Reset**: Require users resetting their own password to verify their current password. Administrators resetting another user's account do not require the user's current password.
- **Session Handling Distinction**:
  - Administrative reset terminates all existing sessions for the target user, forcing re-authentication.
  - Self-service reset preserves active sessions so the user remains logged in seamlessly.
- **Password Complexity Enforcement**: Enforce a minimum of 8 characters containing both letters and numbers, with confirmation password verification.
- **Show/Hide Password Visibility Toggle**: Add toggleable visibility (eye icon) across current, new, and confirmation password inputs.
- **Self-Service UI Entry Points**:
  - Add a "Change Password" action in `MobileDrawer` (mobile) and `Sidebar` (desktop) within the user account profile card.
  - Retain the "Change Password" button on user cards in `UsersPage` for admins, adapting dynamically between self-reset and administrative reset depending on whether the card belongs to the logged-in admin.

## Capabilities

### New Capabilities
- `password-reset`: Secure self-service and administrative password reset with complexity validation, confirmation matching, eye toggle controls, and differentiated session invalidation rules.

### Modified Capabilities
<!-- None: Core specs under openspec/specs/ (attendance-system, ui-and-theming) remain intact without requirement alterations -->

## Impact

- **API Surface**:
  - `POST /api/users/:id/reset-password`: Guard changed from `requireAdmin` to `requireAuth` with role/ownership checks (`ADMIN` or `currentUser.id === id`).
  - Request body validation: requires `password` (min 8 chars, alphanumeric) and conditionally requires `currentPassword` when `currentUser.id === id`.
- **Backend Service**:
  - `api/users/service.ts`: `resetPassword` updated to verify current password for self-resets, and conditionally skip session deletion when the user resets their own credentials.
- **Frontend Components**:
  - New shared `ResetPasswordDialog` component with current password input (conditional), new password input, confirmation input, complexity hints, and visibility toggles.
  - `src/components/Sidebar.tsx` and `src/components/MobileDrawer.tsx`: Integrated password reset trigger in the user profile area.
  - `src/pages/UsersPage.tsx`: Integrated the improved dialog with confirmation validation.
- **Tests**:
  - New and updated unit/integration tests covering self-service reset, administrative reset, incorrect current password rejection, unauthorized reset rejection (403), complexity validation, and session preservation vs invalidation.
