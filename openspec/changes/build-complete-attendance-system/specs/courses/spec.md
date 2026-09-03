## Purpose

Provides management of educational courses that serve as top-level containers for instructional classes, allowing administrators to perform full CRUD operations and authenticated teachers to read course information.

## ADDED Requirements

### Requirement: Course Creation
The system SHALL allow administrators to create a new course with a mandatory name. The system MUST reject creation requests from non-admin users or requests with empty or missing course names.

#### Scenario: Admin creates a course successfully
- **WHEN** an authenticated administrator submits a course creation request with a non-empty name
- **THEN** the system creates the course and returns HTTP 201 with the created course details including its unique identifier and name

#### Scenario: Reject course creation with missing or empty name
- **WHEN** an authenticated administrator submits a course creation request with an empty, whitespace-only, or missing name
- **THEN** the system rejects the request with HTTP 400 and an error message indicating that the course name is required

#### Scenario: Reject course creation by unauthenticated user
- **WHEN** an unauthenticated request is made to create a course
- **THEN** the system returns HTTP 401 Unauthorized

#### Scenario: Reject course creation by non-admin user
- **WHEN** an authenticated user with the teacher role attempts to create a course
- **THEN** the system returns HTTP 403 Forbidden

### Requirement: Course Listing
The system SHALL allow any authenticated user (administrators and teachers) to retrieve a list of all courses.

#### Scenario: Authenticated user retrieves course list
- **WHEN** an authenticated user (administrator or teacher) sends a request to list courses
- **THEN** the system returns HTTP 200 with an array of all courses, each including its identifier and name

#### Scenario: Unauthenticated request to list courses
- **WHEN** an unauthenticated request is made to list courses
- **THEN** the system returns HTTP 401 Unauthorized

### Requirement: Course Details Retrieval
The system SHALL allow any authenticated user to retrieve the details of an individual course by its unique identifier.

#### Scenario: Authenticated user retrieves single course by ID
- **WHEN** an authenticated user requests the details of an existing course by its identifier
- **THEN** the system returns HTTP 200 with the course identifier, name, and timestamp metadata

#### Scenario: Retrieve non-existent course by ID
- **WHEN** an authenticated user requests details for a course identifier that does not exist
- **THEN** the system returns HTTP 404 Not Found with an error message

### Requirement: Course Update
The system SHALL allow administrators to update the name of an existing course. The system MUST reject update requests with empty names, updates by non-admin users, or updates targeting non-existent courses.

#### Scenario: Admin updates course name successfully
- **WHEN** an authenticated administrator submits an update request with a non-empty name for an existing course
- **THEN** the system updates the course name and returns HTTP 200 with the updated course details

#### Scenario: Reject course update with empty name
- **WHEN** an authenticated administrator submits an update request with an empty or whitespace-only name
- **THEN** the system returns HTTP 400 with a validation error message

#### Scenario: Reject course update by non-admin user
- **WHEN** an authenticated user with the teacher role attempts to update a course
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Update non-existent course
- **WHEN** an authenticated administrator attempts to update a course identifier that does not exist
- **THEN** the system returns HTTP 404 Not Found

### Requirement: Course Deletion
The system SHALL allow administrators to delete an existing course. If classes are associated with the course, the system MUST handle cascading or prevent deletion with a conflict error. Non-admin users MUST be forbidden from deleting courses.

#### Scenario: Admin deletes course without associated classes
- **WHEN** an authenticated administrator submits a deletion request for an existing course with no associated classes
- **THEN** the system removes the course and returns HTTP 200 or HTTP 204

#### Scenario: Admin deletes course with associated classes
- **WHEN** an authenticated administrator submits a deletion request for a course that has associated classes
- **THEN** the system rejects the deletion with HTTP 409 Conflict if dependent classes are present, or safely cascades deletion according to system policy

#### Scenario: Reject course deletion by non-admin user
- **WHEN** an authenticated user with the teacher role attempts to delete a course
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Delete non-existent course
- **WHEN** an authenticated administrator attempts to delete a course identifier that does not exist
- **THEN** the system returns HTTP 404 Not Found
