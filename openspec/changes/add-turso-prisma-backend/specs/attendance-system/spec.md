## ADDED Requirements

### Requirement: Persistent Data Synchronization
The application SHALL load student roster and attendance state from the backend API on load, support instant optimistic status updates, and synchronize mutations with the server.

#### Scenario: Initial data fetch
- **WHEN** user opens the application
- **THEN** the client fetches the roster and current attendance status from `/api/students` and displays live data

#### Scenario: Optimistic attendance toggle
- **WHEN** user changes a student's status or clicks "Mark All Present"
- **THEN** the UI updates immediately and sends the update request to the backend in the background, reverting or alerting on error

#### Scenario: Student registration persistence
- **WHEN** user submits the Add Student dialog
- **THEN** the new student is created via the backend API and appended to the live table view
