## ADDED Requirements

### Requirement: Minimalist App Shell Without Redundant Branding
The application shell SHALL provide a clean, non-repetitive navigation structure where brand identity is presented once, and developer-facing badges are excluded from production views.

#### Scenario: User navigates authenticated pages
- **WHEN** any authenticated route is rendered
- **THEN** the header displays contextual page breadcrumbs instead of developer badges or duplicate brand banners

### Requirement: Unified Session Creator
The class management interface SHALL provide a unified session creation interface that supports both single-date and multi-date scheduling within a single dialog.

#### Scenario: User schedules class sessions
- **WHEN** the user initiates session creation
- **THEN** the dialog provides date selection (single or multiple Jalali dates) and unified time inputs without splitting into disconnected workflows

### Requirement: Scannable Session Timeline View
The class details page SHALL render class sessions in a compact, scannable timeline format displaying date, time, and attendance completion status badges.

#### Scenario: Teacher reviews class sessions
- **WHEN** the user views the sessions tab of a class
- **THEN** each session displays an attendance completion badge indicating whether attendance has been taken and the attendance count
