## Purpose

Provides secure user authentication, database-backed session management, and credential verification for the Bytic Attendance System, enabling authenticated users to access protected application resources via secure HTTP-only cookies.

## ADDED Requirements

### Requirement: User Login and Session Issuance
The authentication system SHALL provide a login endpoint that accepts valid user credentials (`email` and `password`). Upon verifying the credentials against the securely hashed password, the system SHALL generate a cryptographically random session token, persist the session record in the database with a 90-day expiration, and return an HTTP response setting an HTTP-only cookie (`SameSite=Lax`, 90-day `Max-Age`).

#### Scenario: Successful login with valid credentials
- **WHEN** a user submits valid email and password credentials to the login endpoint
- **THEN** the system verifies the password, creates a new database session record with a 90-day expiration, returns a successful response, and sets an HTTP-only session cookie with `SameSite=Lax` and 90-day validity

#### Scenario: Login with missing credentials
- **WHEN** a login request is submitted with missing email or password fields
- **THEN** the system rejects the request with HTTP 400 Bad Request and an error message indicating missing required fields

### Requirement: Credential Verification and Enumeration Protection
The system SHALL verify submitted login passwords against the stored one-way bcrypt hash. If the email does not exist or the password does not match, the system SHALL reject the login attempt with HTTP 401 Unauthorized and return a generic error message without disclosing whether the email exists.

#### Scenario: Login with incorrect password
- **WHEN** a user submits a valid registered email with an incorrect password
- **THEN** the system rejects the request with HTTP 401 Unauthorized and returns a generic invalid credentials error

#### Scenario: Login with non-existent email
- **WHEN** a user submits an email that is not registered in the system
- **THEN** the system rejects the request with HTTP 401 Unauthorized and returns the same generic invalid credentials error without revealing email non-existence

### Requirement: Secure Password Storage
The system SHALL never store user passwords in plaintext. All user passwords MUST be transformed using salted one-way hashing before storage in the database.

#### Scenario: Password stored as cryptographic hash
- **WHEN** a user account is created or password updated
- **THEN** the password value persisted in the database is a salted cryptographic hash and cannot be retrieved as plaintext

### Requirement: Session Cookie Authentication Middleware
The system SHALL provide authentication middleware for protected endpoints that reads the session token from the HTTP-only cookie, retrieves the active session from the database, and attaches the authenticated user entity along with their assigned role (`ADMIN` or `TEACHER`) to the request context.

#### Scenario: Request with valid session cookie
- **WHEN** a client sends an HTTP request to a protected endpoint with a valid active session cookie
- **THEN** the middleware resolves the active session from the database, attaches the user identity and role to the request context, and allows the request to proceed

#### Scenario: Request without session cookie
- **WHEN** an unauthenticated client sends an HTTP request to a protected endpoint without a session cookie
- **THEN** the middleware rejects the request with HTTP 401 Unauthorized

### Requirement: Rejection of Expired or Invalid Sessions
The authentication system SHALL reject requests carrying session tokens that are expired (past their 90-day lifetime) or do not match an existing database session record. The system SHALL return HTTP 401 Unauthorized and instruct the client to clear the invalid cookie.

#### Scenario: Request with expired session token
- **WHEN** a client sends a request with a session cookie whose expiration timestamp in the database is in the past
- **THEN** the system rejects the request with HTTP 401 Unauthorized and clears the expired session cookie

#### Scenario: Request with non-existent or malformed session token
- **WHEN** a client sends a request with an unrecognized or revoked session token
- **THEN** the system rejects the request with HTTP 401 Unauthorized

### Requirement: User Logout and Session Revocation
The system SHALL provide a logout endpoint for authenticated users. Upon receiving a logout request, the system SHALL invalidate and delete the corresponding session record from the database and instruct the client to delete the session cookie.

#### Scenario: Successful logout invalidates session
- **WHEN** an authenticated user sends a request to the logout endpoint
- **THEN** the system deletes the active session record from the database, clears the session cookie on the client, and returns a success response

#### Scenario: Post-logout request rejection
- **WHEN** a client attempts to access a protected endpoint using a session token that was previously logged out
- **THEN** the system rejects the request with HTTP 401 Unauthorized
