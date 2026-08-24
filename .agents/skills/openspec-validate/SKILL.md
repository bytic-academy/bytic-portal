---
name: openspec-validate
description: Validate changes and specifications against OpenSpec standards and schema rules.
---

# OpenSpec Validate Skill

Use this skill to audit project specifications, change proposals, and compliance with project architectural constraints.

## Validation Checklist
- **Structure**: Validates presence of `proposal.md`, `design.md`, and `tasks.md`.
- **RTL & Logical CSS Compliance**: Confirms no prohibited `rtl:` or `ltr:` classes are introduced.
- **Color Tokens**: Confirms styles reference Bytic design tokens rather than arbitrary raw colors.
- **i18n Coverage**: Checks that all user-facing strings have corresponding keys in `messages/fa.json` and `messages/en.json`.
- **Type Safety**: Verifies TypeScript compiles without errors.
