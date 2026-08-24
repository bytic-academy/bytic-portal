# Bytic UI & Theming Specification

## 1. Color System
Extracted directly from Bytic.ir:
- **Brand Green (Primary)**:
  - Light mode: `#35b40e`
  - Dark mode: `#3ecf12`
- **Brand Coral/Crimson (Secondary)**:
  - Light mode: `#fb4364`
  - Dark mode: `#fc5c7a`
- **Dark Mode Palette**:
  - Body: `#0e2338`
  - Card/Surface: `#1b344d`
  - Header/Navigation: `#0f1e2f`
  - Input/Border: `#1e3955`
  - Popover/Modal: `#0c243f`

## 2. Typography
- Font Family: `Vazirmatn`, system fallback fonts.
- Loaded via `@fontsource-variable/vazirmatn`.

## 3. RTL-First Design Rules
- Margins: Use `ms-*` (inline-start) and `me-*` (inline-end). Never use `ml-*` or `mr-*`.
- Paddings: Use `ps-*` (inline-start) and `pe-*` (inline-end). Never use `pl-*` or `pr-*`.
- Absolute Positioning: Use `start-*` and `end-*`. Never use `left-*` or `right-*`.
- Text Alignment: Use `text-start` and `text-end`. Never use `text-left` or `text-right` for flowing content.
- Borders: Use `border-s-*`, `border-e-*`, `rounded-s-*`, `rounded-e-*`.
