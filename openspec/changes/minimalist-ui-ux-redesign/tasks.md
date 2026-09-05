## 1. Minimalist App Shell & Header Polish

- [x] 1.1 Remove developer badges (`React 19`, `RTL/LTR`) and redundant branding from `Header.tsx` and verify clean visual topbar renders without console warnings
- [x] 1.2 Implement dynamic contextual breadcrumbs in `Header.tsx` based on active TanStack Router matches and verify breadcrumb trail accurately reflects current route
- [x] 1.3 Clean up `Sidebar.tsx` brand header and profile card into a quiet, minimal navigation layout and verify responsive behavior on desktop and mobile drawer

## 2. Core Attendance Superflow (AttendanceSheetPage)

- [x] 2.1 Add "Mark All Present" bulk action button in `AttendanceSheetPage.tsx` with optimistic status update and verify all students toggle to present with one click
- [x] 2.2 Add live attendance ratio counter and percentage badge (e.g. `18 / 20 حاضر • ۹۰٪`) in the sheet header and verify counters update reactively
- [x] 2.3 Add real-time student search filter input on `AttendanceSheetPage.tsx` and verify filtering operates correctly as user types
- [x] 2.4 Refine attendance list row UI with clean, minimal status indicators and comfortable touch targets, verifying light and dark theme styling

## 3. Action-First Dashboard Experience (DashboardPage)

- [x] 3.1 Replace oversized static gradient banner with a streamlined "Today's Schedule & Attendance" action section in `DashboardPage.tsx` and verify it displays today's sessions accurately
- [x] 3.2 Add 1-click direct link to take/review attendance for today's active classes from the dashboard and verify navigation directly opens the attendance sheet
- [x] 3.3 Redesign dashboard stat cards with minimal, modern typography and clean neutral borders, verifying responsive grid layout across mobile and desktop

## 4. Streamlined Class & Session Management (ClassDetailPage)

- [x] 4.1 Consolidate single and bulk session creation into a unified "Add Sessions" modal supporting single or multi-date picking in `ClassDetailPage.tsx` and verify session creation works in both modes
- [x] 4.2 Redesign sessions list from bulky card grid into a compact, scannable timeline view with attendance completion status chips and verify scannability
- [x] 4.3 Add necessary localized Persian/English strings in Paraglide messages for all new UI controls and verify i18n builds without errors

## 5. End-to-End Verification & Polish

- [x] 5.1 Run TypeScript type check (`npx tsc --noEmit`) and verify zero type errors
- [x] 5.2 Validate OpenSpec change completeness with `openspec validate minimalist-ui-ux-redesign` and verify all checks pass
