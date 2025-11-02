# [MAINT-001] - Ultracite Integration Stabilization

**Status:** In Progress  
**Added:** November 2, 2025  
**Updated:** November 2, 2025

## Original Request

Make sure Ultracite is correctly integrated and used in the codebase so that `npm run lint` passes reliably and the tooling enforces the intended rules without overwhelming diagnostics.

## Thought Process

- Current `npm run lint` emits thousands of diagnostics, indicating the existing configuration or code style diverges from Ultracite expectations.
- Some issues stem from legitimate rule violations (e.g., namespace imports, async functions without awaits, `forEach` misuse), while many others are purely formatting-related.
- We need a balanced approach: configure Ultracite to lint only relevant project files, fix genuine rule violations manually, and rely on `ultracite fix` for consistent formatting.
- Success means having a clean lint run (or only intentional rule suppressions) and clear documentation for future contributors.

## Implementation Plan

- [ ] Audit current Ultracite configuration (`biome.jsonc`, npm scripts) and adjust includes/excludes to target project sources while ignoring tooling caches.
- [ ] Fix the high-signal rule violations identified by `ultracite check` (e.g., namespace imports, unnecessary `async`, `forEach` usage).
- [ ] Run `npx ultracite fix` (scoped where possible) to align formatting with Ultracite expectations and ensure clean diffs.
- [ ] Re-run `npm run lint` to confirm zero diagnostics; document any remaining intentional suppressions.

## Progress Tracking

**Overall Status:** In Progress - 15%

### Subtasks

| ID  | Description                                                                              | Status      | Updated     | Notes                                                 |
| --- | ---------------------------------------------------------------------------------------- | ----------- | ----------- | ----------------------------------------------------- |
| 1.1 | Review Ultracite/biome configuration and adjust file targets                             | In Progress | Nov 2, 2025 | Initial review complete; potential ignores identified |
| 1.2 | Resolve priority lint violations (Sentry imports, async handlers, Supabase cookie loops) | Not Started | -           |                                                       |
| 1.3 | Apply Ultracite formatting fixes and re-run lint                                         | Not Started | -           |                                                       |
| 1.4 | Document outcome in Memory Bank and update tasks index                                   | Not Started | -           |                                                       |

## Progress Log

### November 2, 2025

- Captured user request in new maintenance task and outlined action plan.
- Ran `npm run lint` to collect current diagnostics; observed widespread formatting and a few high-priority rule violations.
- Determined need to adjust configuration, fix targeted code issues, and rely on Ultracite auto-formatting.
