## Purpose

Provides a deterministic, mobile-first responsive application shell with an accessible slide-out navigation drawer on mobile viewports and a persistent sidebar on desktop displays.

## ADDED Requirements

### Requirement: Direction-Aware Mobile Navigation Drawer
On viewports narrower than 768px (`< md`), the system SHALL provide an accessible slide-out navigation drawer controlled by a dedicated hamburger button in the top header.

#### Scenario: Open drawer on mobile viewports
- **WHEN** user taps the hamburger menu button in the header on a viewport `< 768px`
- **THEN** a slide-out drawer navigation panel SHALL animate into view over a semi-transparent backdrop overlay, locking background body scrolling

#### Scenario: Dismiss drawer on navigation or overlay click
- **WHEN** user taps any navigation link within the drawer, taps the backdrop overlay, presses the Escape key, or taps the close button
- **THEN** the drawer SHALL animate out of view, dismiss the backdrop overlay, unlock body scrolling, and navigate to the selected route

#### Scenario: Direction-aware animation
- **WHEN** the application is viewed in RTL mode (Persian language)
- **THEN** the mobile drawer SHALL slide in from the right viewport edge (`translate-x-0` from `translate-x-full`)
- **WHEN** the application is viewed in LTR mode (English language)
- **THEN** the mobile drawer SHALL slide in from the left viewport edge (`translate-x-0` from `-translate-x-full`)

### Requirement: Responsive Desktop Sidebar Preservation
On viewports at or wider than 768px (`≥ md`), the system SHALL render the standard persistent sidebar and suppress mobile drawer triggers.

#### Scenario: Viewport at or above 768px (md)
- **WHEN** the user views the application on a desktop or tablet screen (`≥ 768px`)
- **THEN** the hamburger menu button in the header SHALL be hidden and the persistent sidebar SHALL be visible in the page flow alongside main content

#### Scenario: Dynamic resize across breakpoint
- **WHEN** an open mobile drawer is active and the viewport is resized to 768px or wider
- **THEN** the mobile drawer and its backdrop SHALL automatically close, unlocking body scroll, and standard desktop sidebar layout SHALL engage seamlessly

### Requirement: Deterministic Mobile Touch Targets and Form Ergonomics
All interactive controls, buttons, inputs, and modals SHALL adhere to mobile ergonomic standards on viewports `< 768px`.

#### Scenario: Mobile touch target minimum sizing
- **WHEN** an interactive button, navigation tab, or status toggle is rendered on mobile
- **THEN** it SHALL provide a minimum touch target height of 44px (`min-h-[44px]` or `h-11`)

#### Scenario: iOS Safari auto-zoom prevention
- **WHEN** a user focuses on any text input, select trigger, or search bar on a mobile device
- **THEN** the base font size of the input SHALL be at least 16px (`text-base sm:text-sm`) so the browser does not trigger automatic page zoom

#### Scenario: Dialog mobile viewport clamping
- **WHEN** any modal dialog is opened on a mobile device (`< 640px`)
- **THEN** the dialog container SHALL be clamped within viewport bounds (`w-[calc(100vw-1.5rem)] max-w-lg`) with a maximum height of `85vh` and vertical scrolling enabled for form content
