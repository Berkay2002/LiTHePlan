# Architecture

## Technology Stack

| Layer       | Technology                             |
| ----------- | -------------------------------------- |
| Framework   | Next.js 16.1.6 (App Router, Turbopack) |
| UI          | React 19, Tailwind CSS v4, shadcn/ui   |
| Database    | Supabase (PostgreSQL), @supabase/ssr 0.9 |
| State       | React Context + useReducer             |
| Linting     | Ultracite 7 (Biome-based)              |
| Drag & Drop | @hello-pangea/dnd                      |
| Icons       | Lucide React                           |

## Directory Structure

```
LiTHePlan/
├── app/                      # Next.js App Router
│   ├── api/courses/         # Course filtering API
│   ├── api/profile/         # Profile CRUD
│   ├── login/, signup/      # Auth pages
│   └── profile/[id]/        # Profile view
├── components/
│   ├── course/              # CourseCard, FilterPanel, ConflictModal
│   ├── profile/             # ProfileContext (CRITICAL), ProfilePinboard
│   ├── shared/              # AlertBanner, CommandPalette, Navbar
│   └── ui/                  # shadcn/ui primitives (don't edit)
├── hooks/                   # useCourses, useRealtimeProfiles
├── lib/                     # profile-utils, course-conflict-utils
├── types/                   # course.ts, profile.ts
├── utils/supabase/          # client.ts, server.ts, config.ts
└── proxy.ts                 # Auth session refresh (Next.js 16)
```

## Key Files Reference

| File                                    | Purpose                     | When to Edit               |
| --------------------------------------- | --------------------------- | -------------------------- |
| `components/profile/ProfileContext.tsx` | **CRITICAL** - Global state | Profile mutations, storage |
| `types/course.ts`                       | Course interface            | Adding course properties   |
| `types/profile.ts`                      | Profile state               | Changing profile structure |
| `lib/course-conflict-utils.ts`          | Conflict detection          | Conflict checking patterns |
| `app/api/courses/route.ts`              | Course filtering API        | Adding filters             |
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

### Data Flow

```
User Action → ProfileContext.action() → Validate → Check Conflicts
    → Dispatch Reducer → Update State → Save to Storage → Re-render
```

## Database Schema

**`courses`** (339 rows):

- `id` (TEXT PK) - Course code e.g., 'TSBK02'
- `name`, `credits`, `level` ('grundnivå'|'avancerad nivå')
- `term[]`, `block[]`, `period[]` - Scheduling
- `examination[]`, `campus`, `programs[]`
- `notes` - Contains conflict info (unstructured)

**`academic_profiles`**:

- `id` (UUID PK), `user_id` (FK to auth.users)
- `profile_data` (JSONB) - Full profile JSON
- `is_public` (BOOLEAN) - Sharing enabled
- RLS: Users can only access their own profiles
