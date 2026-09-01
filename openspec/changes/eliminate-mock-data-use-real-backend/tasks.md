## 1. Purge Client Mock Data & Types Cleanup

- [x] 1.1 Ensure all domain types (`Student`, `AttendanceStatus`, `CourseType`, `CreateStudentInput`, etc.) are fully specified in `src/types/attendance.ts`
- [x] 1.2 Remove `src/data/mockStudents.ts` from the codebase

## 2. Refactor Attendance Data Hook

- [x] 2.1 Update `src/hooks/useAttendanceData.ts` to initialize students as `[]` with `isLoading: true`
- [x] 2.2 Remove all mock student generation and silent mock fallbacks on error, implementing reversible optimistic updates with error state

## 3. UI Loading Skeletons, Empty State & Error Display

- [x] 3.1 Implement skeleton card placeholders in `src/components/attendance/AttendanceStats.tsx` when data is loading
- [x] 3.2 Implement skeleton table rows and a clean empty state with CLI seeding instructions in `src/components/attendance/AttendanceTable.tsx`
- [x] 3.3 Update `src/App.tsx` to handle loading, empty, and network error retry workflows seamlessly

## 4. Verification & Build Validation

- [x] 4.1 Run `npm run build` and TypeScript verification to ensure zero type errors or missing import regressions
- [x] 4.2 Verify live database integration and error handling with local API server
