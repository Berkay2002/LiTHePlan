# Commands

## Prerequisites

- Node.js 20.9+ (tested on v20.19.0)
- npm 9+
- Supabase account (free tier)

## Setup

```powershell
git clone https://github.com/Berkay2002/LiTHePlan.git
cd LiTHePlan
npm install
# Create .env.local with Supabase credentials
npm run dev
```

For username login and privileged profile lookups, `.env.local` also needs `SUPABASE_SERVICE_ROLE_KEY` on the server.

## Development

```powershell
npm run dev        # Start dev server (localhost:3000)
npm run typecheck  # One-off TypeScript validation
npx tsc --watch --noEmit  # Type checking in separate terminal
```

## Build

```powershell
npm run build      # Production build + TypeScript check
npm start          # Serve production build
```

## Supabase Schema Workflow

Tracked migration for the current hardening pass:

```text
supabase/migrations/20260311100000_harden_profiles_and_align_courses.sql
```

Regenerate `types/database.ts` from the live Supabase project after schema or RPC changes:

```text
Use Supabase MCP: generate TypeScript types and replace types/database.ts with the returned output
```

Equivalent CLI fallback if MCP is unavailable:

```powershell
npx supabase gen types typescript --project-id <project-ref> --schema public | Out-File -Encoding utf8 types/database.ts
```

## Code Quality

```powershell
npm run lint       # Check source folders and core app config files with Ultracite (Biome)
npm run format     # Auto-fix issues
npm run check      # Alias for lint
```

`lint`/`format` are intentionally scoped through `biome.jsonc` to the main application surface:
`app/`, `components/` except `components/ui/`, `hooks/`, `lib/`, `tests/`, `types/`, `utils/`, plus root files such as `next.config.ts`, `proxy.ts`, and instrumentation/config entrypoints. Repo metadata folders like `.agent/`, `.agents/`, `.claude/`, `.github/`, `.vscode/`, and similar support files are force-ignored from the default lint pass.

## Dependency Maintenance

```powershell
npx npm-check-updates           # Show newer available package versions
npx npm-check-updates -u        # Rewrite package.json to latest versions
npm install --package-lock-only --ignore-scripts  # Refresh lockfile without a full local install
npm audit                       # Check the resolved tree for known vulnerabilities
```

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx...
# or NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_ENABLE_HOME_PROFILE_SIDEBAR=false
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SENTRY_AUTH_TOKEN=sntrys_xxx
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXw-xxx
```

Auth notes:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is preferred; `NEXT_PUBLIC_SUPABASE_ANON_KEY` still works as a fallback in `utils/supabase/config.ts`
- `NEXT_PUBLIC_ENABLE_HOME_PROFILE_SIDEBAR` defaults to hidden when omitted; set it to `true` to restore the homepage right profile rail while the temporary kill switch exists
- `SUPABASE_SERVICE_ROLE_KEY` must only be used from server-only modules such as `utils/supabase/admin.ts`
- Login form submissions now post to `/api/auth/login`, which supports both email and username identifiers without exposing username existence

## Testing Checklist (Manual)

### Guest User Flow

1. Navigate to home page without login
2. Filter courses by term, level, campus
3. Add courses via TermSelectionModal
4. Verify conflict detection
5. Check ProfileSidebar credit totals
6. Refresh - profile should persist

### Authenticated User Flow

1. Sign up / log in at `/login`
2. Create profile, add courses
3. Save - check Supabase `academic_profiles`
4. Open in new tab - should sync

### Before Committing

```powershell
npm run lint       # Must pass
npm run typecheck  # Must pass
npm run build      # Must compile
```

## Deployment

```powershell
git push origin main   # Auto-deploys to Vercel
npx vercel             # Manual deployment
```
