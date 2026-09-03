## Purpose

Provides class session scheduling and lifecycle management, supporting single session creation, atomic Jalali multi-date bulk generation, session queries, schedule updates, and deletion scoped by class assignment and user authorization roles.

## ADDED Requirements

### Requirement: Single Session Creation
The system SHALL allow authorized users (Administrators or assigned Teachers) to create a single session for a class by providing a date in ISO `YYYY-MM-DD` format, a start time (e.g. `HH:mm`), and an end time. The system MUST validate that the end time occurs after the start time. Unauthorized users and teachers not assigned to the class MUST be rejected with an authorization error.

#### Scenario: Admin creates a single class session
- **WHEN** an administrator submits a request to create a session for a class with date `"2026-09-10"`, start time `"10:00"`, and end time `"11:30"`
- **THEN** the session is created for the class and returned with its unique identifier and schedule details

#### Scenario: Assigned teacher creates a single class session
- **WHEN** an authenticated teacher assigned to the class submits a request to create a session with valid date and time range
- **THEN** the session is created successfully

#### Scenario: Unassigned teacher attempts to create a session
- **WHEN** an authenticated teacher not assigned to the target class attempts to create a session
- **THEN** the request is rejected with a forbidden authorization error

#### Scenario: Validation error on invalid session time range
- **WHEN** a user submits a session creation request where the end time is earlier than or equal to the start time (e.g., start `"11:00"`, end `"10:00"`)
- **THEN** the request is rejected with a validation error

---

### Requirement: Atomic Bulk Session Creation
The system SHALL allow authorized users to bulk-create sessions for a class by providing an array of dates (e.g., selected via a Jalali multi-date picker) along with a single shared start time and end time. The system MUST create one session per provided date atomically; if any date is invalid or fails validation, no sessions SHALL be created.

#### Scenario: Bulk creating sessions across multiple dates
- **WHEN** an authorized user submits a bulk creation request with a class ID, an array of dates `["2026-09-10", "2026-09-17", "2026-09-24"]`, start time `"14:00"`, and end time `"15:30"`
- **THEN** three distinct sessions are created for the class matching each date with the specified time window, and the list of created sessions is returned

#### Scenario: Atomic rollback on invalid date in batch
- **WHEN** an authorized user submits a bulk creation request containing valid dates and at least one malformed or invalid date string
- **THEN** the entire operation is rejected with a validation error and zero sessions are persisted

#### Scenario: Bulk creation with empty date list
- **WHEN** a user submits a bulk creation request with an empty array of dates
- **THEN** the request is rejected with a validation error requiring at least one date

---

### Requirement: Session Listing and Retrieval
The system SHALL provide endpoints to list all sessions for a class ordered chronologically by date and start time, and to retrieve the details of a specific session. Teachers SHALL only be permitted to list or view sessions for classes they are assigned to.

#### Scenario: List sessions for an assigned class
- **WHEN** an authorized user requests the session list for a class
- **THEN** all sessions for that class are returned in chronological order with date, start time, end time, and class identifier

#### Scenario: Unassigned teacher requests session list
- **WHEN** a teacher requests the session list for a class to which they are not assigned
- **THEN** the request is rejected with a forbidden authorization error

#### Scenario: Get individual session details
- **WHEN** an authorized user requests details for a specific session ID
- **THEN** the session information including date, start time, end time, and parent class metadata is returned

#### Scenario: Session not found
- **WHEN** an authorized user requests a session ID that does not exist
- **THEN** the request is rejected with a not found error

---

### Requirement: Session Schedule Modification and Deletion
The system SHALL allow authorized users to update the date, start time, and end time of an existing session, or delete a session. Deleting a session MUST also remove any attendance records associated with that session.

#### Scenario: Update session date and time
- **WHEN** an authorized user submits updated date `"2026-09-12"`, start time `"11:00"`, and end time `"12:30"` for an existing session
- **THEN** the session schedule is updated and the modified session record is returned

#### Scenario: Delete session
- **WHEN** an authorized user submits a delete request for an existing session ID
- **THEN** the session and all its associated attendance records are removed from the system

#### Scenario: Unassigned teacher attempts modification or deletion
- **WHEN** a teacher not assigned to the parent class of a session attempts to update or delete that session
- **THEN** the request is rejected with a forbidden authorization error

---

### Requirement: Session Schedule Conflict Detection
The system SHALL detect when a proposed session date and time overlaps with an existing session in the same class.

#### Scenario: Creating a session with overlapping time window
- **WHEN** a user creates or updates a session for a class on a date and time range that overlaps with an already scheduled session for that same class
- **THEN** the system flags the schedule conflict and informs the user of the overlapping session
