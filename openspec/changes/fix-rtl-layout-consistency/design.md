## Context

See `proposal.md - Why` and `specs/ui-and-theming/spec.md`. The project utilizes Tailwind CSS v4 and React 19. Tailwind v4's logical property classes (`start-*`, `end-*`, `ms-*`, `me-*`, `ps-*`, `pe-*`, `border-s-*`, `border-e-*`) map directly to CSS logical properties (`inset-inline-start`, `inset-inline-end`, etc.) based on document direction `dir="rtl"`.

## Goals / Non-Goals

**Goals:**
- Fix mobile drawer anchoring and sliding animation so it opens from the right in RTL mode.
- Ensure Radix UI `Tabs` triggers and panel contents adhere strictly to RTL flow.
- Ensure Jalali date picker inputs expand to full container width and keep calendar icons neatly embedded.
- Correct outward external navigation icons to point forward (`↖` in RTL).
- Consistently display Persian numerals across all dashboard and entity counters.
- Provide Persian user-facing error messages on login failures.

**Non-Goals:**
- Redesigning application architecture or page workflows.
- Modifying backend APIs or database schemas.
- Changing LTR input behavior for emails or passwords (which must remain `dir="ltr"`).

## Decisions

### Decision 1: Mobile Drawer Logical Positioning
- **Approach**: Replace `isRTL ? 'end-0 border-s' : 'start-0 border-e'` with `start-0 border-e` universally. Under `dir="rtl"`, `start-0` maps to `inset-inline-start: 0` (physical right), and `border-e` maps to `border-inline-end` (physical left divider).
- **Slide Animation**:
  - Open state: `translate-x-0`
  - Closed state in RTL: `translate-x-full` (slides off-screen to the right)
  - Closed state in LTR: `-translate-x-full` (slides off-screen to the left)
- **Alternative Considered**: Hardcoding physical classes (`right-0 border-l`). Rejected because it violates CSS logical property standards and breaks LTR mode when English is selected.

### Decision 2: Radix UI Tabs Direction Propagation
- **Approach**: Wrap `TabsPrimitive.Root` in `src/components/ui/tabs.tsx` so that `dir` is automatically passed or defaulted. It will read `dir` from `useI18n()` or default to `"rtl"`, passing `dir={dir ?? 'rtl'}` to `TabsPrimitive.Root`.
- **Alternative Considered**: Manually passing `dir="rtl"` to every `<Tabs>` call in the app. Rejected because it is error-prone and doesn't protect new tabs created in future development.

### Decision 3: Jalali DatePicker Full-Width Sizing
- **Approach**: In `JalaliDatePicker.tsx` and `JalaliMultiDatePicker.tsx`, add `containerClassName="w-full"` and `className="w-full"` to `<DatePicker>`, with input class containing `w-full pe-10 ps-3`. In addition, ensure `.rmdp-container` has `display: block; width: 100%;` so the input always stretches across the relative wrapper. The icon placed with `absolute end-3` will now always be anchored neatly inside the left/end edge of the input.
- **Alternative Considered**: Wrapping only the input and icon in an inline-block container with fixed width. Rejected because inputs inside responsive forms should fluidly fill their column widths.

### Decision 4: Directional External Action Icons
- **Approach**: Replace `ArrowUpRight` with `ArrowUpLeft` or apply `rtl:-scale-x-100` on forward external action links in `DashboardPage.tsx` and `ClassesPage.tsx`.
- **Rationale**: In Persian (RTL), forward progress flows to the left. `↗` points back towards the text, whereas `↖` points forward and away from the content.

### Decision 5: Numeral Localization via `toPersianDigits`
- **Approach**: Wrap all raw number variables (`courses.length`, `classes.length`, `students.length`, `totalSessions`, `selectedDates.length`) in `toPersianDigits()` from `@/lib/jalali`.
- **Rationale**: Reuses the tested utility already utilized in the Jalali date formatting helpers.

### Decision 6: Localized Persian Auth Error Strings
- **Approach**: In `LoginPage.tsx`, intercept known English auth error messages (such as `"Invalid email or password"`) and map them to friendly Persian text (`"ایمیل یا رمز عبور اشتباه است"`).
- **Rationale**: Keeps the user interface 100% Persian without requiring backend API schema changes.

## Risks / Trade-offs

- **[Risk]**: Third-party `.rmdp-container` CSS specificity overriding `w-full`.
  - **Mitigation**: Add `!w-full` / `containerStyle={{ width: '100%' }}` if needed to ensure rigid full-width expansion across dialog containers.
- **[Risk]**: Radix Tabs keyboard navigation in RTL.
  - **Mitigation**: Radix UI natively flips keyboard arrow keys (ArrowRight vs ArrowLeft) when `dir="rtl"` is properly provided to `TabsPrimitive.Root`, improving accessibility.
