## Context

See `proposal.md` for motivation. The application currently has `react-multi-date-picker` and `react-date-object` installed in `package.json`, which are used in `JalaliMultiDatePicker.tsx` for bulk session creation. However, single date inputs across `ClassDetailPage.tsx` and `StudentsPage.tsx` rely on the browser's native `<input type="date">`, causing raw Gregorian dates and English numerals to appear in the UI. The backend runs on a custom Node.js HTTP server with Prisma, SQLite, and LibSQL adapter, with all dates and times stored as ISO strings and UTC timestamps.

## Goals / Non-Goals

**Goals:**
- Provide a reusable `JalaliDatePicker` component for all single-date selection needs (sessions, birthdates).
- Standardize all date and time formatting via centralized utilities in `src/lib/date.ts`.
- Ensure all calendar popups and inputs seamlessly support dark mode matching Bytic brand colors.
- Maintain 100% standard ISO and UTC formats across the backend without introducing any calendar or timezone dependencies to server code.

**Non-Goals:**
- Modifying backend database schemas or changing API payload formats (APIs remain ISO-8601).
- Building a calendar engine from scratch (we leverage the existing `react-multi-date-picker` and `react-date-object`).
- Complex custom analog clocks for time inputs (clean 24-hour inputs with preset badges and Persian digit formatting suffice).

## Decisions

### Decision 1: Dedicated `JalaliDatePicker` Component Wrapping `react-multi-date-picker`
- **Choice**: Create `src/components/JalaliDatePicker.tsx` supporting single date selection, handling ISO Gregorian string values (`YYYY-MM-DD`), converting to/from Jalali `DateObject`, and presenting a clean Shadcn UI-styled input trigger.
- **Why**: Centralizes conversion logic, placeholder handling, clearable optional values, and year/month selector configuration in one place.
- **Alternatives Considered**:
  - *Native `<input type="date">`*: Does not support Solar Hijri calendar or Persian numerals on standard browsers.
  - *Writing a custom calendar grid*: High complexity, prone to leap-year edge cases, already solved by `react-multi-date-picker`.

### Decision 2: Dark Theme Integration via Scoped Global CSS
- **Choice**: Add theme overrides in `src/index.css` targeting `.rmdp-container`, `.rmdp-wrapper`, `.rmdp-day`, and header navigation elements using CSS custom properties (`--background`, `--card`, `--primary`, `--border`).
- **Why**: `react-multi-date-picker` default styling does not inherit Tailwind dark mode classes automatically. Scoped CSS rules ensure consistent typography (Vazirmatn) and colors in both light and dark modes.
- **Alternatives Considered**: Passing inline style objects to each picker instance (duplicative and difficult to maintain).

### Decision 3: Client-Side Boundary Transformation Pattern
- **Choice**: All transformations between Jalali and Gregorian ISO occur strictly at the frontend boundary (UI components and formatting helpers).
- **Why**: Keeps the backend universal, predictable, and standard. If users from different timezones or systems interact with the API, standard ISO/UTC remains the universal contract.

### Decision 4: Formatters in `src/lib/date.ts`
- **Choice**: Expand `src/lib/date.ts` with:
  - `formatJalaliFull(isoDate: string)`: "سه‌شنبه ۲۴ شهریور ۱۴۰۵"
  - `formatJalaliMedium(isoDate: string)`: "۲۴ شهریور ۱۴۰۵"
  - `formatJalaliShort(isoDate: string)`: "۱۴۰۵/۰۶/۲۴"
  - `formatLocalizedTime(timeStr: string)`: "۱۰:۰۰ تا ۱۱:۳۰"
  - `formatLocalizedDateTime(utcIsoStr: string)`: Localized date + time from UTC timestamp
  - `getJalaliTodayDetails()`: Current date in Jalali with weekday name

## Risks / Trade-offs

- **[Risk] Leap year calculations in Solar Hijri**: Handled by `react-date-object/calendars/persian` which uses astronomical algorithms (Birashk algorithmic system).
  - *Mitigation*: Unit tests in `tests/date.test.ts` verify roundtrip conversion and leap-year boundary handling.
- **[Risk] Student birthdate navigation across decades**: Navigating from 1405 back to 1385 by clicking "previous month" is tedious.
  - *Mitigation*: Enable month/year selector view on `JalaliDatePicker` so users can pick year and month in two clicks.
- **[Risk] Unsaved raw date strings in forms**: Empty string or undefined when clearing optional date.
  - *Mitigation*: `JalaliDatePicker` handles `null` / empty string and invokes `onChange('')`.
