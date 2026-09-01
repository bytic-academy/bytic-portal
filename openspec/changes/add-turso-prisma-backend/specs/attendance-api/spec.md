## Purpose

Provides a type-safe, serverless HTTP REST API backed by Prisma ORM and Turso libSQL/SQLite database to query, register, and record attendance data for students.

## ADDED Requirements

### Requirement: Student Roster API
The API SHALL provide endpoints to list registered students with their current attendance status and create new student records.

#### Scenario: List students with attendance
- **WHEN** client sends a GET request to `/api/students`
- **THEN** server returns HTTP 200 with an array of students containing id, studentId, nameFa, nameEn, course, guardianPhone, status, and checkInTime

#### Scenario: Register new student
- **WHEN** client sends a POST request to `/api/students` with valid student details
- **THEN** server creates the student record and returns HTTP 201 with the created student object

#### Scenario: Validation error on new student
- **WHEN** client sends a POST request to `/api/students` with missing required fields or invalid course type
- **THEN** server returns HTTP 400 with validation error details

### Requirement: Attendance Recording API
The API SHALL provide endpoints to update the attendance status for a single student or batch update all students for a specific date.

#### Scenario: Update individual attendance status
- **WHEN** client sends a PATCH request to `/api/attendance` with studentId and status ('present', 'absent', 'late', 'justified')
- **THEN** server updates or creates the attendance record for the current date and returns HTTP 200 with the updated record

#### Scenario: Batch mark all present
- **WHEN** client sends a POST request to `/api/attendance/mark-all`
- **THEN** server marks all matching students as present with current timestamp and returns HTTP 200 with updated count

### Requirement: Attendance Statistics API
The API SHALL provide an endpoint to retrieve real-time summary statistics.

#### Scenario: Retrieve aggregate statistics
- **WHEN** client sends a GET request to `/api/stats`
- **THEN** server returns HTTP 200 with totalStudents, presentCount, absentCount, lateCount, and justifiedCount
