## Context

Currently, `src/App.tsx` renders `<Sidebar>` unconditionally with a fixed width of `w-64` (256px) in a flex row layout, leaving insufficient space on mobile viewports (< 768px). `src/components/Header.tsx` lacks a mobile navigation trigger. Furthermore, `src/pages/AttendanceSheetPage.tsx` displays 4 statistical summary cards and 2 batch action buttons ("حاضر زدن همه" and "غایب زدن همه") above the student list, which pushes the primary roster below the fold and introduces the risk of accidental mass status changes on touchscreens.

## Goals / Non-Goals

**Goals:**
- Implement a responsive navigation drawer for mobile viewports (`< md` / < 768px) with accessible hamburger trigger in the top header.
- Preserve the persistent desktop sidebar on viewports at or above 768px (`≥ md`).
- Maintain bidirectional (RTL and LTR) direction-aware sliding animations (slide from right in RTL, slide from left in LTR).
- Streamline `AttendanceSheetPage` by completely removing participation stats, progress meters, and batch actions, making the student list immediately accessible above the fold.
- Enforce deterministic touch ergonomics: minimum 44px touch targets, responsive card grids, clamped dialog viewports, and 16px base font on inputs to prevent iOS Safari auto-zoom.

**Non-Goals:**
- Bottom navigation bar (explicitly excluded by user preference in favor of a clean, drawer-only navigation model).
- Retaining any progress bar or participation percentage metrics on mobile or desktop.
- Backend API, Prisma schema, or database modifications.

## Decisions

### Decision 1: Drawer-Only Mobile Navigation Model
- **Choice**: Tapping the hamburger button opens a slide-out drawer (`MobileDrawer`) covering up to 80vw with a backdrop blur overlay. Selecting any route, tapping the backdrop, or pressing Escape dismisses the drawer.
- **Alternatives Considered**: 
  - *Bottom navigation bar*: Excluded to maximize screen real estate for classroom roster viewing.
  - *Hybrid model*: Excluded in favor of unified navigation in the drawer.

### Decision 2: Direction-Aware Drawer Architecture
- **Choice**: Build `src/components/MobileDrawer.tsx` with CSS logical properties and direction detection from `useI18n()`:
  - RTL (`dir="rtl"`): Fixed to `end-0` (right screen edge), entering with `translate-x-0` and exiting with `translate-x-full`.
  - LTR (`dir="ltr"`): Fixed to `start-0` (left screen edge), entering with `translate-x-0` and exiting with `-translate-x-full`.
- **Alternatives Considered**: Using standard left-only sliding sheets, which breaks RTL ergonomics in Persian.

### Decision 3: Streamlining the Attendance Taking View
- **Choice**: Remove the 4 stat cards (Session Date, Time, Attendance Count, Participation %) and the 2 batch action buttons from `AttendanceSheetPage`. Retain a compact header with back button, class name, date/time, and render the student roster directly. Each student card features a 44px+ status toggle pill and whole-card tap handler.
- **Alternatives Considered**: Retaining a mini progress bar or floating counter; user explicitly decided against any progress bar or batch buttons.

### Decision 4: Deterministic Mobile Dialog Clamping
- **Choice**: Update `src/components/ui/dialog.tsx` (`DialogContent`) to use `w-[calc(100vw-1.5rem)] max-w-lg max-h-[85vh] overflow-y-auto` with stacked buttons (`flex-col-reverse sm:flex-row gap-2`).
- **Alternatives Considered**: Fullscreen modal on mobile; rejected because clamped floating dialogs provide better visual context while avoiding edge-overflow.

### Decision 5: Preventing iOS Safari Auto-Zoom
- **Choice**: Update mobile text inputs, datepicker triggers, and select elements to use `text-base sm:text-sm` (16px base on `< sm`, 14px on desktop).
- **Alternatives Considered**: Using meta viewport `maximum-scale=1`, which harms accessibility.

## Risks / Trade-offs

- **[Risk]** Resizing between mobile and desktop viewports while the drawer is open could cause desynchronized states.
  → **Mitigation**: Listen to media query changes / window resize and auto-dismiss drawer state when viewport exceeds 768px.
- **[Risk]** Background page scrolls while the drawer is open on mobile touchscreens.
  → **Mitigation**: Lock document body scrolling (`document.body.style.overflow = 'hidden'`) whenever the drawer is mounted/open.
- **[Risk]** Long student lists on small screens.
  → **Mitigation**: Ensure smooth native scrolling (`-webkit-overflow-scrolling: touch`) and clean row height budgeting.
