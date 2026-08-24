---
name: openspec-apply
description: Implement and execute tasks defined in an OpenSpec change proposal.
---

# OpenSpec Apply Skill

Use this skill to execute the implementation tasks specified in `openspec/changes/<change-name>/tasks.md`.

## Execution Protocol
1. **Load Proposal**: Read `proposal.md`, `design.md`, and `tasks.md`.
2. **Execute Incrementally**: Work task by task, marking items `[x]` as completed.
3. **Verify Standards**:
   - Ensure React 19 compatibility.
   - Verify zero hardcoded `rtl:` or `ltr:` Tailwind variants; use pure logical CSS.
   - Run type checks (`tsc --noEmit`).
   - Run build tests (`vite build`).
4. **Report Progress**: Provide concise summaries after each major task group.
