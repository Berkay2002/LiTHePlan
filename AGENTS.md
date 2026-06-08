# AGENTS.md

## Task Completion Requirements

- `bun run check` and `bun run typecheck` must pass before considering code tasks completed.
- Run the narrowest relevant Playwright check when behavior changes:
  - `bun run test:chromium` for fast browser coverage.
  - `bun run test` before larger UI, routing, profile, auth, or course-search changes.
  - `bun run test -- tests/<file>.spec.ts` for a focused spec.
- Run `bun run build` when changing Next.js routing, server code, config, metadata, environment handling, or anything that may differ between dev and production.
- For docs-only changes, do not run the full suite unless the docs describe commands, generated behavior, or runtime contracts.
- If a required check cannot be run because services or secrets are missing, state exactly what was skipped and why.

## Project Snapshot

LiTHePlan is an unofficial course planning app for Linköping University civil engineering students. It lets students search curated master's courses, build a 90hp profile, validate degree requirements, and share plans.

This is a Next.js 16 App Router application using React 19, TypeScript, Tailwind CSS v4, shadcn/ui-style components, Supabase, Playwright, Ultracite/Biome, Sentry, Hypertune, Vercel Edge Config, and Upstash Redis.

The package manager is Bun. Prefer `bun install`, `bun run <script>`, and `bunx <tool>` for local work.

## Core Priorities

1. Correctness of course data, credit totals, degree validation, and conflict handling.
2. Reliable profile persistence across guest localStorage, authenticated Supabase sync, realtime updates, and share URLs.
3. Fast, accessible course discovery on desktop and mobile.
4. Clear failure behavior for auth, API routes, rate limits, external services, and feature flags.

If a tradeoff is required, choose data correctness and predictable UX over visual novelty or short-term convenience.

## Maintainability

Keep changes small and grounded in existing patterns. Before adding new logic, check whether `lib/`, `hooks/`, `utils/`, or existing components already contain the right abstraction.

Do not duplicate course filtering, profile mutation, conflict detection, API response, validation, logging, or Supabase client logic. Shared behavior belongs in the existing shared modules unless there is a strong reason not to move it.

Avoid adding dependencies unless the benefit is concrete and the tradeoff is worth it. Prefer platform, Next.js, React, Supabase, and existing dependency capabilities first.

## Package Roles

- `app/`: Next.js App Router routes, layouts, pages, metadata, sitemap, robots, and route handlers under `app/api/`.
- `components/course`: Course catalog, filtering, sorting, view modes, course cards, course details, and conflict-resolution UI.
- `components/profile`: Profile state, pinboard, sidebar, summaries, shared-profile rendering, and profile-specific UI.
- `components/home-sidebar`: Home sidebar navigation and responsive sidebar surfaces.
- `components/shared`: App-wide reusable UI such as navbar, search, pagination, command palette, and alert banners.
- `components/ui`: shadcn/ui and Radix-style primitives. Treat these as low-level building blocks; avoid mixing domain logic into them.
- `hooks/`: Client-side state, media query, profile realtime, course loading, command registry, and persistence hooks.
- `lib/`: Shared runtime logic for course filtering, profile utilities, conflicts, validation, API responses, logging, rate limiting, feature flags, and Hypertune access.
- `utils/supabase`: Supabase browser, server, admin, session, and config helpers. Use these instead of creating ad hoc clients.
- `types/`: Shared TypeScript types for courses, profiles, and generated database shapes.
- `generated/`: Generated Hypertune code. Do not hand-edit unless the generation source is unavailable and the change is explicitly temporary.
- `supabase/`: Supabase config and migrations. Keep schema, RLS, auth assumptions, and generated TypeScript types aligned.
- `tests/`: Playwright end-to-end tests. Prefer user-facing locators and add focused coverage for changed flows.
- `public/`: Static assets, app icons, manifest files, logos, and screenshots.
- `.github/instructions`: Detailed project instructions for Next.js, TypeScript, Ultracite, Playwright, SEO, Markdown, and PowerShell work. Read the relevant file before substantial changes in that area.
- `.agents/skills` and `.claude/skills`: Local skills and reference material for agents. Treat them as project guidance, not app source.

## Development Commands

- Install dependencies: `bun install`
- Start dev server: `bun run dev`
- Production build: `bun run build`
- Start production server after build: `bun run start`
- Typecheck: `bun run typecheck`
- Lint/check: `bun run check`
- Auto-fix lint/format issues: `bun run fix`
- Run all Playwright tests: `bun run test`
- Run Chromium Playwright tests: `bun run test:chromium`
- Open Playwright UI: `bun run test:ui`
- Show last Playwright report: `bun run test:report`

## Code Style

- Use TypeScript with strict types. Do not introduce `any`; narrow `unknown` when external data is involved.
- Follow Ultracite/Biome. Let `bun run fix` handle mechanical formatting.
- Use `@/` imports for project-root imports.
- Use Server Components by default. Add `"use client"` only for state, effects, browser APIs, drag and drop, or interactive UI.
- In Next.js 16, await dynamic request APIs such as `cookies()`, `headers()`, `params`, and `searchParams`.
- Keep API route responses consistent with `lib/api-response.ts` and validate inputs through the existing validation patterns.
- Preserve accessible semantics. Playwright tests should prefer role, label, text, and other user-facing locators over implementation selectors.
- Keep comments rare and useful. Explain intent or non-obvious constraints, not the obvious mechanics of the code.

## Data, Auth, and External Services

- Do not hardcode secrets. Use `.env.local` and the existing config helpers.
- Use `utils/supabase/client.ts`, `utils/supabase/server.ts`, and `utils/supabase/admin.ts` instead of constructing Supabase clients inline.
- Keep RLS and auth behavior in mind when changing profile routes, sharing, migrations, or admin access.
- Preserve guest-mode localStorage fallback unless the task explicitly changes that behavior.
- For rate-limited endpoints, keep user-facing errors predictable and avoid leaking debug details.
- Hypertune and Edge Config must degrade through fallbacks when environment variables are absent.

## UI and UX Guidelines

- This is a tool for repeated planning work. Favor dense, scannable, responsive interfaces over marketing-style layouts.
- Course discovery, profile editing, validation feedback, and conflict resolution should remain usable on mobile.
- Use existing UI primitives and icons before adding new component styles.
- Do not bury core planning actions behind decorative UI. Make search, filters, profile changes, and validation state easy to find.
- When changing visible UI, verify the relevant viewport behavior with Playwright or by running the dev server and inspecting it.

## Reference Material

- Project README: `README.md`
- Playwright test guidance: `tests/README.md`
- Next.js guidance: `.github/instructions/nextjs.instructions.md`
- TypeScript guidance: `.github/instructions/typescript-5-es2022.instructions.md`
- Ultracite rules summary: `.github/instructions/ultracite.instructions.md`
- Playwright guidance: `.github/instructions/playwright-typescript.instructions.md`
- SEO guidance: `.github/instructions/seo-instructions.instructions.md`
- Pull request checklist: `.github/pull_request_template.md`

Use these local references before guessing or reaching for web search.
