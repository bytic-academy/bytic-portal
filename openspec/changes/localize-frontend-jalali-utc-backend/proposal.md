## Why

Currently, several frontend views and modals leak raw Gregorian calendar dates (such as `2026-09-15` and `2010-05-12`) and native browser `<input type="date">` pickers that do not support the Solar Hijri (Jalali) calendar. For an Iranian educational platform, dates, times, calendars, and date pickers must be seamlessly localized to the Jalali calendar with Persian numerals and month names, while keeping the backend strictly universal, timezone-agnostic, and UTC/ISO-compliant.

## What Changes

- **Backend Invariant**: Maintain strictly universal, UTC and ISO-compliant representations across SQLite, Prisma, and REST APIs (`YYYY-MM-DD` for calendar dates, `HH:MM` for 24h times, and ISO-8601 UTC timestamps for record events like `checkedAt` and `createdAt`). No Jalali calendar logic or local timezone assumptions in the backend.
- **New Single DatePicker Component (`JalaliDatePicker`)**: Build a dedicated, reusable single-date Jalali picker wrapping `react-multi-date-picker` with decade/year/month quick navigation, input masking, clear button, and Tailwind/shadcn dark mode styling.
- **Enhanced Multi-DatePicker (`JalaliMultiDatePicker`)**: Refine dark theme integration and Persian digit badges for batch session creation.
- **Jalali Date/Time Utilities (`src/lib/date.ts`)**: Add helpers for formatting full dates ("سه‌شنبه ۲۴ شهریور ۱۴۰۵"), medium dates ("۲۴ شهریور ۱۴۰۵"), short dates ("۱۴۰۵/۰۶/۲۴"), localized 24h times with Persian numerals ("۱۰:۰۰ تا ۱۱:۳۰"), UTC timestamp formatting, and age calculation.
- **Class Detail & Session Localization**:
  - Replace native single date input in Single Session modal with `JalaliDatePicker`.
  - Format session dates in session cards and attendance sheets using Jalali format.
  - Format session start and end times with Persian numerals.
  - Localize date in the session deletion confirmation prompt.
- **Student Profile Localization**:
  - Replace native date input for student birthdate with `JalaliDatePicker`.
  - Display student birthdate in Jalali format on student cards and enrollment selects.
- **Dashboard Today Badge**:
  - Display today's Jalali date prominently on the Dashboard welcome banner.

## Capabilities

### New Capabilities
- `date-time-localization`: Comprehensive client-side localization of dates, times, calendars, and pickers using the Solar Hijri (Jalali) calendar and Persian numerals, maintaining 100% UTC and ISO Gregorian representation on the backend.

### Modified Capabilities
<!-- No requirement changes to existing base capabilities; all API contracts remain ISO compliant -->

## Impact

- **Frontend Code**: `src/lib/date.ts`, `src/components/JalaliDatePicker.tsx` (new), `src/components/JalaliMultiDatePicker.tsx`, `src/pages/ClassDetailPage.tsx`, `src/pages/StudentsPage.tsx`, `src/pages/AttendanceSheetPage.tsx`, `src/pages/DashboardPage.tsx`, `src/index.css`.
- **Backend Code**: No changes to backend data contracts or database schema; verifies strict UTC / ISO-8601 consistency.
- **Dependencies**: Uses existing installed packages (`react-multi-date-picker`, `react-date-object`, `@fontsource-variable/vazirmatn`).
