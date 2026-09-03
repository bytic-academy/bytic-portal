## MODIFIED Requirements

### Requirement: Student Roster Management
The system SHALL support student profile management (Persian name, English name, unique student ID, guardian contact number) with many-to-many class enrollment relationships rather than single course-level assignments. A student MUST be able to be enrolled in multiple classes simultaneously across different courses or terms.

#### Scenario: Enrolling a student in multiple classes
- **WHEN** an administrator enrolls a student into multiple distinct classes
- **THEN** the student's profile reflects active enrollment in all assigned classes and the student appears on the roster and attendance sheets for each of those classes

#### Scenario: Viewing student roster filtered by class
- **WHEN** an authorized user selects a specific class
- **THEN** the system displays only the students enrolled in that selected class with their profile information

#### Scenario: Removing class enrollment
- **WHEN** an administrator unenrolls a student from one class
- **THEN** the student is removed from that class roster and future attendance sheets while preserving their enrollments in any other classes

---

### Requirement: Attendance Tracking
The system SHALL track student attendance on a per-session basis using a binary status model comprising Present (`حاضر`) and Absent (`غایب`), deprecating intermediate Late (`با تاخیر`) and Excused (`غایب موجه`) states. The status MUST be reversibly toggleable by authorized users and each status update MUST capture an accurate timestamp. Unmarked students MUST default to Absent.

#### Scenario: Toggle student attendance to Present
- **WHEN** an authorized user toggles an absent student to present for an active session
- **THEN** the student's attendance state for that session changes to Present and the check timestamp is recorded

#### Scenario: Toggle student attendance to Absent (revert)
- **WHEN** an authorized user toggles a present student to absent for a session
- **THEN** the student's attendance state for that session changes to Absent and the update timestamp is recorded

#### Scenario: Default unrecorded attendance
- **WHEN** an attendance sheet is opened for a session prior to any manual check-ins
- **THEN** all enrolled students are displayed with the default Absent status

---

### Requirement: Role-Based Access Control and Authentication
The system SHALL require authenticated user sessions (via username and password) and enforce role-based access control with two distinct roles: Administrator (`ADMIN`) and Teacher (`TEACHER`). Administrators SHALL have unrestricted access to create, read, update, and delete all entities (users, courses, classes, students, sessions, attendance). Teachers SHALL have scoped permissions limited to viewing and managing classes, sessions, and attendance sheets to which they are explicitly assigned.

#### Scenario: Administrator access to all resources
- **WHEN** an authenticated administrator accesses or modifies any course, class, student, session, user, or attendance record
- **THEN** the operation is permitted

#### Scenario: Teacher access restricted to assigned classes
- **WHEN** an authenticated teacher accesses or modifies classes, sessions, or attendance sheets to which they are assigned
- **THEN** the operation is permitted

#### Scenario: Teacher access denied for unassigned classes
- **WHEN** an authenticated teacher attempts to view or modify classes, sessions, or attendance records for a class they are not assigned to
- **THEN** the request is rejected with a forbidden authorization error

#### Scenario: Unauthenticated request denied
- **WHEN** an unauthenticated request attempts to access protected attendance or management endpoints
- **THEN** the request is rejected with an unauthorized authentication error
