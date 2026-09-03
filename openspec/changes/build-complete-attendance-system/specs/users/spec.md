## Purpose

Defines administrative user management capabilities for the Bytic Attendance System, enabling administrators to create, list, retrieve, update, role-assign, and delete teacher and administrator user accounts with strict role-based access control.

## ADDED Requirements

### Requirement: Admin-Only User Creation
The system SHALL allow only authenticated users with the `ADMIN` role to create new user accounts. The user creation request MUST require `name`, `email`, `password`, and `role` (`ADMIN` or `TEACHER`). The system SHALL securely hash the password before saving the record and return the created user details excluding the password.

#### Scenario: Admin successfully creates a new user
- **WHEN** an authenticated admin sends a valid creation payload with name, email, password, and role (`TEACHER` or `ADMIN`)
- **THEN** the system creates the user record with the password securely hashed and returns HTTP 201 Created with the user entity excluding sensitive password data

#### Scenario: User creation with missing required fields
- **WHEN** an admin sends a creation request missing any of name, email, password, or role
- **THEN** the system rejects the request with HTTP 400 Bad Request and validation error details

### Requirement: Unique User Email Enforcement
The system SHALL enforce email address uniqueness across all user accounts. Attempting to create a user or update an existing user with an email address already registered in the system SHALL be rejected.

#### Scenario: User creation with duplicate email is rejected
- **WHEN** an admin attempts to create a user with an email address that already belongs to an existing user
- **THEN** the system rejects the request with HTTP 409 Conflict (or HTTP 400 Bad Request) indicating the email is already in use

### Requirement: Admin-Only User Listing and Retrieval
The system SHALL allow only authenticated users with the `ADMIN` role to retrieve the list of all user accounts or retrieve individual user profile details. The returned user objects SHALL contain `id`, `name`, `email`, `role`, and timestamps, but MUST never include password hashes.

#### Scenario: Admin lists all users
- **WHEN** an authenticated admin requests the user list endpoint
- **THEN** the system returns HTTP 200 OK containing an array of user accounts with their roles and profile information, without password data

#### Scenario: Admin retrieves specific user by ID
- **WHEN** an authenticated admin requests user details by a valid user ID
- **THEN** the system returns HTTP 200 OK with the corresponding user profile details

#### Scenario: Admin requests non-existent user ID
- **WHEN** an authenticated admin requests user details with an ID that does not exist
- **THEN** the system returns HTTP 404 Not Found

### Requirement: Admin-Only User Profile and Role Updates
The system SHALL allow only authenticated users with the `ADMIN` role to update an existing user's profile information, including modifying their name, email address, or assigning a new role (`ADMIN` or `TEACHER`).

#### Scenario: Admin updates user role
- **WHEN** an admin updates a user's role from `TEACHER` to `ADMIN`
- **THEN** the system updates the record in the database and returns the updated user profile reflecting the new role

#### Scenario: Admin updates user profile name and email
- **WHEN** an admin updates a user's name or email to a unique address
- **THEN** the system saves the changes and returns HTTP 200 OK with the updated user data

### Requirement: Administrative Password Reset
The system SHALL allow authenticated users with the `ADMIN` role to reset a user's password. The new password MUST be securely hashed before updating the user record.

#### Scenario: Admin resets user password
- **WHEN** an admin submits a password reset request for a target user with a new password
- **THEN** the system hashes the new password, updates the user's credential in the database, and returns a success response

### Requirement: User Account Deletion and Self-Deletion Prevention
The system SHALL allow authenticated users with the `ADMIN` role to delete existing user accounts. The system MUST prevent administrators from deleting their own currently authenticated user account to safeguard administrative access.

#### Scenario: Admin deletes another user account
- **WHEN** an authenticated admin submits a deletion request for another user's ID
- **THEN** the system removes the user record and any associated session records, returning a success response

#### Scenario: Admin attempts to delete their own account
- **WHEN** an authenticated admin submits a deletion request targeting their own user ID
- **THEN** the system rejects the deletion request with HTTP 400 Bad Request or HTTP 403 Forbidden with an error explaining that self-deletion is disallowed

### Requirement: Role-Based Access Restriction for Non-Admin Users
The system SHALL deny access to all user management endpoints (creation, listing, retrieval, update, deletion, and password reset) for requests authenticated with the `TEACHER` role or unauthenticated requests.

#### Scenario: Teacher attempts to access user management
- **WHEN** an authenticated user with the `TEACHER` role attempts to access any user management endpoint
- **THEN** the system rejects the request with HTTP 403 Forbidden

#### Scenario: Unauthenticated request to user management
- **WHEN** an unauthenticated client attempts to access any user management endpoint
- **THEN** the system rejects the request with HTTP 401 Unauthorized
