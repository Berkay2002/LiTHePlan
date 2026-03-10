# Changelog

## 2026-03-10 - Dependency Upgrade Sweep

Upgraded the root npm dependency manifest to the latest published versions and refreshed `package-lock.json`.

### Updated

- Runtime packages moved forward, including Next.js `16.0.7 -> 16.1.6`, React `19.2.1 -> 19.2.4`, Supabase JS `2.53.0 -> 2.99.0`, Sentry `10.22.0 -> 10.43.0`, Lucide React `0.556.0 -> 0.577.0`, and `react-resizable-panels` `3.0.6 -> 4.7.2`
- Dev tooling moved forward, including Ultracite `6.1.0 -> 7.2.5`, Playwright `1.56.1 -> 1.58.2`, Biome `2.3.2 -> 2.4.6`, Tailwind oxide `4.1.16 -> 4.2.1`, Supabase CLI `2.33.9 -> 2.78.1`, and `@types/node` `^22 -> ^25`
- Added a root `overrides.rollup = 4.59.0` entry to eliminate the transitive high-severity advisory reported through `@sentry/nextjs`

### Verification

- `npx npm-check-updates` now reports that all dependencies match the latest package versions
- `npm audit --json` reports `0` vulnerabilities after the `rollup` override
- Full local `npm ci` materialization was unusually slow on the mounted workspace filesystem, so the upgrade was verified at the manifest and lockfile level rather than by a completed local lint/build pass

---

## 2025-12-06 - Codebase Scan (Evening)

Ran `codebase-scan.md` workflow to verify context accuracy.

### Scanned Directories

- `app/` - 7 subdirs (api, course, login, profile, signup, fonts, .well-known), 6 files
- `components/` - 7 subdirs (auth, course, layout, profile, seo, shared, ui), 111 total files
- `lib/` - 13 utility files (courseFiltering, conflict-utils, logger, rate-limit, etc.)
- `hooks/` - 8 hooks (useCourses, useRealtimeProfiles, usePersistentState, etc.)
- `types/` - 3 files (course.ts, database.ts, profile.ts)
- `utils/supabase/` - 3 files (client, server, session helpers)
- `tests/` - 1 Playwright spec (`search-bar.spec.ts`)

### Verification Result

**All context files are current and accurate.** No updates required:

- `overview.md` - Project description, terminology correct
- `architecture.md` - Tech stack (Next.js 16.0.1, React 19) matches `package.json`
- `conventions.md` - TypeScript/Biome rules verified against `biome.jsonc`
- `commands.md` - npm scripts match `package.json`

---

## 2025-12-06 - Complete Memory Bank Migration

Migrated all documentation from `memory-bank/` into `.agent/` structure.
