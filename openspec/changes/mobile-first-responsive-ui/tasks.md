## 1. Navigation Shell & Mobile Drawer

- [x] 1.1 Create `src/components/MobileDrawer.tsx` with direction-aware sliding animations (RTL & LTR), backdrop blur overlay, route change auto-closing, and Escape key dismissal
- [x] 1.2 Update `src/components/Header.tsx` to include an accessible hamburger menu trigger button (`md:hidden`) with `min-h-[44px] min-w-[44px]` touch target
- [x] 1.3 Update `src/components/Sidebar.tsx` to support both persistent desktop layout (`hidden md:flex`) and mobile drawer content reuse
- [x] 1.4 Update `src/App.tsx` to manage mobile drawer state, hide desktop sidebar on `< md` viewports, and auto-dismiss on breakpoint transitions

## 2. Streamline Attendance Sheet

- [x] 2.1 Remove the 4 stat summary cards (Date, Time, Attendance count, Participation %) from `src/pages/AttendanceSheetPage.tsx`
- [x] 2.2 Remove batch action buttons ("حاضر زدن همه" and "غایب زدن همه") from `src/pages/AttendanceSheetPage.tsx`
- [x] 2.3 Refactor student list rows with thumb-friendly touch targets (`min-h-[56px]`), clear status toggle buttons, and responsive tap feedback

## 3. Entity Pages Mobile Optimization

- [x] 3.1 Update `src/pages/CoursesPage.tsx` header stacking (`flex-col sm:flex-row`), full-width action button on mobile, and responsive card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- [x] 3.2 Update `src/pages/ClassesPage.tsx` header stacking, action button sizing, and responsive grid
- [x] 3.3 Update `src/pages/ClassDetailPage.tsx` header, responsive tab triggers (`TabsList`), and session/student card grids
- [x] 3.4 Update `src/pages/StudentsPage.tsx` header stacking, full-width action button on mobile, and responsive card grid
- [x] 3.5 Update `src/pages/UsersPage.tsx` header stacking, full-width action button on mobile, and responsive card grid

## 4. Dialogs, Form Inputs & Viewport Polish

- [x] 4.1 Update `src/components/ui/dialog.tsx` `DialogContent` to clamp within mobile viewport bounds (`w-[calc(100vw-1.5rem)] max-w-lg max-h-[85vh] overflow-y-auto`) and stack footer action buttons on mobile
- [x] 4.2 Ensure form inputs across modals use `text-base sm:text-sm` (16px base on mobile) to prevent iOS Safari auto-zoom
- [x] 4.3 Add safe-area insets (`pb-[calc(1rem+env(safe-area-inset-bottom))]`) to main content container in `src/App.tsx`

## 5. Verification & Testing

- [x] 5.1 Run TypeScript typecheck (`npm run typecheck`) to verify zero type errors
- [x] 5.2 Run automated test suite (`npm test`) to ensure all backend and frontend unit tests pass
- [x] 5.3 Run production build (`npm run build`) to verify clean bundle generation
