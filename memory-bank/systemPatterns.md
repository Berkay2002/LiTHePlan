# System Patterns

## Architecture Overview

### High-Level Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                │
├─────────────────────────────────────────────────────────┤
│  Server Components        │     Client Components       │
│  - Pages (data fetch)     │     - Interactive UI        │
│  - Layouts                │     - ProfileContext        │
│  - API Routes             │     - Course filters        │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐        ┌──────▼──────┐
         │  Supabase   │        │ localStorage│
         │  PostgreSQL │        │  (Fallback) │
         └─────────────┘        └─────────────┘
```

### Data Flow Pattern
```
User Action (Add Course)
    │
    ▼
ProfileContext.addCourse()
    │
    ├─► Validate (no duplicates, correct term)
    │
    ├─► Check Conflicts (course-conflict-utils.ts)
    │
    ├─► Dispatch Reducer Action
    │
    ├─► Update Profile State (immutable)
    │
    ├─► Recalculate Metadata (validateProfile)
    │
    ├─► Save to Storage (hybrid pattern)
    │   │
    │   ├─► If Authenticated → Supabase
    │   └─► Else → localStorage
    │
    └─► Trigger React Re-render
```

## Key Design Patterns

### 1. Hybrid Storage Pattern (Critical)
**Location**: `components/profile/ProfileContext.tsx`

**Pattern**:
```typescript
// Storage layer abstraction
const saveProfile = async (profile: StudentProfile) => {
  if (user) {
    // Try cloud first
    try {
      await supabase.from('academic_profiles').upsert({...});
    } catch (error) {
      // Graceful degradation to localStorage
      saveProfileToStorage(profile);
    }
  } else {
    // Guest users always use localStorage
    saveProfileToStorage(profile);
  }
};
```

**Why This Pattern**:
- No signup friction for guest users
- Reliable fallback if Supabase is down
- Transparent to consuming components
- Single source of truth (ProfileContext)

### 2. Reducer Pattern for State Management
**Location**: `components/profile/ProfileContext.tsx`

**Pattern**:
```typescript
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case "ADD_COURSE":
      // Immutable update
      const updatedProfile = addCourseToProfile(...);
      saveProfileToStorage(updatedProfile); // Side effect
      return { ...state, current_profile: updatedProfile };
    
    case "REMOVE_COURSE":
      // Similar pattern
  }
}
```

**Why This Pattern**:
- Predictable state transitions
- Easy to debug (action log)
- Automatic persistence on every change
- Single place for all mutations

### 3. Server-Side Filtering Pattern
**Location**: `app/api/courses/route.ts`

**Pattern**:
```typescript
export async function GET(request: NextRequest) {
  // Extract query params
  const level = searchParams.getAll("level");
  const term = searchParams.getAll("term");
  
  // Build Supabase query
  let query = supabase.from("courses").select("*");
  if (level.length > 0) query = query.in("level", level);
  if (term.length > 0) query = query.overlaps("term", term);
  
  // Execute with pagination
  const { data } = await query.range(offset, offset + limit - 1);
  return NextResponse.json({ courses: data, pagination: {...} });
}
```

**Why This Pattern**:
- Offloads filtering to PostgreSQL (fast)
- Reduces client bundle size (no filtering logic)
- Easy to add new filters server-side
- Pagination handled efficiently

### 4. Conflict Extraction Pattern
**Location**: `lib/course-conflict-utils.ts`

**Pattern**:
```typescript
// Courses store conflicts in unstructured notes field
// Example: "The course may not be included in a degree together with: TSBK02, TSBK35"

function extractConflictingCourses(notes: string | null): string[] {
  const pattern = /The course may not be included in a degree together with:\s*([A-Z0-9, ]+)/i;
  const match = notes?.match(pattern);
  return match ? match[1].split(",").map(id => id.trim()) : [];
}

// Bidirectional check
function findCourseConflicts(newCourse, profile) {
  const newConflicts = extractConflictingCourses(newCourse.notes);
  
  // Check both directions
  for (const existing of allProfileCourses) {
    if (newConflicts.includes(existing.id)) return [existing];
    
    const existingConflicts = extractConflictingCourses(existing.notes);
    if (existingConflicts.includes(newCourse.id)) return [existing];
  }
}
```

**Why This Pattern**:
- Handles LiU's unstructured data format
- Bidirectional checking (A → B and B → A)
- No database schema changes needed
- Supports both English and Swedish patterns

## Component Architecture

### Hierarchy
```
app/layout.tsx (Root)
├── ProfileProvider (Global State)
│   └── All Pages
│       ├── app/page.tsx (Course Catalog)
│       │   ├── FilterPanel (Client)
│       │   ├── CourseGrid/List (Client)
│       │   │   └── CourseCard (Client)
│       │   │       └── TermSelectionModal (Client)
│       │   │           └── ConflictResolutionModal (Client)
│       │   └── ProfileSidebar (Client)
│       │
│       └── app/profile/[id]/page.tsx (Profile View)
│           └── ProfilePinboard (Client)
│               └── DraggableTermCard (Client)
```

### Server vs Client Split
**Server Components** (Default):
- `app/page.tsx` - Main catalog page
- `app/layout.tsx` - Root layout
- `app/profile/[id]/page.tsx` - Profile view page
- `app/api/courses/route.ts` - API route handler

**Client Components** (`'use client'`):
- `ProfileContext.tsx` - State management (uses hooks)
- `FilterPanel.tsx` - Interactive filters
- `CourseCard.tsx` - Click handlers, modals
- `ProfileSidebar.tsx` - Drag-and-drop
- All components using `useProfile()` hook

**Critical Rule**: Never use `next/dynamic` with `{ ssr: false }` in Server Components. Extract client logic to separate Client Components instead.

## Type System Patterns

### Course Type
**Location**: `types/course.ts`

```typescript
interface Course {
  // Swedish academic terms preserved
  level: "grundnivå" | "avancerad nivå";
  
  // Array types for multi-value fields
  term: string[];      // ["7", "8", "9"]
  block: string[];     // ["1", "2"] for 50% courses
  
  // Optional unstructured data
  notes?: string | null;  // Contains conflicts, warnings
}
```

**Type Guard Pattern**:
```typescript
export function isValidCourse(course: unknown): course is Course {
  // Runtime validation
  return (
    typeof course.id === "string" &&
    (course.level === "grundnivå" || course.level === "avancerad nivå") &&
    Array.isArray(course.term) && ...
  );
}
```

### Profile Type
**Location**: `types/profile.ts`

```typescript
interface StudentProfile {
  // Terms as Record for type safety
  terms: Record<MasterProgramTerm, Course[]>;
  
  // Calculated metadata (never manually set)
  metadata: {
    total_credits: number;
    advanced_credits: number;
    is_valid: boolean;
  };
}

// Immutable operations return new profiles
function addCourseToProfile(profile, course, term): StudentProfile {
  const updatedProfile = {
    ...profile,
    terms: {
      ...profile.terms,
      [term]: [...profile.terms[term], course],  // Immutable array
    },
  };
  
  // Recalculate metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = { ...validation };
  
  return updatedProfile;
}
```

## Authentication Pattern

### Supabase SSR Pattern
**Server-Side**: `utils/supabase/server.ts`
```typescript
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => cookies.forEach(c => cookieStore.set(...))
    }
  });
}
```

**Client-Side**: `utils/supabase/client.ts`
```typescript
export function createClient() {
  return createBrowserClient(url, key);
}
```

**Middleware**: `middleware.ts`
```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request);  // Refreshes auth tokens
}
```

### Auth State in ProfileContext
```typescript
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  const supabase = createClient();
  
  // Initial auth check
  supabase.auth.getUser().then(({ data }) => setUser(data.user));
  
  // Subscribe to changes
  const { subscription } = supabase.auth.onAuthStateChange((_, session) => {
    setUser(session?.user ?? null);
  });
  
  return () => subscription.unsubscribe();
}, []);
```

## Realtime Pattern

### Subscription Pattern
**Location**: `hooks/useRealtimeProfiles.ts`

```typescript
export function useRealtimeProfiles(user, onUpdate, onInsert, onDelete) {
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('academic_profiles_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'academic_profiles',
        filter: `user_id=eq.${user.id}`
      }, onUpdate)
      .subscribe();
    
    return () => channel.unsubscribe();
  }, [user]);
}
```

**Why This Pattern**:
- Only subscribe for authenticated users
- Filter to user's own profiles
- Automatic cleanup on unmount
- Handles multi-tab sync

## Validation Pattern

### Layered Validation
```typescript
// 1. Type-level validation (compile time)
interface StudentProfile {
  terms: Record<MasterProgramTerm, Course[]>;  // Only 7, 8, 9 allowed
}

// 2. Runtime validation (runtime)
export function validateProfile(profile): ProfileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check duplicates
  const courseIds = new Set();
  for (const course of allCourses) {
    if (courseIds.has(course.id)) errors.push(`Duplicate: ${course.id}`);
    courseIds.add(course.id);
  }
  
  // Check requirements
  if (totalCredits !== 90) warnings.push(`Credits: ${totalCredits}hp ≠ 90hp`);
  if (advancedCredits < 60) warnings.push(`Advanced: ${advancedCredits}hp < 60hp`);
  
  return { is_valid: errors.length === 0, errors, warnings, ... };
}

// 3. Business logic validation (before mutations)
export function addCourseToProfile(profile, course, term) {
  if (isCourseInProfile(profile, course.id)) {
    throw new Error(`Course ${course.id} already in profile`);
  }
  
  if (!course.term.includes(term.toString())) {
    throw new Error(`Course not available in term ${term}`);
  }
  
  // Proceed with mutation...
}
```

## Key Architectural Decisions

### Why useReducer over useState?
- Predictable state transitions (actions are traceable)
- Easier to test (pure reducer functions)
- Automatic persistence in one place
- Better for complex state with multiple fields

### Why Separate API Route?
- Server-side filtering offloads work from client
- Easier to add caching layer later
- Consistent JSON API for potential mobile app
- Better error handling and logging

### Why Context over Props Drilling?
- Profile needed in 10+ components across tree
- Avoids middleware prop passing
- Single subscription point for realtime updates
- Easier to add new consumers

### Why Supabase over Custom Backend?
- Built-in auth (email/password, OAuth ready)
- Realtime subscriptions out of the box
- PostgreSQL for complex queries
- Row-level security policies
- Free tier sufficient for MVP
