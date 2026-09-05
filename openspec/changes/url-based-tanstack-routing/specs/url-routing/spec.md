## Purpose

Provides client-side URL-based navigation, deep linking, parameter resolution, history management, and route authorization guards for the Bytic Attendance web application.

## ADDED Requirements

### Requirement: Client-Side Route Mapping and Navigation
The web application SHALL map distinct URL paths to corresponding views without full page reloads, using native browser history for forward and backward navigation.

#### Scenario: Navigating between main sections
- **WHEN** an authenticated user clicks a navigation link for courses, classes, or students
- **THEN** the browser URL updates to `/courses`, `/classes`, or `/students` respectively, the matching page view renders within the authenticated layout shell, and the previous view is pushed to browser history.

#### Scenario: Browser back button navigation
- **WHEN** a user navigates from `/classes` to `/courses` and then presses the browser back button
- **THEN** the application transitions back to `/classes` and renders the classes page without reloading the entire application.

### Requirement: Deep Linking and Parameterized URLs
The application SHALL support direct navigation and deep linking to resource-specific URLs with dynamic route parameters for classes and attendance sessions.

#### Scenario: Directly accessing class detail via URL
- **WHEN** a user loads or refreshes `/classes/cls_abc123` directly in the browser
- **THEN** the application extracts `classId` as `cls_abc123` from the route parameters and renders the class detail view with its associated sessions and student roster.

#### Scenario: Directly accessing attendance sheet via flat session URL
- **WHEN** a user loads or navigates to `/sessions/ses_xyz789/attendance`
- **THEN** the application extracts `sessionId` as `ses_xyz789` from the URL parameters and renders the attendance sheet for that session.

### Requirement: Route Authentication Guards
The application SHALL restrict protected routes to authenticated users and redirect unauthenticated requests to `/login` while preserving the intended destination.

#### Scenario: Unauthenticated visitor accessing protected route
- **WHEN** an unauthenticated visitor attempts to access `/classes` or `/sessions/ses_xyz789/attendance`
- **THEN** the router redirects the visitor to `/login` with a redirect query parameter indicating the originally requested path.

#### Scenario: Successful login redirects to original destination
- **WHEN** a user successfully logs in from `/login?redirect=%2Fclasses%2Fcls_abc123`
- **THEN** the application navigates the user to `/classes/cls_abc123`.

#### Scenario: Authenticated user visits login page
- **WHEN** an already authenticated user accesses `/login`
- **THEN** the router redirects the user to `/dashboard`.

### Requirement: Role-Based Route Authorization
The application SHALL enforce administrative role restrictions on designated administrative routes.

#### Scenario: Non-admin teacher accessing users administration
- **WHEN** an authenticated user with role `TEACHER` attempts to navigate to `/users`
- **THEN** the application blocks access and redirects the user to `/dashboard` with an access denied warning notification.

### Requirement: Active Navigation State Indication
The navigation components SHALL automatically reflect the currently active route based on the current URL pathname.

#### Scenario: Highlighting active sidebar link
- **WHEN** the current browser URL matches `/classes` or a sub-route under `/classes`
- **THEN** the classes item in the desktop sidebar and mobile drawer is visually highlighted as active.
