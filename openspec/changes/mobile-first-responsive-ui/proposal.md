## Why

The Bytic Attendance system is used in active classroom environments where instructors and teachers frequently access the application using smartphones and mobile devices. Currently, the interface is desktop-centric: the sidebar is fixed at 256px wide and permanently rendered in flow, breaking mobile viewports under 768px and leaving almost no room for content. In addition, the attendance sheet is cluttered with statistical cards and batch action buttons that push the actual student roster below the fold. A deterministic, mobile-first design with a drawer-only navigation model and a streamlined attendance register is required.

## What Changes

- **Mobile Navigation Shell (`< md` Viewports)**:
  - Add a responsive hamburger trigger button to the top header (`md:hidden`) with a minimum 44px touch target.
  - Create a direction-aware slide-out `MobileDrawer` component supporting RTL (slides from right) and LTR (slides from left) with backdrop overlay blur and automatic dismissal on route change or backdrop tap.
  - Hide the persistent desktop sidebar on mobile (`hidden md:flex`) and preserve it on desktop viewports (`≥ md`).
- **Streamlined Attendance Register**:
  - **BREAKING (UI)**: Remove the attendance participation percentage card, session stat counters (present/absent summary cards), and batch action buttons ("حاضر زدن همه" / "غایب زدن همه") from `AttendanceSheetPage`.
  - Present the student roster immediately at the top of the session view with high-contrast, thumb-friendly status toggles (minimum 44px touch target height) and smooth feedback.
- **Deterministic Responsive Grids & Stacking**:
  - Convert all multi-column entity grids (`CoursesPage`, `ClassesPage`, `StudentsPage`, `UsersPage`, `ClassDetailPage`) into single-column layouts on mobile (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - Stack page headers and action buttons vertically on mobile (`flex-col sm:flex-row`), expanding primary action buttons to full width (`w-full sm:w-auto h-11 sm:h-9`) for effortless thumb tapping.
- **Form Inputs & Dialog Viewport Clamping**:
  - Clamp modal dialogs (`DialogContent`) to mobile screens with `w-[calc(100vw-1.5rem)] max-w-lg max-h-[85vh] overflow-y-auto`.
  - Set form input font sizes to 16px base (`text-base sm:text-sm`) to prevent automatic iOS Safari viewport zooming on focus.
  - Add safe-area insets (`pb-[calc(1rem+env(safe-area-inset-bottom))]`) to avoid clipping on modern mobile devices.

## Capabilities

### New Capabilities
- `mobile-responsive-shell`: Deterministic mobile-first application shell providing a direction-aware slide-out drawer on mobile viewports (`< md`), persistent sidebar on desktop (`≥ md`), responsive top header, and mobile touch ergonomics.

### Modified Capabilities
- `attendance-system`: Streamline the attendance session taking interface by eliminating progress metrics and batch quick actions, presenting a distraction-free student roster with thumb-friendly attendance toggles.

## Impact

- **Frontend Components**:
  - `src/App.tsx`: Layout shell responsiveness, drawer state management.
  - `src/components/Header.tsx`: Responsive hamburger button trigger.
  - `src/components/Sidebar.tsx`: Adaptation for persistent desktop vs mobile drawer rendering.
  - `src/components/MobileDrawer.tsx` (new): Direction-aware slide-out navigation sheet.
  - `src/pages/AttendanceSheetPage.tsx`: Removal of stats bar, progress bar, and batch action buttons; touch target optimization.
  - `src/pages/CoursesPage.tsx`, `src/pages/ClassesPage.tsx`, `src/pages/StudentsPage.tsx`, `src/pages/UsersPage.tsx`, `src/pages/ClassDetailPage.tsx`: Header stacking and responsive card grids.
  - `src/components/ui/dialog.tsx`: Mobile viewport clamping and scrolling.
- **Backend & Database**: Zero changes. All APIs and schemas remain intact.
- **Dependencies**: No new external dependencies required; uses existing Radix UI primitives, Tailwind CSS v4, Lucide icons, and Paraglide i18n.
