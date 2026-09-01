## Purpose

Provides a unified, extensible API request routing engine and an automated testing suite to support reliable development across development and production environments.

## ADDED Requirements

### Requirement: Unified API Request Dispatching
The backend system SHALL provide a shared request router that matches HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) and pathname, parses query parameters and JSON payloads, and returns uniform JSON responses in both development (Vite dev server) and production (Node.js runtime).

#### Scenario: Dispatching registered API route
- **WHEN** an HTTP request matching a registered API route path and method is received
- **THEN** the router executes the associated handler and returns a standardized JSON payload with HTTP status code and `success: true`

#### Scenario: Unmatched API route returns 404
- **WHEN** an HTTP request to an unregistered `/api/*` path is received
- **THEN** the router returns HTTP 404 with `{ "success": false, "error": "..." }` and `Content-Type: application/json`

### Requirement: Automated Unit and Integration Testing
The project SHALL provide an automated test runner (Vitest) executing test suites covering API schemas, utility functions, and calculation algorithms.

#### Scenario: Executing test suite
- **WHEN** `npm test` or `vitest run` is executed in the project terminal
- **THEN** all test files pass without errors and report coverage status
