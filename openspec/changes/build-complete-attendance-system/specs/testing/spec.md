## Purpose

Defines the test-driven development (TDD) infrastructure, isolated in-memory SQLite test database management, service-layer business logic test contracts, and shared test lifecycle utilities for the Bytic Attendance System.

## ADDED Requirements

### Requirement: In-Memory Test Database Isolation
The testing infrastructure SHALL execute all automated tests against an isolated in-memory SQLite database instance completely separated from development and production databases. Each test suite execution SHALL start with a fresh database instance, preventing cross-test state leakage or data pollution.

#### Scenario: Fresh database initialization per test suite
- **WHEN** a test suite begins execution
- **THEN** an isolated in-memory SQLite database instance is provisioned with all application schema migrations applied to a clean state

#### Scenario: Database connection teardown
- **WHEN** a test suite finishes execution
- **THEN** the test runner terminates the in-memory database connection and releases associated resources

### Requirement: Service-Layer Dependency Injection
All domain business logic and data persistence operations SHALL be encapsulated in service functions that accept the database client instance as an explicit dependency parameter. Service functions MUST NOT rely on hardcoded global database singletons.

#### Scenario: Executing service operations with test client
- **WHEN** a service function is called within a test using the in-memory test database client
- **THEN** all read and write queries execute strictly against the supplied test database instance

### Requirement: Shared Test Helpers and Seeding Utilities
The testing environment SHALL provide shared helper utilities to establish database lifecycles, seed standardized domain fixtures (such as users with specific roles, courses, classes, enrolled students, and scheduled sessions), and clean up state between tests.

#### Scenario: Seeding domain entities with test helpers
- **WHEN** a test invokes a test fixture utility to generate initial test data
- **THEN** the utility persists valid relational entities in the active test database and returns the created entity objects with valid IDs

#### Scenario: Resetting data between individual tests
- **WHEN** a test execution completes within a suite
- **THEN** the test lifecycle utility clears test records or resets the database state to ensure clean execution for subsequent tests

### Requirement: Automated Test Execution via Test Runner
The testing framework SHALL execute all unit and integration test suites via the `vitest run` command, reporting test assertions, execution durations, and exit codes.

#### Scenario: Executing test runner command
- **WHEN** the command `vitest run` is executed in the project workspace
- **THEN** Vitest discovers and executes all test suites across the project, reporting passed assertions and exiting with code 0 on success

#### Scenario: Failing assertion reporting
- **WHEN** a test assertion fails during test execution
- **THEN** the runner outputs the failure details including the expected vs actual values, the failing file, and the line number, and exits with a non-zero code

### Requirement: Comprehensive Service Test Coverage
Every domain service function across the application SHALL have dedicated automated unit and integration tests verifying both valid execution flows and expected error conditions. Test coverage MUST include:
1. **Authentication Services**: Password hashing, credential validation, session creation, session retrieval, and session termination.
2. **User Services**: User account creation, role assignment (ADMIN/TEACHER), password updates, and user listing/deletion.
3. **Course Services**: Course creation, updates, deletion, retrieval, and unique course code enforcement.
4. **Class Services**: Class CRUD, teacher assignment, student enrollment/unenrollment, and role-based filtering (teachers restricted to assigned classes).
5. **Student Services**: Student profile CRUD, multi-class enrollment management, and duplicate national/student ID prevention.
6. **Session Services**: Single session CRUD and multi-date bulk session creation generating individual session records per selected date with configured start/end times.
7. **Attendance Services**: Per-session student attendance status updates (present/absent/late/justified), timestamp recording, and reversible status updates without record duplication.

#### Scenario: Testing service success cases
- **WHEN** a service function is invoked with valid arguments and preconditions
- **THEN** the service performs the operation, persists expected changes in the database, and returns the expected result structure

#### Scenario: Testing validation and conflict errors
- **WHEN** a service function is invoked with invalid arguments, duplicate unique identifiers, or non-existent foreign keys
- **THEN** the service rejects the operation with a descriptive error and ensures no invalid state is persisted in the database

#### Scenario: Testing bulk session generation logic
- **WHEN** the bulk session creation service is invoked with multiple dates, a start time, an end time, and a class ID
- **THEN** the service creates exactly one session record for each provided date linked to the specified class, each having the designated start and end times

#### Scenario: Testing attendance status toggling
- **WHEN** the attendance service is called to update a student's attendance status for a session
- **THEN** the service updates the student's attendance record with the new status and current timestamp, and subsequent toggles update the existing record without creating duplicate entries
