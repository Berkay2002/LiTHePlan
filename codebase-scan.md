# Codebase Scan Playbook

Use this when you need to pull fresh context from the repository (code + docs) and feed it into the AGENTS.md structure.

## What to gather
- High-level purpose and domain from README and top-level docs.
- Runtime entry points, major modules, and data flows.
- Build/dev/test commands found in package manifests or scripts.
- Coding conventions observed in the code (lint configs, style files).
- Any generated or vendored areas to avoid summarizing (e.g., dist/, build/, node_modules/).

## How to scan
1. Enumerate source roots (e.g., src/, app/, services/, backend/, frontend/) and list main languages/frameworks.
2. Read key entry files (index/main/app/server) to map startup flow and dependencies.
3. For each major module, skim public interfaces and note responsibilities and cross-module calls.
4. Inspect configs (package.json, pyproject.toml, tsconfig, docker files, CI) for commands and environment requirements.
5. Skip noisy directories: node_modules, dist, build, .next, .turbo, .venv, coverage, .git.

## Where to write
- Add architecture/system notes to .agent/context/architecture.md.
- Add project purpose and domain summary to .agent/context/overview.md.
- Add commands you find to .agent/context/commands.md.
- Add observed conventions (lint rules, formatting, typing strictness) to .agent/context/conventions.md.
- Log what you scanned in .agent/context/changelog.md with paths touched and summaries added.

## Safety
- Do not delete or overwrite existing context; append under a new heading (e.g., "Code scan YYYY-MM-DD").
- Keep code snippets short; prefer summaries over large excerpts.
- If uncertain about a module, add a note for follow-up instead of guessing.
