## Purpose

Provides secure self-service and administrative password reset capabilities with password complexity enforcement, confirmation verification, visibility toggling, and role-differentiated session lifecycle handling.

## ADDED Requirements

### Requirement: Self-Service Password Reset
The system SHALL allow authenticated users to reset their own password. The user MUST provide their current password, a new password that satisfies the complexity policy, and a confirmation password identical to the new password. Upon successful self-service reset, the system MUST update the password hash and MUST preserve the user's active authentication session so their current login remains uninterrupted.

#### Scenario: User successfully resets their own password
- **WHEN** an authenticated user submits their valid current password and a matching, complex new password
- **THEN** the system updates the stored password hash, returns HTTP 200 OK, and keeps the user's current session active

#### Scenario: User provides an incorrect current password
- **WHEN** an authenticated user attempts self-service reset with an invalid current password
- **THEN** the system rejects the request with HTTP 400 Bad Request and does not alter the password hash

#### Scenario: User submits mismatched new and confirmation passwords
- **WHEN** a user enters non-matching values for new password and confirmation password
- **THEN** the system blocks submission with a client validation error and rejects any direct request with HTTP 400 Bad Request

### Requirement: Administrative Password Reset
The system SHALL allow authenticated users with the `ADMIN` role to reset the password for any user account. Administrative reset MUST NOT require the target user's current password. Upon completing an administrative password reset, the system MUST invalidate all existing sessions for the target user to enforce re-authentication with the new password.

#### Scenario: Administrator resets another user's password
- **WHEN** an authenticated administrator submits a complex new password and matching confirmation for a target user
- **THEN** the system updates the target user's password hash, deletes all active sessions for that user, and returns HTTP 200 OK

#### Scenario: Non-administrator attempts to reset another user's password
- **WHEN** a user without the `ADMIN` role attempts to reset the password of any account other than their own
- **THEN** the system rejects the request with HTTP 403 Forbidden

### Requirement: Password Complexity Policy
The system SHALL enforce that all new passwords set during password reset operations contain a minimum of 8 characters and include at least one alphabetic letter and at least one numeric digit.

#### Scenario: New password is shorter than 8 characters
- **WHEN** a new password with fewer than 8 characters is submitted
- **THEN** the system rejects the input with a descriptive validation error

#### Scenario: New password lacks required character classes
- **WHEN** a new password containing only letters or only digits is submitted
- **THEN** the system rejects the input indicating that both letters and numbers are required

#### Scenario: New password satisfies all complexity rules
- **WHEN** a new password containing 8 or more alphanumeric characters is submitted
- **THEN** the system accepts the password for hashing and persistence

### Requirement: Password Reset UI and Visibility Controls
The system SHALL provide interactive password reset dialogs with show/hide password visibility toggles on all password input fields. The interface MUST provide accessible entry points: within the user account profile card in the mobile drawer (`MobileDrawer`) and desktop sidebar (`Sidebar`) for self-service reset, and within individual user cards on the user management page (`UsersPage`) for administrators.

#### Scenario: User toggles password visibility
- **WHEN** a user clicks the visibility toggle icon next to any password input
- **THEN** the system toggles between masked (`password`) and plaintext (`text`) input display

#### Scenario: User opens self-service reset from mobile drawer
- **WHEN** a logged-in user on mobile taps "تغییر رمز عبور" (Change Password) in the navigation drawer
- **THEN** the system displays the reset modal preconfigured for self-service with current password, new password, and confirmation fields

#### Scenario: Administrator opens reset dialog for another user
- **WHEN** an administrator clicks "تغییر رمز" on a user card in the user management page
- **THEN** the system displays the reset modal preconfigured for administrative reset without asking for the target user's current password
