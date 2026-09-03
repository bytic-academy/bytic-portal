## Purpose

Provides student profile and roster management capabilities for the attendance system, allowing administrators and authorized teachers to create, inspect, update, and delete student records with multi-class enrollment history and strict role-based access control.

## ADDED Requirements

### Requirement: Student Creation
The system SHALL allow authenticated administrators and teachers assigned to at least one class to register new student records. Each student record MUST include a required name, a valid birthdate, a gender value ('MALE' or 'FEMALE'), and an optional descriptive 'about' text field.

#### Scenario: Admin creates a valid student record
- **WHEN** an authenticated administrator submits a request to create a student with valid name, birthdate, gender, and optional about text
- **THEN** the system creates the student record and returns HTTP 201 with the created student's details

#### Scenario: Teacher assigned to a class creates a valid student record
- **WHEN** an authenticated teacher assigned to one or more classes submits a request to create a student with valid fields
- **THEN** the system creates the student record and returns HTTP 201 with the created student's details

#### Scenario: Validation fails for missing or invalid student fields
- **WHEN** a client submits a student creation request with a missing or blank name, an invalid date format, or an invalid gender value
- **THEN** the system rejects the request and returns HTTP 400 with descriptive validation error messages

#### Scenario: Unauthenticated user attempts student creation
- **WHEN** an unauthenticated request is sent to create a student
- **THEN** the system rejects the request and returns HTTP 401 Unauthorized

### Requirement: Student Listing and Access Scope
The system SHALL provide an endpoint to list student records with role-based scope filtering. Administrators SHALL see all students registered across the system, whereas teachers SHALL see only students who are currently or historically enrolled in at least one class assigned to that teacher.

#### Scenario: Admin retrieves all students
- **WHEN** an authenticated administrator requests the list of students
- **THEN** the system returns HTTP 200 containing all students in the database

#### Scenario: Teacher retrieves assigned students
- **WHEN** an authenticated teacher requests the list of students
- **THEN** the system returns HTTP 200 containing only students enrolled in classes assigned to that teacher

#### Scenario: Teacher with no assigned classes retrieves students
- **WHEN** an authenticated teacher who is not assigned to any classes requests the list of students
- **THEN** the system returns HTTP 200 with an empty list

### Requirement: Student Detail Retrieval
The system SHALL provide an endpoint to retrieve the complete details of a specific student, including their profile information (id, name, birthdate, gender, about) and their enrolled classes. Administrators SHALL be able to view details for any student, while teachers SHALL only be permitted to view details for students enrolled in at least one of their assigned classes.

#### Scenario: Admin views any student details
- **WHEN** an authenticated administrator requests the details of an existing student by ID
- **THEN** the system returns HTTP 200 with the student's full profile information and their list of enrolled classes

#### Scenario: Teacher views details of an enrolled student
- **WHEN** an authenticated teacher requests the details of a student enrolled in a class assigned to that teacher
- **THEN** the system returns HTTP 200 with the student's profile information and their class enrollment list

#### Scenario: Teacher attempts to view details of an unassigned student
- **WHEN** an authenticated teacher requests the details of a student who is not enrolled in any classes assigned to that teacher
- **THEN** the system rejects the request and returns HTTP 403 Forbidden

#### Scenario: Request details for non-existent student
- **WHEN** an authenticated user requests the details of a student ID that does not exist
- **THEN** the system returns HTTP 404 Not Found

### Requirement: Student Profile Modification
The system SHALL allow administrators and teachers assigned to at least one class where the student is enrolled to update the student's profile information (name, birthdate, gender, about). Teachers not assigned to any class containing the student SHALL be denied update access.

#### Scenario: Admin updates student profile
- **WHEN** an authenticated administrator submits valid updated profile fields for an existing student
- **THEN** the system updates the student record and returns HTTP 200 with the updated student details

#### Scenario: Authorized teacher updates student profile
- **WHEN** an authenticated teacher assigned to a class containing the student submits valid updated profile fields
- **THEN** the system updates the student record and returns HTTP 200 with the updated student details

#### Scenario: Unauthorized teacher attempts to update student profile
- **WHEN** an authenticated teacher not assigned to any class containing the student submits an update request
- **THEN** the system rejects the request and returns HTTP 403 Forbidden

#### Scenario: Update fails due to validation errors
- **WHEN** an authorized user submits an update request with invalid field values such as an empty name or invalid gender
- **THEN** the system rejects the update and returns HTTP 400 with validation error details

### Requirement: Student Deletion
The system SHALL allow only administrators to delete student records. When a student is deleted, the system SHALL clean up related enrollment and attendance records. Teachers MUST NOT be permitted to delete student records under any circumstance.

#### Scenario: Admin deletes an existing student
- **WHEN** an authenticated administrator requests deletion of an existing student by ID
- **THEN** the system deletes the student record along with associated class enrollments and returns HTTP 200 or HTTP 204 No Content

#### Scenario: Teacher attempts to delete a student
- **WHEN** an authenticated teacher requests deletion of a student record
- **THEN** the system rejects the request and returns HTTP 403 Forbidden

#### Scenario: Admin attempts to delete a non-existent student
- **WHEN** an authenticated administrator requests deletion of a student ID that does not exist
- **THEN** the system returns HTTP 404 Not Found

### Requirement: Multi-Class Enrollment Relationship
The system SHALL support students being enrolled in zero, one, or multiple classes concurrently or historically. Class enrollment and unenrollment SHALL be managed independently via class management endpoints without overwriting the core student record.

#### Scenario: Student is enrolled in multiple classes
- **WHEN** an authorized user retrieves a student enrolled in multiple concurrent or historical classes
- **THEN** the system returns the student details including all associated class enrollments

#### Scenario: Student has no active enrollments
- **WHEN** an authorized user retrieves a student who is not enrolled in any classes
- **THEN** the system returns the student details with an empty class enrollment list
