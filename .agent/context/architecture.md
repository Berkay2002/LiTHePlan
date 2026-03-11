# Architecture

## Technology Stack

| Layer       | Technology                             |
| ----------- | -------------------------------------- |
| Framework   | Next.js 16.1.6 (App Router, Turbopack) |
| UI          | React 19, Tailwind CSS v4, shadcn/ui   |
| Database    | Supabase (PostgreSQL), @supabase/ssr   |
| State       | React Context + useReducer             |
| Linting     | Ultracite 7 (Biome-based)              |
| Drag & Drop | @hello-pangea/dnd                      |
| Icons       | Lucide React                           |

## Directory Structure

```
LiTHePlan/
├── app/                      # Next.js App Router
│   ├── api/auth/            # Server-side auth helpers (username/email login)
│   ├── api/courses/         # Course filtering API
│   ├── api/profile/         # Profile CRUD
│   ├── login/, signup/      # Auth pages
│   └── profile/[id]/        # Profile view
├── components/
│   ├── course/              # CourseCard, FilterPanel, ConflictModal
│   ├── home-sidebar/        # Homepage-only left shell (filters/search/account)
│   ├── profile/             # ProfileContext (CRITICAL), ProfilePinboard
│   ├── shared/              # AlertBanner, CommandPalette, Navbar
│   └── ui/                  # shadcn/ui primitives (don't edit)
├── hooks/                   # useCourses, useRealtimeProfiles
├── lib/                     # profile-utils, course-conflict-utils
├── types/                   # course.ts, profile.ts
├── utils/supabase/          # client.ts, server.ts, config.ts, admin.ts
└── proxy.ts                 # Auth session refresh (Next.js 16)
```

## Key Files Reference

| File                                    | Purpose                     | When to Edit               |
| --------------------------------------- | --------------------------- | -------------------------- |
| `components/profile/ProfileContext.tsx` | **CRITICAL** - Global state | Profile mutations, storage |
| `types/course.ts`                       | Course interface            | Adding course properties   |
| `types/database.ts`                     | Generated live DB contract  | After schema/RPC changes   |
| `types/profile.ts`                      | Profile state               | Changing profile structure |
| `lib/course-conflict-utils.ts`          | Conflict detection          | Conflict checking patterns |
| `app/api/courses/route.ts`              | Course filtering API        | Adding filters             |
| `app/api/auth/login/route.ts`           | Username/email login bridge | Auth identifier changes    |
| `utils/supabase/admin.ts`               | Server-only admin client    | Service-role DB access     |
| `proxy.ts`                              | Auth tokens                 | Next.js 16 auth            |

## Patterns & Conventions

### Hybrid Storage Pattern

```
User saves profile
    ├── If authenticated → Supabase (cloud)
    └── Else → localStorage (guest)
    └── Fallback to localStorage if Supabase fails
```

### Server vs Client Components

- **Server** (default): Pages, layouts, API routes
- **Client** (`'use client'`): Interactive UI, hooks, ProfileContext
- Supabase browser clients should be created lazily inside client-only effects or event handlers, not during render, so auth pages can prerender safely when local env is incomplete
- Supabase public config is resolved centrally and accepts either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` to keep local/dev environments compatible
- Username login is resolved on the server through `app/api/auth/login/route.ts`: the client posts `identifier + password`, the route looks up the matching profile email with the service-role client in `utils/supabase/admin.ts`, and then completes `signInWithPassword` without exposing whether a username exists
- `public.profiles` is now owner-readable only; browser-side profile reads must be limited to the signed-in user's own row (for example the navbar avatar lookup by `id`), and any privileged lookup must stay server-only

### Data Flow

```
User Action → ProfileContext.action() → Validate → Check Conflicts
    → Dispatch Reducer → Update State → Save to Storage → Re-render
```

### Homepage Shell Pattern

- `app/page.tsx` now routes through `PageLayout` with `mainShell="home-sidebar"` so the homepage can use shadcn `SidebarProvider`/`Sidebar`/`SidebarInset` without changing other `navbarMode="main"` consumers such as the course detail page
- `components/home-sidebar/` owns the homepage-only shell pieces: header/mobile bar, shared filter surface wrapper, account footer, and the matching skeleton
- `components/course/FilterPanel.tsx` now owns the canonical filter controls (`FilterPanelControls`) so the homepage sidebar and any card-based filter surface reuse the same filter UI and behavior
- The homepage left sidebar open state is still persisted through `hooks/useResponsiveSidebar.ts`, while the right `ProfileSidebar` remains an independent persisted surface
- Temporary client-consumed homepage UI kill switches belong in `lib/ui-feature-flags.ts`; the right profile rail is currently controlled by `NEXT_PUBLIC_ENABLE_HOME_PROFILE_SIDEBAR` so the homepage can remove both the rail and its layout offsets without importing the server-side Hypertune adapter into a client component

## Database Schema

**`courses`** (339 rows):

- `id` (TEXT PK) - Course code e.g., 'TSBK02'
- `name`, `credits`, `level` ('grundnivå'|'avancerad nivå')
- `term[]`, `block[]`, `period[]` - Scheduling
- `examination[]`, `campus`, `programs[]`
- `notes` - Contains conflict info (unstructured)
- `orientations[]` - Non-null specialization tags, indexed with GIN for overlap queries and returned by `get_related_courses`

**`academic_profiles`**:

- `id` (UUID PK), `user_id` (FK to auth.users)
- `profile_data` (JSONB) - Full profile JSON
- `is_public` (BOOLEAN) - Sharing enabled
- RLS: Users can only access their own profiles

**`profiles`**:

- `id` (UUID PK, FK to `auth.users`)
- `username`, `email`, `avatar_url`
- RLS: authenticated users can `SELECT`/`INSERT`/`UPDATE` only their own row
- `BEFORE UPDATE` trigger refreshes `updated_at` through `update_updated_at_column()`

## Schema Tracking

- Tracked hardening migration: `supabase/migrations/20260311100000_harden_profiles_and_align_courses.sql`
- That migration moves backup tables from `public` to `archive`, adds `courses.orientations`, tightens `profiles` RLS/function grants, and updates `get_related_courses` plus `import_course_data`
