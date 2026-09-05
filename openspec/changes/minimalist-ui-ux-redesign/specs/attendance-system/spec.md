## ADDED Requirements

### Requirement: Bulk Attendance Marking
The attendance sheet SHALL provide a one-click action to mark all enrolled students in the active session as Present.

#### Scenario: Teacher marks entire class present in one click
- **WHEN** the teacher clicks the "Mark All Present" button on the attendance sheet
- **THEN** all un-marked or absent students in that session are marked as present and the summary counter updates immediately

### Requirement: Real-time Attendance Ratio and Summary
The attendance sheet SHALL display a live summary of present students, total enrolled students, and attendance percentage at the top of the sheet.

#### Scenario: Attendance status is updated
- **WHEN** any student's attendance status changes between present and absent
- **THEN** the present counter and attendance percentage update in real time without requiring a page reload

### Requirement: Student Search and Filter on Attendance Sheet
The attendance sheet SHALL provide an instant search input allowing teachers to filter the student list by name.

#### Scenario: Teacher searches for a student by name
- **WHEN** the teacher types characters into the search field
- **THEN** only students whose names match the query are displayed in the list

### Requirement: Dashboard Pending Attendance Action
The dashboard SHALL highlight sessions scheduled for the current day that have unrecorded or pending attendance with a direct one-click navigation link to the attendance sheet.

#### Scenario: Teacher views dashboard on class day
- **WHEN** the user opens the dashboard and has a session scheduled for today
- **THEN** the dashboard prominently displays the active session card with a direct "Take Attendance" action button
