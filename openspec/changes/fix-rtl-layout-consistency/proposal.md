## Why

The Bytic Attendance system is a Persian-first, RTL-oriented application. While fundamental CSS logical utilities and `<html dir="rtl">` are configured, visual inspection and automated end-to-end browser testing across 20 distinct screens revealed critical directionality defects:
1. The `MobileDrawer` incorrectly uses inverted logic (`isRTL ? 'end-0' : 'start-0'`), opening from the physical left instead of the physical right when tapping the hamburger button.
2. Radix UI `Tabs` defaults internally to `dir="ltr"`, causing the class detail tabs and internal flex layouts to flow left-to-right.
3. The `JalaliDatePicker` input container does not expand full-width inside dialogs, causing the absolute-positioned calendar icon to detach and float hundreds of pixels to the left.
4. Outbound external action arrows (`ArrowUpRight`) point backwards inwards instead of forward to the top-left in RTL layouts.
5. Numeric counters on dashboard cards, class summaries, and bulk creation dialogs leak Latin digits (`0, 1, 6`) instead of Persian numerals (`۰, ۱, ۶`).
6. Authentication error messages from backend API display in English inside Persian alert boxes.

## What Changes

- **Mobile Drawer Orientation**:
  - Correct `MobileDrawer.tsx` positioning to always anchor to `start-0 border-e` (right edge in RTL, left edge in LTR) and animate from `translate-x-full` to `translate-x-0` in RTL.
- **Radix UI Tabs Directionality**:
  - Wrap and configure `Tabs` in `src/components/ui/tabs.tsx` to automatically inherit or default to `dir="rtl"` (or take dynamic direction from `I18nProvider`), ensuring tab triggers start from the right and inner tab panel flex children respect RTL order.
- **Jalali DatePicker Full-Width & Icon Embedding**:
  - Update `JalaliDatePicker.tsx` and `JalaliMultiDatePicker.tsx` to apply `containerClassName="w-full"`, ensure `.rmdp-container` has `w-full` width, and style the input with `w-full pe-10 ps-3` so the calendar icon remains anchored inside the input boundary.
- **Directional Navigation Icons & Submenu Chevrons**:
  - Replace `ArrowUpRight` (`↗`) with `ArrowUpLeft` (`↖` or `rtl:-scale-x-100`) for outbound navigation links in `DashboardPage.tsx` and `ClassesPage.tsx`.
  - Add `rtl:rotate-180` to dropdown submenu triggers (`DropdownMenuSubTrigger`) in `dropdown-menu.tsx`.
- **Persian Numeral Consistency**:
  - Convert all entity counters (total courses, classes, students, sessions) on `DashboardPage.tsx`, `ClassesPage.tsx`, `StudentsPage.tsx`, and the bulk session submission button in `ClassDetailPage.tsx` to Persian digits using `toPersianDigits()`.
- **Persian Error Messaging**:
  - Localize backend authentication error strings in `LoginPage.tsx` so users receive clean Persian messages instead of raw English strings.

## Capabilities

### Modified Capabilities
- `ui-and-theming`: Refine and enforce strict RTL layout rules across mobile drawers, Radix UI primitive directions, date picker containers, directional icons, and numeral localization.

## Impact

- **Frontend Components**:
  - `src/components/MobileDrawer.tsx`: Inversion fix for drawer anchor and transitions.
  - `src/components/ui/tabs.tsx`: Explicit direction handling for `TabsPrimitive.Root`.
  - `src/components/JalaliDatePicker.tsx` & `src/components/JalaliMultiDatePicker.tsx`: Full-width container and icon anchoring.
  - `src/components/ui/dropdown-menu.tsx`: Submenu chevron direction.
  - `src/pages/DashboardPage.tsx`, `src/pages/ClassesPage.tsx`, `src/pages/StudentsPage.tsx`, `src/pages/ClassDetailPage.tsx`: Persian digits and directional arrow icons.
  - `src/pages/LoginPage.tsx`: Localized Persian auth error strings.
- **Backend & Database**: No changes required.
- **Dependencies**: No new external dependencies required.
