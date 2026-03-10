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
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SENTRY_AUTH_TOKEN=sntrys_xxx
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXw-xxx
```

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
