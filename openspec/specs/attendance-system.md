# Bytic Attendance System Specification

## 1. Overview
The Bytic Attendance System is a modern web application designed for Bytic Educational Group to track student attendance across coding courses (Scratch Jr, Scratch Advanced, Kids Web Design, Python Basics).

## 2. Core Capabilities
- **Student Roster Management**: Display student profile, enrolled course, ID, and guardian contact.
- **Attendance Tracking**: Real-time status toggle between Present (`حاضر`), Absent (`غایب`), Late (`با تاخیر`), and Excused/Justified (`غایب موجه`).
- **Live Statistics**: Dynamic calculation of attendance percentages, present/absent counters, and course-level filters.
- **Bilingual & Bidirectional**: Seamless switching between Persian (`fa`, RTL) and English (`en`, LTR).
- **Theme Support**: Light and dark themes matching Bytic.ir brand palette.

## 3. Architectural Invariants
- Zero hardcoded `rtl:` or `ltr:` CSS classes.
- All spacing, borders, positioning MUST use CSS logical properties (`margin-inline`, `padding-inline`, `start`, `end`, etc.).
- All text strings must be externalized via Paraglide i18n messages.
- Vazirmatn variable font is the primary typeface for all Persian and multilingual UI elements.
