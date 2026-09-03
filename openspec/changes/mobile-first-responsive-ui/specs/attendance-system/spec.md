## ADDED Requirements

### Requirement: Streamlined Distraction-Free Attendance Register
The attendance sheet view SHALL present the student roster immediately at the top of the session view without blocking summary cards, progress bars, or batch bulk buttons.

#### Scenario: Direct roster presentation on load
- **WHEN** an instructor or administrator navigates to a session's attendance sheet (`AttendanceSheetPage`)
- **THEN** the student list SHALL be immediately visible above the fold with student names, index numbers, and attendance status badges, without displaying participation percentage bars or stat counter cards

#### Scenario: Single-tap thumb toggle
- **WHEN** user taps a student's row or status toggle button on mobile or desktop
- **THEN** the student's attendance status SHALL immediately toggle between Present (`حاضر`) and Absent (`غایب`) with responsive visual feedback, sound/toast notification, and optimistic UI update

## REMOVED Requirements

### Requirement: Attendance Participation Metrics and Batch Actions
**Reason**: Eliminated to maximize screen real estate for classroom mobile devices and prevent accidental bulk overwrites of attendance data.
**Migration**: Instructors mark attendance individually using one-tap toggles on the streamlined student roster without relying on "Mark All Present" or progress percentage meters.
