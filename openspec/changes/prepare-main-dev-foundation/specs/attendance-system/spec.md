## ADDED Requirements

### Requirement: Solar Hijri (Jalali) Date Localization and Day Navigation
The system SHALL support dynamic Solar Hijri (Jalali) calendar formatting in Persian locale and interactive multi-day navigation, while maintaining ISO/UTC `YYYY-MM-DD` strings as the canonical backend persistence format.

#### Scenario: Displaying localized today date
- **WHEN** the user opens the application in Persian locale (`fa`)
- **THEN** the current date in the header displays the accurate Solar Hijri weekday, day, month, and year (e.g. `امروز: دوشنبه ۲ شهریور ۱۴۰۵`) using Persian numerals

#### Scenario: Navigating between dates
- **WHEN** the user selects previous day, next day, or today via the date navigator
- **THEN** the UI updates the active date, queries attendance and statistics for that date, and displays the corresponding attendance records

### Requirement: Server State Management with React Query and Toast Feedback
The client application SHALL use TanStack Query for server state caching, background synchronization, and optimistic UI updates, complemented by Sonner toast notifications for user actions.

#### Scenario: Optimistic attendance status toggle with toast feedback
- **WHEN** the user toggles a student's attendance status
- **THEN** the UI immediately reflects the new status optimistically, sends a sync request to the API, displays a success toast upon completion, and automatically rolls back with an error toast if the request fails

#### Scenario: Adding student with form validation and feedback
- **WHEN** a new student is successfully registered via the student dialog
- **THEN** the student cache is invalidated, the table updates with the new entry, and a success toast notification appears
