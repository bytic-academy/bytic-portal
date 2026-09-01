## Purpose

Provides a clean, extensible starter application foundation with responsive layout, header navigation, theme and locale switching, toast notifications, and health check APIs.

## ADDED Requirements

### Requirement: Application Shell Navigation Header
The application shell SHALL render a top navigation header with branding, language toggle (Persian/English), and theme toggle (Light/Dark/System).

#### Scenario: Header controls rendered
- **WHEN** the user visits the root web page
- **THEN** the application shell renders the header with language and theme toggles

#### Scenario: Language switching updates layout direction
- **WHEN** the user toggles language to English or Persian
- **THEN** the HTML document dir attribute updates to ltr or rtl accordingly without hardcoded directional CSS classes

### Requirement: Health Check API Endpoints
The server SHALL expose `/health` and `/api/health` HTTP endpoints returning service status and timestamp.

#### Scenario: Server health check query
- **WHEN** a client performs a GET request to `/health` or `/api/health`
- **THEN** the server responds with HTTP 200 and JSON `{ "success": true, "data": { "status": "ok" } }`

### Requirement: Clean Starter Layout Container
The main application area SHALL provide a clean placeholder container ready for new domain components.

#### Scenario: Landing view display
- **WHEN** the application loads
- **THEN** it displays a clean starter container and global toast notification provider without domain attendance tables or widgets
