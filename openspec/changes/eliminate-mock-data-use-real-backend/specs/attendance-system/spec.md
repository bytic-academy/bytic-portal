## ADDED Requirements

### Requirement: Direct Database-Driven State and Loading Skeletons
The application SHALL initialize state without static mock arrays, display animated loading skeletons during initial data fetch, and show empty database guidance when zero students exist.

#### Scenario: Initial data fetch with loading state
- **WHEN** user loads the application
- **THEN** animated skeleton rows and statistics placeholders SHALL display until the real database response resolves, without flashing static mock students

#### Scenario: Empty database state
- **WHEN** the backend returns an empty student list (`[]`) and not in a loading state
- **THEN** an empty state message SHALL display indicating no students exist in the database with instructions on how to add students or run `npm run db:seed`

### Requirement: Real API Error Handling and Reconnection
The application SHALL handle API and database connection failures gracefully with user feedback and retry mechanisms instead of falling back to synthetic mock data.

#### Scenario: Network or database connectivity error
- **WHEN** an initial fetch or background synchronization fails due to server or database downtime
- **THEN** a visible error banner SHALL display explaining the failure and offering a "Retry" button that triggers a fresh data fetch without generating synthetic fallback students

#### Scenario: Student creation failure
- **WHEN** submitting a new student fails on the backend
- **THEN** an error message SHALL be surfaced to the user and no synthetic mock record SHALL be injected into local state
