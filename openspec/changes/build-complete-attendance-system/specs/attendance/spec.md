## Purpose

Provides per-session student attendance tracking, enabling teachers and administrators to view enrolled student rosters for any class session and toggle binary present or absent attendance statuses with recorded timestamps.

## ADDED Requirements

### Requirement: Session Attendance Sheet Retrieval
The system SHALL provide an attendance sheet for any given session listing all students actively enrolled in the session's parent class, along with their attendance status (`present` boolean) and the timestamp of their last status change (`checkedAt`). If no attendance record has been recorded for an enrolled student in that session, the system MUST represent their status as absent (`present: false`, `checkedAt: null`) by default.

#### Scenario: Retrieve attendance sheet for a session
- **WHEN** an authorized user requests the attendance sheet for a valid session ID
- **THEN** the system returns a list of all students currently enrolled in the session's class, each with student details (id, name, studentId), `present` status, and `checkedAt` timestamp

#### Scenario: Unrecorded students initialized as absent
- **WHEN** an attendance sheet is requested for a newly created session where no checks have been performed
- **THEN** all enrolled students are returned with `present` set to `false` and `checkedAt` set to `null`

#### Scenario: Non-enrolled students excluded
- **WHEN** an attendance sheet is requested for a session
- **THEN** only students enrolled in the session's parent class are included; students not enrolled in that class are excluded from the sheet

#### Scenario: Unauthorized access to attendance sheet
- **WHEN** an unauthenticated user or a teacher not assigned to the session's class requests the attendance sheet
- **THEN** the request is rejected with an authorization error

---

### Requirement: Individual Student Attendance Toggle
The system SHALL allow authorized users (Administrators or assigned Teachers) to toggle a student's attendance status between present (`true`) and absent (`false`) for a specific session. Each toggle operation MUST update or create the attendance record storing `sessionId`, `studentId`, `present` status, and set `checkedAt` to the current system timestamp.

#### Scenario: Marking an absent student as present
- **WHEN** an authorized user marks an enrolled student as present for a session
- **THEN** the student's attendance record for that session is saved with `present: true` and `checkedAt` set to the current ISO timestamp

#### Scenario: Marking a present student as absent (undo present)
- **WHEN** an authorized user toggles a present student to absent for a session
- **THEN** the student's attendance record is updated with `present: false` and `checkedAt` updated to the current ISO timestamp

#### Scenario: Toggle attendance status
- **WHEN** an authorized user sends a toggle request for a student in a session
- **THEN** if the current status is absent, it is changed to present; if currently present, it is changed to absent, with the new state and timestamp returned

#### Scenario: Attempting attendance check for non-enrolled student
- **WHEN** an authorized user attempts to record attendance for a student who is not enrolled in the session's class
- **THEN** the request is rejected with a validation error

---

### Requirement: Batch Attendance Status Update
The system SHALL allow authorized users to perform bulk attendance operations for a session, such as marking all enrolled students present or resetting all enrolled students to absent.

#### Scenario: Mark all enrolled students present
- **WHEN** an authorized user submits a request to mark all students present for a session
- **THEN** attendance records for all enrolled students in that class are set to `present: true` with `checkedAt` set to the current timestamp, and the count of updated records is returned

#### Scenario: Reset all enrolled students to absent
- **WHEN** an authorized user submits a request to reset attendance to absent for a session
- **THEN** attendance records for all enrolled students in that class are set to `present: false` with updated `checkedAt` timestamps

---

### Requirement: Role-Based Attendance Authorization Scoping
The system SHALL enforce that Teachers can only view and modify attendance records for sessions belonging to classes they are assigned to. Administrators SHALL have permission to view and modify attendance records across all sessions.

#### Scenario: Assigned teacher modifies attendance
- **WHEN** a teacher assigned to the class of session A updates attendance for a student in session A
- **THEN** the attendance update succeeds

#### Scenario: Unassigned teacher attempts to modify attendance
- **WHEN** a teacher not assigned to the class of session B attempts to update attendance for session B
- **THEN** the request is rejected with a forbidden authorization error

#### Scenario: Administrator modifies attendance for any class session
- **WHEN** an administrator updates attendance for any session in any class
- **THEN** the attendance update succeeds
