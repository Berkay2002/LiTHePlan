# AGENTS.md

> Agent-focused documentation for the LiTHePlan course planning application for Linköping University civil engineering students.

## ⚠️ CRITICAL: Memory Bank Requirement

**BEFORE STARTING ANY TASK, YOU MUST READ ALL MEMORY BANK FILES**

This is not optional. The Memory Bank in `memory-bank/` contains the authoritative project knowledge:
- `projectbrief.md` - Foundation: vision, scope, constraints
- `productContext.md` - User problems and solution design
- `systemPatterns.md` - Architecture and design patterns
- `techContext.md` - Technology stack and setup
- `activeContext.md` - Current work focus and recent changes
- `progress.md` - Feature status and known issues
- `tasks/_index.md` - Task tracking and status

**After every memory reset, read ALL these files first.** The information in this AGENTS.md file is a summary - the Memory Bank is the source of truth.

### Memory Bank Update Workflow

**When making changes to the project**:
1. Update relevant Memory Bank files (e.g., `activeContext.md`, `progress.md`)
2. Document new architectural patterns in `systemPatterns.md`
3. Update task status in `tasks/_index.md` and individual task files
4. Update this AGENTS.md file only if core patterns or workflows change

See `memory-bank.instructions.md` for complete Memory Bank system documentation.

### Before Starting ANY Work
1. ✅ Read all Memory Bank files (listed above)
2. ✅ Check `activeContext.md` for current focus
3. ✅ Review `progress.md` for feature status
4. ✅ Analyze existing code patterns in the codebase
5. ✅ Fetch latest documentation for frameworks/libraries being used
6. ✅ Run `npm run lint` to understand current code quality baseline

## Project Overview

LiTHePlan is a Next.js 15 course planning application that helps Linköping University civil engineering students discover and plan 90hp master's programs (terms 7-9) by filtering 339 curated courses across 25+ specializations and building custom academic profiles.

**Key Technologies**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Supabase (PostgreSQL + Auth), shadcn/ui components

**Architecture**: Hybrid storage pattern (Supabase for authenticated users, localStorage for guests), server-side course filtering via API routes, global state management with React Context + useReducer.

## Critical Domain Knowledge

### Swedish Academic Terminology (DO NOT TRANSLATE)
Courses use Swedish university terms that must be preserved:
- **Level**: `grundnivå` (basic) or `avancerad nivå` (advanced)
- **Terms**: `7`, `8`, `9` (year terms, not semesters)
- **Blocks**: `1`, `2`, `3`, `4` (study periods within terms)
- **Examination**: `TEN` (exam), `LAB` (lab), `PROJ` (project), `SEM` (seminar), `UPG` (assignment)

### Academic Requirements (Hard Constraints)
- **Total Credits**: Exactly 90hp across terms 7, 8, 9
- **Advanced Credits**: Minimum 60hp at "avancerad nivå"
- **No Duplicates**: Same course cannot appear in multiple terms
- **Course Conflicts**: Some courses cannot be taken together (extracted from `notes` field)

### Data Source Disclaimer
The course database (339 curated courses, duplicates/deprecated removed) is **manually compiled, NOT officially from Linköping University**. No real-time synchronization exists. Updates require manual database modifications.

**Note**: The Supabase database contains 475 total rows, but only 339 are active curated courses used in the application after removing duplicates and deprecated entries.

## Setup Commands

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account (free tier)

### Installation
```powershell
# Clone repository
git clone https://github.com/Berkay2002/LiTHePlan.git
cd LiTHePlan

# Install dependencies
npm install

# Configure environment variables
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Start development server
npm run dev
```

### Database Setup
Database is already populated in Supabase. To regenerate course statistics:
```powershell
node scripts/fetch-course-stats.js
```

## Development Workflow

### Starting Development
```powershell
# Start dev server (localhost:3000)
npm run dev

# Run in separate terminal for type checking
npx tsc --watch --noEmit
```

### Build Process
```powershell
# Production build with TypeScript check
npm run build

# Start production server
npm start
```

### Code Quality
```powershell
# Lint with Ultracite (Biome-based)
npm run lint

# Auto-fix issues
npm run format

# Alias for lint
npm run check
```

## Testing Instructions

### Manual Testing Checklist

**IMPORTANT**: Before testing, review `memory-bank/progress.md` for current feature status and known issues.

Test these critical workflows before committing:

**Guest User Flow (localStorage)**:
1. Navigate to home page without logging in
2. Filter courses by term, level, campus
3. Add courses to profile via TermSelectionModal
4. Verify conflict detection triggers for conflicting courses
5. Check ProfileSidebar shows correct credit totals
6. Refresh page - profile should persist

**Authenticated User Flow (Supabase)**:
1. Sign up / log in at `/login`
2. Create profile with courses
3. Save profile - check Supabase `academic_profiles` table
4. Open in new tab/device - profile should sync
5. Edit profile - changes should persist across tabs

**Course Filtering Performance**:
1. Apply multiple filters simultaneously (term + level + campus)
2. Toggle between grid/list view
3. Paginate through results
4. Clear all filters
5. Response time should be < 500ms for all operations

**Conflict Detection**:
1. Add course with conflicts listed in `notes` field
2. Verify ConflictResolutionModal appears
3. Test both "Replace" and "Keep Both" options
4. Ensure bidirectional conflict checking works

**Mobile Responsiveness**:
1. Test on mobile viewport (< 768px)
2. Verify FilterPanel collapses to sidebar
3. Test touch interactions on ProfilePinboard
4. Drag-and-drop should work on touch devices

### Validation Before Committing
```powershell
# Required checks (all must pass)
npm run lint          # Must pass Ultracite checks
npm run build         # TypeScript must compile cleanly

# Recommended checks
# - Test profile operations (add/remove/move courses)
# - Try adding conflicting courses
# - Verify mobile responsive design
```

## Code Style Guidelines

### Before Writing Code (MANDATORY)
1. **Fetch Latest Documentation**: Always use Upstash Context7 tools (`resolve_library_id`, `get_library_docs`) to fetch current framework/library documentation before implementing features
2. **Analyze Existing Patterns**: Study the codebase before adding new code
3. **Consider Edge Cases**: Think through error scenarios
4. **Validate Accessibility**: Ensure WCAG compliance

### TypeScript Standards
- **Strict mode enabled**: No `any` types allowed (use `unknown` + type guards)
- **Type imports**: Use `import type { ... }` for type-only imports
- **Explicit types**: Define interfaces for all props and API responses
- **No non-null assertions**: Avoid `!` operator unless absolutely necessary
- **ES Modules Only**: Never use CommonJS (`require`, `module.exports`)

### Ultracite Rules (Biome-based)
**MANDATORY BEFORE WRITING CODE**:
1. Analyze existing patterns in the codebase
2. Consider edge cases and error scenarios
3. Validate accessibility requirements
4. Follow all rules strictly (zero tolerance)

```typescript
// ✅ Good patterns
const handleClick = () => { /* ... */ };           // Arrow functions
const message = `Hello ${name}`;                    // Template literals
const data = await fetchData();                     // Async/await
const value: unknown = getData();                   // Use unknown, not any
if (typeof value === 'string') { /* type guard */ }

// ❌ Bad patterns (Ultracite will flag)
function handleClick() { /* ... */ }                // Function expressions
const message = "Hello " + name;                    // String concatenation
console.log("debug info");                          // console.log in production
const value = nullableValue!;                       // Non-null assertion
const data: any = getData();                        // Never use 'any'
```

### Component Patterns

**Server Components (default)**:
```typescript
// app/page.tsx - Server Component (NO 'use client')
import CourseGrid from '@/components/course/CourseGrid';

export default async function HomePage() {
  // Can fetch data directly
  const data = await fetchServerData();
  
  return <CourseGrid initialData={data} />;
}
```

**Client Components** (interactive UI):
```typescript
// components/course/FilterPanel.tsx
'use client'; // REQUIRED at top

import { useState } from 'react';
import { useProfile } from '@/components/profile/ProfileContext';

export default function FilterPanel() {
  const [filters, setFilters] = useState({});
  const { addCourse } = useProfile(); // Context hook
  
  return <div>...</div>;
}
```

**CRITICAL RULE**: Never use `next/dynamic` with `{ ssr: false }` in Server Components. Instead:
```typescript
// ✅ Correct: Separate client-only logic
// components/DashboardNavbar.tsx
'use client';
export default function DashboardNavbar() {
  const profile = useProfile();
  return <nav>...</nav>;
}

// app/dashboard/page.tsx (Server Component)
import DashboardNavbar from '@/components/DashboardNavbar';
export default async function DashboardPage() {
  return <><DashboardNavbar /><main>...</main></>;
}

// ❌ Wrong: Dynamic import with ssr:false in Server Component
const Navbar = dynamic(() => import('./Navbar'), { ssr: false }); // ERROR
```

### File Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `CourseCard.tsx`, `FilterPanel.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useCourses.ts`, `useMediaQuery.ts`)
- **Utilities**: `camelCase.ts` or `kebab-case.ts` (e.g., `utils.ts`, `course-utils.ts`)
- **Types**: `camelCase.ts` (e.g., `course.ts`, `profile.ts`)
- **Context Providers**: `PascalCase.tsx` with `Provider` suffix (e.g., `ProfileContext.tsx`)

### Component Organization
```
components/
├── course/          # Course catalog & filtering
│   ├── CourseCard.tsx
│   ├── FilterPanel.tsx
│   ├── ConflictResolutionModal.tsx
│   └── TermSelectionModal.tsx
├── profile/         # Profile builder
│   ├── ProfileContext.tsx      # CRITICAL: Global state
│   ├── ProfilePinboard.tsx
│   └── ProfileSidebar.tsx
├── shared/          # Cross-feature components
│   ├── DynamicNavbar.tsx
│   └── Pagination.tsx
├── layout/          # Page layouts
└── ui/              # shadcn/ui primitives (DON'T MODIFY)
```

**Colocation Rule**: Keep feature-specific components in their domain folders. Shared components go in `shared/`.

## Architecture & Patterns

### Hybrid Storage Pattern (CRITICAL)
Located in `components/profile/ProfileContext.tsx`:

```typescript
// Automatically chooses storage based on auth state
const saveProfile = async (profile: StudentProfile) => {
  if (user) {
    // Authenticated: Try Supabase first
    try {
      await supabase.from('academic_profiles').upsert({
        user_id: user.id,
        profile_data: profile,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      // Graceful degradation to localStorage
      localStorage.setItem('profile', JSON.stringify(profile));
    }
  } else {
    // Guest: Always use localStorage
    localStorage.setItem('profile', JSON.stringify(profile));
  }
};
```

**Why**: No signup friction for guests, reliable fallback if Supabase is down, transparent to consumers.

### State Management (useReducer Pattern)
All profile mutations go through reducer:

```typescript
// ✅ Correct: Use ProfileContext actions
const { addCourse } = useProfile();
await addCourse(newCourse, 7);

// ❌ Wrong: Direct state mutation
profile.terms[7].push(newCourse);
```

Core operations:
```typescript
dispatch({ type: "ADD_COURSE", course, term });
dispatch({ type: "REMOVE_COURSE", courseId });
dispatch({ type: "MOVE_COURSE", courseId, fromTerm, toTerm });
dispatch({ type: "CLEAR_TERM", term });
dispatch({ type: "CLEAR_PROFILE" });
```

All operations automatically:
1. Update profile state (immutably)
2. Recalculate metadata (credits, validation)
3. Persist to storage (Supabase or localStorage)
4. Trigger React re-renders

### Course Conflict Detection (MANDATORY)
Before adding any course, check conflicts using `lib/course-conflict-utils.ts`:

```typescript
import { findCourseConflicts } from '@/lib/course-conflict-utils';

// ALWAYS check before adding
const conflicts = findCourseConflicts(newCourse, currentProfile);
if (conflicts.length > 0) {
  // Show ConflictResolutionModal - give user choice
  showConflictModal({ newCourse, conflicts });
} else {
  // Safe to add
  dispatch({ type: "ADD_COURSE", course: newCourse, term });
}
```

Conflicts are extracted from course `notes` field:
```
Pattern: "The course may not be included in a degree together with: TSBK02, TSBK35"
```

**Never skip conflict checking** - it's a hard requirement for academic integrity.

### Server-Side Filtering Pattern
Course filtering happens in `app/api/courses/route.ts`:

```typescript
// ✅ Correct: Use existing API route
const response = await fetch('/api/courses?term=7&level=avancerad+nivå');
const { courses, pagination } = await response.json();

// ❌ Wrong: Client-side Supabase query
const courses = await supabase.from('courses').select('*'); // Duplicates logic
```

**Why**: Offloads filtering to PostgreSQL (fast), reduces client bundle, easy to add caching.

### Type System Patterns

**Course Type** (`types/course.ts`):
```typescript
interface Course {
  id: string;                              // Course code (e.g., 'TSBK02')
  name: string;
  credits: number;                         // Usually 6hp
  level: 'grundnivå' | 'avancerad nivå';  // Swedish terms
  term: string[];                          // ['7', '8', '9']
  block: string[];                         // ['1', '2', '3', '4']
  period: string[];                        // ['1', '2']
  pace: number;                            // 1.0 = 100%, 0.5 = 50%
  examination: string[];                   // ['TEN', 'LAB', 'PROJ']
  campus: string;                          // 'Linköping' | 'Norrköping'
  programs: string[];                      // Program names
  notes?: string | null;                   // Conflicts, warnings (unstructured)
  huvudomrade?: string | null;             // Subject area (Swedish)
  examinator?: string | null;
  studierektor?: string | null;
}
```

**Profile Type** (`types/profile.ts`):
```typescript
interface StudentProfile {
  id: string;
  name: string;
  terms: Record<'7' | '8' | '9', Course[]>;
  metadata: {
    total_credits: number;        // Auto-calculated
    advanced_credits: number;     // Auto-calculated
    is_valid: boolean;            // Auto-calculated
  };
}
```

**Type Guards** (always use for validation):
```typescript
// Runtime validation
export function isValidCourse(course: unknown): course is Course {
  return (
    typeof course === 'object' &&
    course !== null &&
    'id' in course &&
    typeof course.id === 'string' &&
    // ... more checks
  );
}
```

## Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `types/course.ts` | Course interface & validation | Adding course properties |
| `types/profile.ts` | Profile state, operations, validation | Changing profile structure |
| `components/profile/ProfileContext.tsx` | **CRITICAL** - Global state management | Profile mutations, storage logic |
| `lib/profile-utils.ts` | Profile CRUD operations | Profile business logic |
| `lib/course-conflict-utils.ts` | Conflict detection logic | Conflict checking patterns |
| `app/api/courses/route.ts` | Course filtering API | Adding filters, pagination |
| `utils/supabase/server.ts` | Server-side Supabase client | Server auth/data access |
| `utils/supabase/client.ts` | Client-side Supabase client | Client auth/data access |
| `middleware.ts` | Auth session refresh | Auth token management |

## Database Schema

### Supabase Tables

**`courses`** (339 active curated courses, 475 total rows including duplicates/deprecated):
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,                    -- Course code (e.g., 'TSBK02')
  name TEXT NOT NULL,
  credits NUMERIC NOT NULL DEFAULT 6,     -- HP
  level TEXT NOT NULL,                    -- 'grundnivå' | 'avancerad nivå'
  term TEXT[] NOT NULL,                   -- ['7', '8', '9']
  period TEXT[] NOT NULL,                 -- ['1', '2']
  block TEXT[] NOT NULL,                  -- ['1', '2', '3', '4']
  pace NUMERIC NOT NULL DEFAULT 1.0,      -- 1.0 = 100%, 0.5 = 50%
  examination TEXT[] NOT NULL,            -- ['TEN', 'LAB', 'PROJ']
  campus TEXT NOT NULL,                   -- Campus location
  programs TEXT[] NOT NULL,               -- Program names (25+ programs)
  notes TEXT,                             -- Restrictions (unstructured)
  huvudomrade TEXT,                       -- Subject area (Swedish)
  examinator TEXT,                        -- Course examiner
  studierektor TEXT,                      -- Study director
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`academic_profiles`** (user profiles):
```sql
CREATE TABLE academic_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Course Profile',
  profile_data JSONB NOT NULL,           -- StudentProfile JSON
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_profiles_user_id ON academic_profiles(user_id);

-- RLS: Users can only access their own profiles
ALTER TABLE academic_profiles ENABLE ROW LEVEL SECURITY;
```

### Database Access Patterns

**Server-side** (in API routes, Server Components):
```typescript
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from('courses').select('*');
  return NextResponse.json(data);
}
```

**Client-side** (in Client Components):
```typescript
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('academic_profiles').select('*');
```

## Common Pitfalls & Solutions

### ❌ DON'T: Mutate profile state directly
```typescript
// Bad - bypasses validation and storage
profile.terms[7].push(newCourse);
```

### ✅ DO: Use ProfileContext actions
```typescript
// Good - handles everything correctly
const { addCourse } = useProfile();
await addCourse(newCourse, 7);
```

---

### ❌ DON'T: Fetch courses client-side
```typescript
// Bad - duplicates API logic
const courses = await supabase.from('courses').select('*');
```

### ✅ DO: Use existing API route
```typescript
// Good - use app/api/courses/route.ts
const response = await fetch('/api/courses?term=7&level=avancerad+nivå');
```

---

### ❌ DON'T: Store user data in localStorage for authenticated users
```typescript
// Bad - ignores Supabase storage
localStorage.setItem('profile', JSON.stringify(profile));
```

### ✅ DO: Let ProfileContext handle storage
```typescript
// Good - automatically chooses Supabase or localStorage
await saveProfile(updatedProfile);
```

---

### ❌ DON'T: Skip conflict checking
```typescript
// Bad - might allow conflicting courses
dispatch({ type: "ADD_COURSE", course, term });
```

### ✅ DO: Always check conflicts first
```typescript
// Good - validates before adding
const conflicts = findCourseConflicts(newCourse, profile);
if (conflicts.length > 0) {
  showConflictModal();
} else {
  dispatch({ type: "ADD_COURSE", course, term });
}
```

---

### ❌ DON'T: Use next/dynamic with ssr:false in Server Components
```typescript
// Bad - causes build error
const Navbar = dynamic(() => import('./Navbar'), { ssr: false });
```

### ✅ DO: Extract to Client Component
```typescript
// Good - create separate Client Component
'use client';
export default function ClientNavbar() { /* ... */ }
```

## Pull Request Guidelines

### Title Format
```
[component] Brief description

Examples:
[ProfileContext] Add course conflict detection
[FilterPanel] Fix mobile responsive layout
[API] Optimize course filtering performance
```

### Required Checks Before Submission
```powershell
npm run lint          # Must pass Ultracite checks
npm run build         # TypeScript must compile cleanly
```

### Review Checklist
- [ ] TypeScript compiles without errors
- [ ] Ultracite linting passes
- [ ] No `console.log` in production code
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] Mobile responsive design verified
- [ ] Profile operations tested (add/remove/move courses)
- [ ] Conflict detection works for affected courses
- [ ] No direct state mutations (use ProfileContext actions)

### Commit Message Conventions
Follow Conventional Commits:
```
feat: Add drag-and-drop to ProfilePinboard
fix: Resolve localStorage persistence bug
refactor: Extract conflict logic to utility
docs: Update API documentation
style: Fix Tailwind class ordering
test: Add ProfileContext tests
```

## Debugging & Troubleshooting

### Common Issues

**Issue**: "Cannot use hooks in Server Component"
```typescript
// Error: useProfile() in Server Component
export default function Page() {
  const profile = useProfile(); // ❌ Error
}

// Solution: Move to Client Component
'use client';
export default function ProfileView() {
  const profile = useProfile(); // ✅ Works
}
```

**Issue**: "Supabase CORS error"
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
- Verify `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` matches project
- Ensure URL matches Supabase project dashboard

**Issue**: "localStorage not defined (SSR)"
```typescript
// ❌ Wrong: Direct localStorage access
const data = localStorage.getItem('profile');

// ✅ Correct: Check window exists
if (typeof window !== 'undefined') {
  const data = localStorage.getItem('profile');
}
```

**Issue**: "Drag-drop not working on mobile"
- Ensure `@hello-pangea/dnd` DragDropContext wraps components
- Check touch event handlers are passive
- Test on iOS Safari (has specific touch quirks)

**Issue**: "Profile not persisting across tabs"
- Verify user is authenticated (check auth state)
- Check Supabase RLS policies allow user access
- Confirm realtime subscription is active
- Look for errors in browser console

### Debugging Tools
- **React DevTools**: Component tree, props, state
- **Supabase Studio**: Database explorer, logs, RLS policies
- **Network Tab**: API calls, response times, errors
- **Lighthouse**: Performance, accessibility audits
- **TypeScript**: `npx tsc --noEmit` for type checking

### Performance Monitoring
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **API Response**: Target < 500ms for course filtering
- **Profile Save**: Target < 200ms (localStorage), < 1s (Supabase)

## Security Considerations

### Authentication Patterns
- **Supabase Auth**: Handles email/password, session management
- **Middleware**: Auto-refreshes auth tokens (`middleware.ts`)
- **RLS Policies**: Users can only access their own profiles
- **No API keys in client**: Use `NEXT_PUBLIC_*` for public keys only

### Input Validation
```typescript
// Always validate external data
import { isValidCourse } from '@/types/course';

const data = await response.json();
if (!isValidCourse(data)) {
  throw new Error('Invalid course data');
}
```

### SQL Injection Prevention
- **Use Supabase query builder** (parameterized queries)
- **Never** concatenate user input into raw SQL
- Supabase handles sanitization automatically

## Build and Deployment

### Vercel Deployment
```powershell
# Automatic deployment on push to main
git push origin main

# Manual deployment
npx vercel

# Environment variables set in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

### Build Configuration
- **Framework**: Next.js 15
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18+

### Environment Variables
Required in `.env.local` (development) and Vercel dashboard (production):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
```

## Additional Resources

### Memory Bank (PRIMARY SOURCE - READ FIRST)
**Location**: `memory-bank/` - **MANDATORY TO READ BEFORE ANY TASK**

**Core Files (Read in order)**:
1. `projectbrief.md` - Foundation: vision, scope, success criteria, constraints
2. `productContext.md` - Why this exists, user problems, solution design
3. `systemPatterns.md` - Architecture patterns, design decisions, key patterns
4. `techContext.md` - Technology stack, setup instructions, dependencies
5. `activeContext.md` - **CURRENT** work focus, recent changes, active decisions
6. `progress.md` - Feature completion status, what works, known issues
7. `tasks/_index.md` - Task tracking, status, and history

**After reading Memory Bank, then consult**:

### Project Documentation Standards

This project follows strict conventions defined in `.github/instructions/`:

- **memory-bank.instructions.md**: Memory Bank system documentation (READ THIS FIRST)
  - Defines the complete Memory Bank system and workflows
  - **MANDATORY**: Read all Memory Bank files before starting any task

- **nextjs.instructions.md**: Next.js 15 App Router best practices
  - **MANDATORY**: Always fetch latest Next.js documentation using Context7 tools before implementing features
  - **MANDATORY**: Use Server Components by default, Client Components only for interactivity

- **typescript-5-es2022.instructions.md**: TypeScript 5 standards
  - **MANDATORY**: Avoid `any` type - use `unknown` with type guards
  - **MANDATORY**: Use ES modules only (never CommonJS)
  - **MANDATORY**: Enable strict mode, use explicit types

- **ultracite.instructions.md**: Biome linting rules (200+ strict rules)
  - **MANDATORY**: Analyze existing patterns before writing code
  - **MANDATORY**: No `console.log` in production, no `any` type
  - **MANDATORY**: Validate accessibility requirements

- **self-explanatory-code-commenting.instructions.md**: Comment guidelines
  - **MANDATORY**: Write self-documenting code, minimize comments
  - **MANDATORY**: Comment only WHY, not WHAT

Always reference these files for detailed guidance on specific topics.

### External Dependencies
- **Supabase Docs**: https://supabase.com/docs
- **Next.js 15 Docs**: https://nextjs.org/docs
- **shadcn/ui Components**: https://ui.shadcn.com/
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **Ultracite Linting**: https://github.com/biomejs/biome

---

**Built for Linköping University civil engineering students** | For questions about architecture or patterns, refer to Memory Bank documentation in `memory-bank/` directory.
