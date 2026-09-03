## Purpose

Provides comprehensive client-side localization of dates, times, calendars, and date pickers using the Solar Hijri (Jalali) calendar and Persian numerals, while guaranteeing strict UTC and standard ISO representation across all backend data storage and API contracts.

## ADDED Requirements

### Requirement: Universal UTC and ISO Backend Representation
The system SHALL store and transmit all dates, times, and timestamps using universal, standard ISO formats on the backend without any calendar-specific logic or local timezone assumptions.

#### Scenario: Backend accepts and persists ISO format
- **WHEN** the client creates or updates a session or student record
- **THEN** the backend accepts and validates `YYYY-MM-DD` for dates, `HH:MM` for times, and records timestamps as ISO-8601 UTC strings

### Requirement: Single Date Jalali Picker
The frontend SHALL provide an interactive single-date picker component configured with the Solar Hijri (Jalali) calendar, Persian month names, and fast decade/year/month navigation.

#### Scenario: Selecting a single date
- **WHEN** the user opens the single date picker and selects a date in the Jalali calendar
- **THEN** the picker displays the chosen date in Jalali format and emits the corresponding Gregorian ISO date string (`YYYY-MM-DD`) to the form state

#### Scenario: Clearing a selected date
- **WHEN** the user clicks the clear button on an optional date picker
- **THEN** the picker clears the input and notifies the parent form of an empty value

### Requirement: Jalali Session Date Display
The frontend SHALL format session dates into Solar Hijri (Jalali) strings across session lists, cards, delete confirmations, and attendance sheets.

#### Scenario: Viewing session list
- **WHEN** the user views the session list on the class detail page
- **THEN** each session card displays its date formatted in the Jalali calendar with Persian numerals instead of raw Gregorian digits

#### Scenario: Confirming session deletion
- **WHEN** the user initiates deletion of a session
- **THEN** the confirmation dialog displays the session's date formatted in the Jalali calendar

### Requirement: Localized Session Time Display
The frontend SHALL display session start and end times using localized numerals and 24-hour time formatting.

#### Scenario: Viewing session hours
- **WHEN** session times are displayed on the class detail page or attendance sheet
- **THEN** start and end times are rendered with Persian digits (e.g., "۱۰:۰۰ تا ۱۱:۳۰")

### Requirement: Localized Student Birthdate Display and Input
The frontend SHALL allow entering student birthdates via the Jalali date picker and display stored birthdates in Jalali format across student lists and selection menus.

#### Scenario: Editing student birthdate
- **WHEN** an administrator opens the student creation or edit modal
- **THEN** the birthdate field renders a Jalali single date picker with year/month selection capability

#### Scenario: Viewing student profiles
- **WHEN** student records are viewed in the student list or enrollment dropdown
- **THEN** any configured birthdate is formatted into a readable Jalali date string

### Requirement: Dashboard Today Badge
The frontend SHALL display today's current date in full Jalali format on the dashboard.

#### Scenario: Viewing dashboard
- **WHEN** an authenticated user opens the dashboard page
- **THEN** the welcome banner displays a badge containing today's date formatted with the Persian weekday, day number, month name, and year in Persian numerals
