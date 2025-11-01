# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Getting Started

**BEFORE STARTING ANY TASK:**

1. **Read [@AGENTS.md](AGENTS.md) in full** - Comprehensive project documentation
2. **Read relevant instructions from [.github/instructions/](.github/instructions/)** based on the task
   - **Important:** Only read instructions relevant to the user's request to avoid context window overload
   - Preview the instruction files to understand which ones apply to the current task

### What's in AGENTS.md
- Memory Bank system (mandatory reading before any task)
- Next.js 16 MCP tools and workflows
- Project architecture and patterns
- Development commands and workflows
- Code style guidelines and standards
- Testing procedures
- Common pitfalls and solutions

### What's in .github/instructions/ (Read Selectively Based on Task)

**Always read for any task:**
- `memory-bank.instructions.md` - Memory Bank system and workflows

**Read based on task type:**
- `nextjs.instructions.md` - When working with Next.js components, routes, or App Router
- `typescript-5-es2022.instructions.md` - When writing TypeScript code
- `ultracite.instructions.md` - Before running linting or fixing code quality issues
- `self-explanatory-code-commenting.instructions.md` - When adding comments or documentation
- `nextjs-tailwind.instructions.md` - When styling components with Tailwind CSS
- `playwright-*.md` - When writing or debugging tests
- `markdown.instructions.md` - When editing .md files
- `powershell.instructions.md` - When writing PowerShell scripts

**Example:** If user asks "Add a new course filter component", read:
- `memory-bank.instructions.md` (always)
- `nextjs.instructions.md` (component work)
- `typescript-5-es2022.instructions.md` (writing TypeScript)
- `nextjs-tailwind.instructions.md` (styling)

## Quick Reference

### Essential Commands
```powershell
npm run dev         # Start development server (localhost:3000)
npm run build       # Production build with TypeScript check
npm run lint        # Lint with Ultracite (Biome-based)
npm run format      # Auto-fix code issues
```

### Before Writing Code
1. Read all Memory Bank files in `memory-bank/` directory
2. Use Next.js MCP tools (`nextjs_docs`, `nextjs_runtime`) for Next.js questions
3. Run `npm run lint` to understand code quality baseline
4. Analyze existing code patterns in the codebase

### Critical Rules
- **Never** use `any` type - use `unknown` with type guards
- **Always** use ProfileContext for profile mutations
- **Always** check course conflicts before adding courses
- **Server Components by default** - use Client Components only for interactivity
- **MCP tools must run sequentially** - never in parallel

---

**For complete documentation, refer to [AGENTS.md](AGENTS.md).**
