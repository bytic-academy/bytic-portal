## 1. Date & Time Engine Utilities

- [x] 1.1 Add `formatJalaliMedium`, `formatLocalizedTime`, and `formatLocalizedDateTime` functions to `src/lib/date.ts`
- [x] 1.2 Add `getJalaliTodayDetails` and `parseJalaliToISO` conversion helpers to `src/lib/date.ts`
- [x] 1.3 Add unit tests in `tests/date.test.ts` covering new formatting, parsing, and leap-year boundaries

## 2. Reusable Jalali DatePicker Component & Theme Styling

- [x] 2.1 Create `src/components/JalaliDatePicker.tsx` single-date picker component supporting ISO Gregorian binding and year/month selector
- [x] 2.2 Add scoped CSS rules in `src/index.css` for `react-multi-date-picker` dark theme integration and Vazirmatn typography
- [x] 2.3 Refine `src/components/JalaliMultiDatePicker.tsx` badge rendering and theme styling

## 3. Class Detail & Session Management Localization

- [x] 3.1 Replace native `<Input type="date">` with `JalaliDatePicker` in single session creation modal of `src/pages/ClassDetailPage.tsx`
- [x] 3.2 Update session cards in `ClassDetailPage.tsx` to display Jalali dates and Persian numerals for time ranges
- [x] 3.3 Localize session dates in deletion confirmation prompts and student enrollment dropdowns

## 4. Student Roster & Profile Localization

- [x] 4.1 Replace native birthdate input with `JalaliDatePicker` in `src/pages/StudentsPage.tsx`
- [x] 4.2 Localize student birthdate display across student cards and detail views

## 5. Dashboard & Attendance Sheet Enhancements

- [x] 5.1 Add localized Jalali today's date badge to the welcome banner in `src/pages/DashboardPage.tsx`
- [x] 5.2 Localize session header date, time ranges, and student `checkedAt` timestamps in `src/pages/AttendanceSheetPage.tsx`

## 6. Verification & Quality Assurance

- [x] 6.1 Run Vitest test suite (`npm run test`) and verify all tests pass
- [x] 6.2 Verify TypeScript type checking (`npm run typecheck`) and Vite production build (`npm run build`)
- [x] 6.3 Validate change artifacts using `openspec validate`
