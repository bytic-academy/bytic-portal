## Purpose

Provides management of instructional classes linked to courses, including many-to-many teacher assignments, student enrollments, and role-based access control where administrators manage all classes and teachers manage only their assigned classes.

## ADDED Requirements

### Requirement: Class Creation
The system SHALL allow administrators to create a new class linked to an existing course. The class MAY include an optional name or label to distinguish multiple classes within the same course. The system MUST verify that the referenced course exists and reject creation requests from non-admin users.

#### Scenario: Admin creates a class linked to an existing course
- **WHEN** an authenticated administrator submits a class creation request with a valid course identifier and an optional class name label
- **THEN** the system creates the class linked to the course and returns HTTP 201 with the created class details

#### Scenario: Reject class creation referencing a non-existent course
- **WHEN** an authenticated administrator submits a class creation request with a course identifier that does not exist
- **THEN** the system rejects the request with HTTP 400 or HTTP 404 and an error message indicating that the course does not exist

#### Scenario: Reject class creation by non-admin user
- **WHEN** an authenticated user with the teacher role attempts to create a class
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Reject class creation by unauthenticated user
- **WHEN** an unauthenticated request is made to create a class
- **THEN** the system returns HTTP 401 Unauthorized

### Requirement: Class Listing with Role-Based Scoping
The system SHALL provide class listing scoped by user role. Administrators SHALL receive all classes across all courses. Teachers SHALL receive only classes to which they are assigned.

#### Scenario: Admin retrieves all classes
- **WHEN** an authenticated administrator sends a request to list classes
- **THEN** the system returns HTTP 200 with an array of all classes in the system including course details and assignment counts

#### Scenario: Teacher retrieves only assigned classes
- **WHEN** an authenticated teacher sends a request to list classes
- **THEN** the system returns HTTP 200 with an array containing only the classes where the teacher is assigned

#### Scenario: Unauthenticated request to list classes
- **WHEN** an unauthenticated request is made to list classes
- **THEN** the system returns HTTP 401 Unauthorized

### Requirement: Class Details Retrieval
The system SHALL allow administrators to view any class details, and allow teachers to view details only for classes assigned to them. Class details MUST include course information, assigned teachers, and enrolled students.

#### Scenario: Admin views class details
- **WHEN** an authenticated administrator requests details for an existing class
- **THEN** the system returns HTTP 200 with complete class details including course metadata, assigned teachers list, and enrolled students list

#### Scenario: Assigned teacher views class details
- **WHEN** an authenticated teacher requests details for a class they are assigned to
- **THEN** the system returns HTTP 200 with complete class details

#### Scenario: Unassigned teacher denied class details
- **WHEN** an authenticated teacher requests details for a class they are not assigned to
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Class details not found
- **WHEN** an authenticated user requests details for a class identifier that does not exist
- **THEN** the system returns HTTP 404 Not Found

### Requirement: Class Modification
The system SHALL allow administrators and assigned teachers to update class details such as name/label. Only administrators SHALL be permitted to change the course association of a class. The system MUST reject update attempts on unassigned classes by teachers.

#### Scenario: Admin updates class details
- **WHEN** an authenticated administrator submits an update request with valid class details
- **THEN** the system updates the class and returns HTTP 200 with the updated class details

#### Scenario: Assigned teacher updates class details
- **WHEN** an authenticated teacher submits an update request for a class they are assigned to
- **THEN** the system updates the class and returns HTTP 200 with the updated class details

#### Scenario: Unassigned teacher denied class update
- **WHEN** an authenticated teacher attempts to update a class they are not assigned to
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Reject updating to non-existent course
- **WHEN** an administrator attempts to change a class's course association to a non-existent course identifier
- **THEN** the system rejects the request with HTTP 400 or HTTP 404

### Requirement: Class Deletion
The system SHALL allow administrators to delete an existing class. Deleting a class MUST remove associated teacher assignments and student enrollments. Teachers MUST NOT be permitted to delete classes.

#### Scenario: Admin deletes a class successfully
- **WHEN** an authenticated administrator submits a deletion request for an existing class
- **THEN** the system removes the class along with its teacher assignments and student enrollments, returning HTTP 200 or HTTP 204

#### Scenario: Reject class deletion by teacher
- **WHEN** an authenticated teacher attempts to delete a class
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Delete non-existent class
- **WHEN** an authenticated administrator attempts to delete a class identifier that does not exist
- **THEN** the system returns HTTP 404 Not Found

### Requirement: Teacher Assignment Management
The system SHALL allow administrators to assign and remove teachers to and from a class via many-to-many relationships. The system MUST verify that the user exists and holds the teacher role. Non-admin users MUST NOT be permitted to modify teacher assignments.

#### Scenario: Admin assigns teacher to class
- **WHEN** an authenticated administrator submits a request to assign an existing teacher to a class
- **THEN** the system associates the teacher with the class and returns HTTP 200 with the updated list of assigned teachers

#### Scenario: Admin removes teacher from class
- **WHEN** an authenticated administrator submits a request to remove an assigned teacher from a class
- **THEN** the system removes the teacher association from the class and returns HTTP 200

#### Scenario: Reject teacher assignment by non-admin
- **WHEN** an authenticated teacher attempts to assign or remove teachers from a class
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Reject assignment of non-existent user or invalid role
- **WHEN** an administrator attempts to assign a non-existent user identifier or a user who is not a teacher
- **THEN** the system rejects the request with HTTP 400 or HTTP 404

### Requirement: Student Enrollment Management
The system SHALL allow administrators and assigned teachers to enroll and unenroll students in a class via many-to-many relationships. A student MAY be enrolled in multiple classes simultaneously or historically. Teachers MUST NOT be permitted to manage enrollments for classes they are not assigned to.

#### Scenario: Admin enrolls student in class
- **WHEN** an authenticated administrator submits a request to enroll an existing student in a class
- **THEN** the system creates the enrollment association and returns HTTP 200 with the updated enrolled students list

#### Scenario: Assigned teacher enrolls student in class
- **WHEN** an authenticated teacher submits a request to enroll an existing student in an assigned class
- **THEN** the system creates the enrollment association and returns HTTP 200 with the updated enrolled students list

#### Scenario: Unassigned teacher denied student enrollment
- **WHEN** an authenticated teacher attempts to enroll or unenroll a student in a class they are not assigned to
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Unenroll student from class
- **WHEN** an administrator or assigned teacher submits a request to remove a student enrollment from a class
- **THEN** the system disassociates the student from the class and returns HTTP 200

#### Scenario: Reject enrollment of non-existent student
- **WHEN** an authorized user attempts to enroll a student identifier that does not exist
- **THEN** the system rejects the request with HTTP 404 Not Found

#### Scenario: Reject duplicate student enrollment
- **WHEN** an authorized user attempts to enroll a student who is already enrolled in the specified class
- **THEN** the system rejects the request with HTTP 400 or HTTP 409 indicating duplicate enrollment
