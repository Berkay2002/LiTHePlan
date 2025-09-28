# Repository Guidelines

## Project Structure & Module Organization
LiTHePlan runs on Next.js 15 App Router. Routes and layouts live in `app/` (e.g. `app/login`, `app/profile`). UI modules are grouped under `components/` with domain folders like `components/course/` and `components/auth/`. Shared hooks sit in `hooks/`, cross-cutting helpers in `lib/` and `utils/`, and Supabase SQL plus generated types in `supabase/`. Static assets belong in `public/`. Data maintenance scripts such as `scripts/import-courses.js` and `scripts/fetch-course-stats.js` handle ingestion tasks.

## Build, Test, and Development Commands
- `npm run dev`: start the hot-reloading dev server.
- `npm run build`: compile the production bundle; run before deployments or wide-reaching changes.
- `npm run start`: serve the compiled bundle for smoke tests.
- `npm run lint` / `npm run check`: run the Ultracite+Biome lint suite and keep both clean.
- `npm run lint:fix`: apply lint and formatting fixes (alias: `npm run format`); review the diff afterward.

## Coding Style & Naming Conventions
TypeScript strict mode is enforced—avoid `any`, prefer typed helpers, and use named exports unless the App Router needs a default export. Default to Server Components and add `"use client"` only for interactive state. Follow the repo preset: two-space indentation, double quotes, trailing commas. Compose Tailwind classes with `cn` from `lib/utils.ts`, and promote shared UI into `components/ui/` or feature folders.

## Testing Guidelines
Automated suites are not committed yet. Manually cover signup, login, profile planning, and drag-and-drop term cards while running `npm run dev`. Watch for Supabase or runtime warnings and capture the manual checks in your PR. Introduce Vitest and React Testing Library alongside new features that warrant regression coverage, storing tests beside the code they exercise.

## Commit & Pull Request Guidelines
Commits follow Conventional Commits (`feat:`, `fix:`, `refactor:`). Keep changes focused and cite issues or tasks in the body when relevant. Pull requests should outline intent, list executed commands (`npm run lint`, `npm run build`, manual QA), and attach screenshots or clips for UI updates. Flag Supabase schema or data edits so reviewers can plan migrations and seeds.

## Supabase & Configuration Tips
Secrets stay in `.env.local`; do not commit real credentials. Use Supabase clients on the server only—client components should call typed fetch helpers. When modifying SQL in `supabase/`, include forward and rollback steps, refresh `database.types.ts`, and adjust scripts in `scripts/` if column mappings shift. Document new environment variables or policy changes in the same PR.
