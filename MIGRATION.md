# Migration Guide for AI Agents

Use this file as the prompt you give to your AI agent (Claude, Gemini, Copilot, etc.) to migrate any existing project notes into the AGENTS.md structure. The steps are agent-friendly and non-destructive.

## How to use
- Paste this file into your agent chat and say: "Follow MIGRATION.md to merge my existing notes into this AGENTS.md layout." If the agent asks for confirmation, answer accordingly.
- If you want a dry run first, tell the agent to do a read-only scan and summarize the plan before writing.

## Agent instructions (run in order)
1. **Detect existing notes**: Look for agent or doc folders/files such as agents.md, claude.md, gemini.md, docs/, notes/, ai/, .aider*, .cursor*, .claude*, or other markdown files that look like project context.
2. **Plan mapping** (do not write yet): Map each discovered file into one of these targets:
    - Project overview → .agent/context/overview.md
    - Architecture/structure → .agent/context/architecture.md
    - Conventions/style → .agent/context/conventions.md
    - Commands/scripts → .agent/context/commands.md
    - In-progress or planning docs → .agent/task/
    - Everything else → leave in place and link under Project-Specific Context in AGENTS.md.
3. **Safety first**:
    - Do not delete or overwrite existing files.
    - If a target file already has content, append under a new heading; never discard existing text.
    - If you must move or rename, copy instead and leave the original intact.
4. **Execute merge**:
    - Create missing .agent/context/ files if they are absent.
    - Append mapped content into the target files, preserving headings that clarify the source (e.g., "## Imported from claude.md").
    - For unmapped docs, add @./<relative-path> entries under Project-Specific Context in AGENTS.md (do not wrap paths in code fences).
5. **Log the work**: Add a dated entry to .agent/context/changelog.md summarizing what was imported, what was linked, and any files left untouched.
6. **Report back**: Summarize actions taken, files touched, and any items that need manual review.

## Extra guidance for agents
- Prefer adding links instead of moving files when unsure of fit.
- Keep formatting intact; avoid aggressive rewrites unless asked.
- If you see other frameworks’ metadata (e.g., LangGraph, PromptFoo), link those files rather than merging their schema blindly.
- If conflicts arise, default to appending with clear headings instead of overwriting.

## What success looks like
- No data loss; original files still exist.
- .agent/context/ files contain the important migrated context with source headings.
- AGENTS.md lists any remaining legacy files under Project-Specific Context.
- .agent/context/changelog.md has a fresh entry describing the migration.
