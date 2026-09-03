## Purpose

Defines the client-side routing structure, authenticated route protection guards, role-based navigation visibility, and browser history synchronization for the Bytic Attendance single-page application.

## ADDED Requirements

### Requirement: Public and Authenticated Route Access Control
The routing system SHALL restrict access to application routes based on user authentication status. All application routes except `/login` SHALL require an active authenticated session. Unauthenticated attempts to access protected routes SHALL redirect the user to `/login` with the intended destination preserved for post-login redirection. Authenticated users navigating to `/login` SHALL be redirected to `/dashboard`.

#### Scenario: Unauthenticated access to protected route
- **WHEN** an unauthenticated visitor navigates directly to `/dashboard` or any protected URL
- **THEN** the router redirects the visitor to `/login` and preserves the intended target URL for post-authentication redirect

#### Scenario: Authenticated redirect after login
- **WHEN** a user successfully authenticates after being redirected to `/login`
- **THEN** the router navigates the user to their originally attempted destination URL

#### Scenario: Authenticated user visits login page
- **WHEN** an authenticated user navigates directly to `/login`
- **THEN** the router redirects the user to `/dashboard`

### Requirement: Application Route Hierarchy and Parameters
The routing system SHALL provide distinct routes for all core application views: `/login`, `/dashboard`, `/courses`, `/classes`, `/classes/:id`, `/students`, `/sessions`, and `/attendance`. Dynamic route parameters SHALL be extracted and supplied to the corresponding view components.

#### Scenario: Navigating to parameterized class details
- **WHEN** a user navigates to `/classes/:id` with a specific class identifier
- **THEN** the router loads the class details view for the specified class identifier

#### Scenario: Navigating to session attendance view
- **WHEN** a user navigates to `/attendance` with class and session context parameters
- **THEN** the router loads the attendance tracking view for the specified session

### Requirement: Role-Based Route Authorization
The routing system SHALL enforce role-based access rules on protected routes. Admin-only management routes SHALL be inaccessible to users with the TEACHER role. If a TEACHER attempts to navigate directly to an admin-only route, the router SHALL display an access denied (403) state or redirect them to `/dashboard` with an authorization notice.

#### Scenario: Teacher accesses admin-only route
- **WHEN** a user authenticated with the TEACHER role navigates to an admin-only route (such as user management or course creation)
- **THEN** the router blocks access and displays an unauthorized notification or redirects the user to `/dashboard`

#### Scenario: Admin accesses admin-only route
- **WHEN** a user authenticated with the ADMIN role navigates to an admin-only route
- **THEN** the router allows access and renders the requested administrative view

### Requirement: Role-Aware Navigation Menu
The application navigation menu SHALL dynamically display navigation items corresponding to the authenticated user's role permissions. Administrative navigation items SHALL be hidden from users with the TEACHER role.

#### Scenario: Admin navigation menu rendering
- **WHEN** an ADMIN logs in and views the navigation layout
- **THEN** all navigation links including Courses, Classes, Students, Users, and Dashboard are displayed

#### Scenario: Teacher navigation menu rendering
- **WHEN** a TEACHER logs in and views the navigation layout
- **THEN** only Teacher-permitted navigation links (Dashboard, assigned Classes, Attendance) are displayed, and admin-exclusive links are omitted

### Requirement: Browser History and Deep Linking Support
The routing system SHALL integrate with the browser History API, supporting back/forward navigation, URL state updates, and direct deep linking to any authorized route without breaking application state or triggering full page reloads.

#### Scenario: Deep linking directly to class session
- **WHEN** an authenticated user opens a direct URL to a specific class or session view in the browser address bar
- **THEN** the application directly loads that view with the requested state without requiring manual navigation from the home page

#### Scenario: Browser back and forward button navigation
- **WHEN** a user clicks the browser back or forward button after navigating across multiple application views
- **THEN** the router transitions to the previous or next view and updates the URL accordingly without performing a full page reload

### Requirement: Active Route Visual Indication
The navigation system SHALL visually indicate the currently active route in navigation bars, sidebars, or tabs, matching the current URL pathname.

#### Scenario: Highlighting active navigation item
- **WHEN** a user navigates to `/classes` or any top-level route
- **THEN** the navigation item for Classes is visually highlighted while other navigation items remain in their default state
