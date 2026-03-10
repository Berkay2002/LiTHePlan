# Changelog

## 2026-03-11 - Build Fixes And Dedicated Typecheck

Made the production build pass locally and added a dedicated TypeScript validation command for faster feedback outside `next build`.

### Updated

- Added `npm run typecheck` as `tsc --noEmit` in `package.json`
- Fixed `components/shared/DynamicNavbar.tsx` by narrowing the profile-edit-only timeline props before using them in the effect dependency list
- Updated `components/login-form.tsx` and `components/auth/LoginForm.tsx` to create the Supabase browser client lazily inside submit/OAuth flows instead of during render, which prevents prerender failures on auth pages when Supabase env is missing during build
- Added `utils/supabase/config.ts` so both Supabase client helpers resolve public credentials from one place and support either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Normalized submitted email input and changed username-login failures to a generic credential error to avoid leaking whether a username exists
- Updated `.agent/context/commands.md` and `.agent/context/architecture.md` to document the new command and the Supabase initialization/env pattern

### Verification

- `npm run typecheck`
- `npm run build`

---

## 2026-03-10 - Navigation/Profile/Supabase Lint Cleanup

Cleaned the scoped files (`components/shared/DynamicNavbar.tsx`, `components/profile/*`, `utils/supabase/*`) to zero Ultracite/Biome errors without changing behavior.

### Updated

- **ProfileDataSkeleton.tsx** – replaced `[...new Array(N)].map((_, i) => ... key={i})` index keys with stable string literal arrays
- **ProfilePinboard.tsx** – removed `index` from error/warning map keys; use 40-char content slice as key
- **ProfileSummary.tsx** – same index-key fix as ProfilePinboard for error/warning maps
- **ProfileSidebar.tsx** – converted non-interactive overlay `<div onClick>` to `<button>`; added `aria-label` and `role="img"` + `aria-label` to SVG pie chart; removed index from segment/legend keys
- **ProfileContext.tsx** – extracted `saveProfileToCloud` helper to bring `saveProfile` complexity from 22 → below 20
- **DynamicNavbar.tsx** – extracted `fetchAvatarUrl` helper and `NavAuthSection` component; replaced three nested `loading ? … : user ? … : …` ternaries with early-return component; refactored mobile main right-side auth to use `NavAuthSection`; brought total complexity from 42 → ≤ 20

### Verification

- `npm exec -- ultracite check components/shared/DynamicNavbar.tsx components/profile/ProfileContext.tsx components/profile/ProfileSummary.tsx components/profile/ProfileSidebar.tsx components/profile/ProfilePinboard.tsx components/profile/ProfileDataSkeleton.tsx utils/supabase/client.ts utils/supabase/server.ts utils/supabase/session.ts` → 0 errors

---

## 2026-03-10 - API Route Lint Cleanup

Cleaned the `app/api/**` route handlers to satisfy the currently reported Ultracite/Biome issues without changing the broader repo surface.

### Updated

- Replaced namespace Sentry imports in the course and profile API routes with named imports
- Extracted course filter parsing/query assembly in `app/api/courses/route.ts` to bring the `GET` handler back under the cognitive complexity limit
- Replaced nested pace ternaries in the course endpoints with small normalization helpers
- Applied scoped formatting fixes in the remaining API route files that were already failing `ultracite check app/api`

### Verification

- `npm run lint -- app/api`

---

## 2026-03-10 - Biome Scope Narrowed To App Code

Updated `biome.jsonc` so the default Ultracite/Biome pass only scans the main application surface instead of the entire repository.

### Updated

- Replaced the repo-wide include glob with explicit source targets: `app/`, `components/`, `hooks/`, `lib/`, `tests/`, `types/`, and `utils/`
- Kept root runtime/config entrypoints in scope, including `next.config.ts`, `proxy.ts`, `playwright.config.ts`, `postcss.config.mjs`, `flags.ts`, and instrumentation files
- Added Biome force-ignore (`!!`) patterns for repo metadata and support files so Ultracite does not crawl `.1code/`, `.agent/`, `.agents/`, `.claude/`, `.github/`, `.vscode/`, or root docs/package metadata during the default lint pass

### Verification

- `npm run lint` is configured to evaluate the application code path rather than repo-support directories and metadata files

---

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

---

## 2026-03-10 - app Lint Cleanup

Focused the `app/**` lint pass on remaining non-API issues and brought the scope back to clean with targeted fixes only.

### Updated

- Ran targeted Ultracite autofix/formatting on `app/**` and kept the scope out of `app/api/**`
- Fixed `app/global-error.tsx` by replacing the Sentry namespace import, adding `lang="en"` to `<html>`, and reformatting the file
- Refactored `app/course/[courseId]/CoursePageClient.tsx` to remove empty callbacks, replace unstable list keys, avoid `Array(6)` placeholder generation, and extract helper sections to satisfy complexity limits without changing behavior
- Refactored `app/course/[courseId]/page.tsx` metadata generation by extracting SEO description/keyword helpers, removing an unused variable, and preserving the existing metadata output shape
- Cleaned `app/profile/[id]/page.tsx`, `app/profile/[id]/ProfilePageClient.tsx`, `app/profile/edit/page.tsx`, and `app/page.tsx` for optional chaining, callback hygiene, regex hoisting, accessibility, and complexity issues
- Accepted formatter-only changes in other `app/**` files touched by the scoped Ultracite pass, including `app/.well-known/vercel/flags/route.ts`, `app/fonts/index.ts`, `app/layout.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/globals.css`, and `app/sitemap.ts`

### Verification

- `npm exec -- ultracite check --max-diagnostics 200 app`

---

## 2026-03-10 - Exclude shadcn UI From Default Lint Scope

Adjusted the default Biome/Ultracite scope to skip `components/ui/**` so lint work can stay focused on application-owned code instead of vendored UI primitives.

### Updated

- Added a `biome.jsonc` exclusion for `components/ui/**/*.{js,jsx,ts,tsx,css}` while keeping the rest of `components/**` in scope
- Updated `.agent/context/conventions.md` to document that `components/ui/` is excluded from the default lint pass
- Updated `.agent/context/commands.md` so the documented lint surface matches the Biome configuration

### Verification

- Full `npm exec -- ultracite check --max-diagnostics none` output no longer reports files under `components/ui/**`
- 2026-03-10: Cleaned scoped course list/filter components by fixing local a11y button issues, replacing `forEach` and index-key patterns, and extracting small helpers to satisfy targeted Ultracite lint.
