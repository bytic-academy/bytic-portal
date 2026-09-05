## Why

The current user interface suffers from visual noise (redundant headers, duplicate brand logos, developer badges, aggressive gradients) and high-friction operational flows (taking attendance requires 4–5 nested navigation clicks and individual manual toggles for every single student). Streamlining the interface into a minimalist, calm, and action-oriented experience will drastically cut attendance-taking time for teachers and provide immediate operational clarity for administrators.

## What Changes

- **Streamlined Attendance Workflow (Core Superflow)**:
  - Add a 1-click **"Mark All Present"** bulk action on the attendance sheet, transforming a 20-student roll call from 20 individual clicks into 1 or 2 quick clicks.
  - Add real-time attendance ratio & percentage header stats (e.g. `18 / 20 حاضر • ۹۰٪`).
  - Add an instant student search/filter input on the attendance sheet for rapid lookups in large classes.
  - Redesign student attendance rows with calm, minimal toggle pills and clear visual feedback.

- **Action-Oriented Dashboard**:
  - Replace the oversized static gradient welcome banner with an actionable **"Today's Schedule & Pending Attendance"** widget.
  - Provide a 1-click shortcut directly into today's active session attendance sheet from the dashboard.
  - Simplify dashboard metrics into clean, minimalist summary cards without saturated icon blocks.

- **Minimalist App Shell & Header**:
  - Remove all developer-facing badges (`React 19 & Tailwind v4`, `RTL/LTR`) from the user-facing header.
  - Eliminate duplicate brand titles between Header and Sidebar.
  - Introduce clean dynamic breadcrumb navigation in the top bar (`کلاس‌ها / نام کلاس / جلسه ۳`).
  - Simplify the sidebar into a quiet, focused navigation rail with compact user status.

- **Unified Class & Session Management**:
  - Consolidate the split "Single Session" and "Bulk Sessions" dialogs into a single, intuitive session creator modal supporting single date or multi-date selection.
  - Replace the bulky 3D session cards with a clean, scannable timeline list displaying attendance completion chips (`ثبت شده` vs `ثبت نشده`).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `attendance-system`: Add requirements for bulk attendance marking ("Mark All Present"), live attendance completion ratio counters on session sheets, instant student filtering, and direct dashboard quick-actions for active sessions.
- `ui-and-theming`: Refine UI architecture to mandate minimalist visual hierarchy, eliminate duplicate brand headers, ban developer-jargon badges in production UI, introduce breadcrumb top navigation, and define restrained surface color treatments.

## Impact

- **Affected Code**:
  - `src/components/Header.tsx` (remove badges, add breadcrumb container)
  - `src/components/Sidebar.tsx` (remove duplicate branding, streamline layout)
  - `src/pages/DashboardPage.tsx` (remove giant banner, add today's attendance queue)
  - `src/pages/AttendanceSheetPage.tsx` (add bulk mark-all, live statistics, student search, minimal row design)
  - `src/pages/ClassDetailPage.tsx` (unify session creation modal, compact timeline view with attendance chips)
  - `src/paraglide/messages.js` / messages (new localized strings for bulk actions, search, stats)
- **APIs & Backend**: No breaking backend changes; leverages existing attendance toggle APIs and data hooks.
- **Dependencies**: No new external dependencies required.
