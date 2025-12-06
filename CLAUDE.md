# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Getting Started

**Read [AGENTS.md](AGENTS.md) first** - it contains all project context including:

- `.agent/context/` files (overview, architecture, conventions, commands)
- Self-update protocol for keeping docs current
- Project-specific context links

## Quick Reference

```powershell
npm run dev         # Start dev server (localhost:3000)
npm run build       # Production build
npm run lint        # Ultracite linting
```

## Critical Rules

- **Never** use `any` type - use `unknown` with type guards
- **Always** use ProfileContext for profile mutations
- **Always** check course conflicts before adding courses
- **Server Components by default** - use Client Components only for interactivity

---

**For complete documentation, refer to [AGENTS.md](AGENTS.md).**
