# AGENTS.md

> **Self-Evolving Context**: This file and `.agent/` grow with your project. After completing any task, update the relevant files.

---

## Context Update Protocol

**After completing work, agents must:**

1. **Update relevant context files** in `.agent/context/`:

   - Changed project scope? → Update `overview.md`
   - Modified architecture or structure? → Update `architecture.md`
   - Made style/convention decisions? → Update `conventions.md`
   - Added new commands or scripts? → Update `commands.md`

2. **Create new context files** if documenting something that doesn't fit existing files:

   - Place in `.agent/` with a descriptive name (e.g., `api-reference.md`, `database-schema.md`)
   - Add an `@./filename.md` import below

3. **Always log to changelog** at `.agent/context/changelog.md`

---

## Project Context

@./.agent/context/overview.md
@./.agent/context/architecture.md
@./.agent/context/conventions.md
@./.agent/context/commands.md

---

## Recent Activity

@./.agent/context/changelog.md

---

## Project-Specific Context

@./.agent/status.md
@./.agent/tasks/
@./.github/instructions/
