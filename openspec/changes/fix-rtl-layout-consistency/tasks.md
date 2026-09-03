## 1. Navigation and Shell RTL Alignment

- [x] 1.1 Fix `MobileDrawer.tsx` positioning to anchor to `start-0 border-e` and slide out from the right in RTL
- [x] 1.2 Update `src/components/ui/tabs.tsx` so `Tabs` automatically respects and propagates `dir="rtl"`
- [x] 1.3 Update `DropdownMenuSubTrigger` in `src/components/ui/dropdown-menu.tsx` to rotate submenu chevrons with `rtl:rotate-180`

## 2. Form Controls and Pickers RTL Alignment

- [x] 2.1 Update `JalaliDatePicker.tsx` to enforce full-width `.rmdp-container` and embed calendar icon inside input padding
- [x] 2.2 Update `JalaliMultiDatePicker.tsx` to enforce full-width input container and embedded icon alignment

## 3. Directional Icons and Numerals Localization

- [x] 3.1 Replace `ArrowUpRight` with `ArrowUpLeft` in `DashboardPage.tsx` and `ClassesPage.tsx` for forward outbound navigation
- [x] 3.2 Localize dynamic numeric counters on `DashboardPage.tsx`, `ClassesPage.tsx`, and `StudentsPage.tsx` using `toPersianDigits()`
- [x] 3.3 Localize bulk session modal button label counter in `ClassDetailPage.tsx` using `toPersianDigits()`
- [x] 3.4 Localize backend authentication error strings in `LoginPage.tsx` into Persian

## 4. Verification

- [x] 4.1 Run `npm run build` to confirm clean typechecking and bundle compilation
- [x] 4.2 Validate mobile drawer, tabs, and date picker rendering visually
