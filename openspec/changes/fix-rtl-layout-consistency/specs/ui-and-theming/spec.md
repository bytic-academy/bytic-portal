## ADDED Requirements

### Requirement: Directional Mobile Drawer Alignment
The mobile slide-out navigation drawer SHALL anchor to the inline start edge of the viewport (`start-0`) and slide in from the inline start direction, opening from the right side of the screen in RTL mode and from the left in LTR mode.

#### Scenario: Mobile drawer opened in RTL mode
- **WHEN** user taps the mobile hamburger menu button while document direction is RTL
- **THEN** the mobile navigation drawer slides out from the right edge of the screen and is docked at `start-0` with `border-e` divider separating it from the backdrop overlay

#### Scenario: Mobile drawer closed
- **WHEN** user taps the drawer close button, clicks the backdrop overlay, or presses Escape
- **THEN** the drawer slides back out beyond the start edge and dismisses

### Requirement: Radix UI Tabs RTL Direction Propagation
The Tabs component system SHALL propagate RTL directionality to its trigger list and panel contents, ensuring tab triggers flow from right to left and flex layouts inside tab panels maintain right-to-left ordering.

#### Scenario: Class detail tabs rendered
- **WHEN** user navigates to a class detail page in RTL mode
- **THEN** tab triggers are ordered from right to left starting with "جلسات" (Sessions) on the far right, and action headers inside tab panels align title to the right and action buttons to the left

### Requirement: Jalali DatePicker Full-Width Input and Embedded Icon
The Jalali single and multi-date picker wrappers SHALL expand to fill the full width of their parent container (`w-full`), and calendar trigger icons SHALL remain embedded inside the inline-end edge of the input element with appropriate padding (`pe-10 ps-3`).

#### Scenario: Single session date picker modal
- **WHEN** user opens the single session creation modal
- **THEN** the date picker input spans the full container width, and the calendar icon is neatly anchored inside the input on the left (inline end in RTL) without detaching

### Requirement: Directional Navigation Icon Orientation
Forward external navigation links and card actions SHALL use directional arrows that point towards the inline progression direction (top-left / `ArrowUpLeft` in RTL mode) rather than pointing backwards inwards into Persian text.

#### Scenario: Dashboard and classes page navigation links
- **WHEN** user views class cards or the "مشاهده همه کلاس‌ها" button on the dashboard in RTL mode
- **THEN** outbound action arrows point towards the top-left (`↖`), representing forward motion away from the Persian text

### Requirement: Persian Numeral Consistency Across Counters
All numeric statistics, entity badges, student and session counters, and dynamic action button labels SHALL render numbers using Persian numerals (`۰-۹`) instead of Latin digits (`0-9`).

#### Scenario: Dashboard statistics and class counters
- **WHEN** user views dashboard stats, class card student/session counts, or bulk session modal submission buttons
- **THEN** all numeric quantities are formatted with Persian digits (e.g., `۱ دانش‌آموز`, `۶ جلسه`, `ایجاد ۰ جلسه`)

### Requirement: Localized Persian Authentication Error Messages
The authentication interface SHALL display user-facing error notifications and alert boxes in Persian rather than displaying raw English backend error strings.

#### Scenario: Failed login attempt
- **WHEN** user submits invalid credentials on the login screen
- **THEN** an alert displays localized Persian error text explaining that the email or password is incorrect
