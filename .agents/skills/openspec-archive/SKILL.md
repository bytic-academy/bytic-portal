---
name: openspec-archive
description: Archive completed OpenSpec changes and synchronize main project specifications.
---

# OpenSpec Archive Skill

Use this skill when all tasks in a change proposal are implemented and verified.

## Workflow
1. **Verify Completion**: Confirm all tasks in `tasks.md` are marked `[x]` and passing all tests.
2. **Merge Deltas**: Update the canonical specifications in `openspec/specs/` with the deltas from the change.
3. **Move to Archive**: Move `openspec/changes/<change-name>` to `openspec/archive/<timestamp>-<change-name>`.
4. **Log Completion**: Record the change summary in the project specification changelog.
