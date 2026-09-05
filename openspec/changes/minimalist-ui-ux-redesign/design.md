## Context

The system is built on React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS v4, Lucide icons, and Paraglide i18n with Vazirmatn Persian typography. The app supports RTL/LTR layouts with light and dark themes.

As identified in `proposal.md`, current screens carry high visual friction (duplicate header/sidebar brand units, extraneous badges, heavy card grids) and operational friction (taking attendance requires multiple navigational hops and individual clicks for each student).

## Goals / Non-Goals

**Goals:**
- Provide a zero-friction roll call UX on `AttendanceSheetPage` with a 1-click "Mark All Present" bulk action, live ratio counter, and instant search filter.
- Transform the `DashboardPage` from a decorative banner display into an action-first command center highlighting today's scheduled sessions with direct attendance actions.
- Unify the session creation experience in `ClassDetailPage` from two separate modals into one streamlined dialog.
- Convert the session list from noisy individual 3D cards into a scannable timeline view with clear attendance completion indicators.
- Strip all non-essential developer badges and redundant branding from `Header` and `Sidebar`, replacing them with clean breadcrumbs and focused navigation.

**Non-Goals:**
- Rewriting backend database schemas or changing REST API endpoints (Prisma SQLite schema and existing endpoints remain stable).
- Replacing TanStack Router or Paraglide i18n libraries.
- Introducing external heavy UI component libraries.

## Decisions

### Decision 1: Client-Side Parallel Mutation for Bulk "Mark All Present"
- **Approach**: Utilize existing `useToggleAttendance` / `/api/attendance` endpoints. When the user clicks "Mark All Present", the client filters all currently absent or unmarked students and dispatches optimistic updates, syncing them via `Promise.all`.
- **Rationale**: Keeps backend changes to zero while instantly fulfilling user expectations. A dedicated batch endpoint can be introduced later if payload sizes grow beyond typical classroom sizes (15–30 students).
- **Alternatives Considered**: Creating a new backend `/api/attendance/bulk` endpoint. While slightly cleaner over the wire, classroom sizes are small (~20 items) and client orchestration works immediately with zero schema migration risk.

### Decision 2: Contextual Dynamic Breadcrumb in Top Header
- **Approach**: Replace the static title and dev badges in `Header.tsx` with dynamic breadcrumb trails derived from TanStack Router matches (e.g. `داشبورد` or `کلاس‌ها / برنامه نویسی پایتون / جلسه ۴`).
- **Rationale**: Eliminates brand duplication between Header and Sidebar, immediately orienting the teacher in their current hierarchical context.
- **Alternatives Considered**: Removing Header entirely and using purely Sidebar. Discarded because mobile screens require the top header bar for drawer toggling and breadcrumb location.

### Decision 3: Unified Single/Multi-Date Session Creator Dialog
- **Approach**: Replace the separate "جلسه تکی" and "جلسات گروهی" modals with a single "افزودن جلسه / جلسات" modal featuring a toggle between "تک‌جلسه" (single date picker) and "چندجلسه" (`JalaliMultiDatePicker`).
- **Rationale**: Eliminates user confusion on which button to click and consolidates validation and time input logic into one cohesive form.

### Decision 4: Timeline / Scannable List Layout for Sessions
- **Approach**: Present sessions in an ordered list with status indicators:
  - Green subtle badge: `ثبت شده (۱۸/۲۰ حاضر)`
  - Amber subtle badge: `ثبت نشده`
  - Direct quick action button: `ثبت حضور` or `ویرایش حضور`
- **Rationale**: Teachers often have 12–24 sessions per term. Card grids consume huge vertical space and make comparing session attendance difficult. A compact timeline list makes scanning dates and completion effortless.

## Risks / Trade-offs

- **[Risk] High network latency on bulk mark-all if done sequentially** → Mitigation: Use parallel `Promise.all` with TanStack Query optimistic cache update so the UI turns green instantly without waiting for sequential server roundtrips.
- **[Risk] Breadcrumb text truncation on small mobile screens** → Mitigation: Show only the current leaf title on mobile viewports with a simple back button, expanding to full breadcrumb trails on tablets and desktops.
- **[Risk] Teachers accidentally clicking "Mark All Present"** → Mitigation: Display a quick toast with undo or clear visual indication that individual students can still be clicked to mark absent.
