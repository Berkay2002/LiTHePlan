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

## API Security Patterns

### Rate Limiting Pattern
**Purpose**: Prevent API abuse and DoS attacks  
**Implementation**: Redis-backed sliding window

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const coursesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "@ratelimit/courses",
});

// Usage in API route
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request.headers);
  const rateLimitResult = await coursesLimiter.limit(clientIP);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(errorResponse("Too many requests", requestId), {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(rateLimitResult.limit),
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.reset),
      },
    });
  }
  
  // Process request...
}
```

**Per-Endpoint Limits**:
- Courses (read-heavy): 100 req/min
- Profile read: 50 req/min
- Profile write: 10 req/min
- Auth: 30 req/min

**Fail-Safe**: If Redis is down, rate limiter fails open (allows request)

### Input Validation Pattern
**Purpose**: Prevent injection attacks, ensure data integrity  
**Implementation**: Zod strict schemas

```typescript
// lib/api-validation.ts
export const ProfileDataSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  terms: z.record(z.enum(["7", "8", "9"]), z.array(CourseSchema)),
}).strict(); // Rejects unknown fields

// Usage in API route
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validationResult = ProfileDataSchema.safeParse(body.profile);
  
  if (!validationResult.success) {
    logger.warn("Invalid profile data", {
      requestId,
      errors: validationResult.error.errors,
    });
    
    return NextResponse.json(
      errorResponse("Invalid profile data", requestId),
      { status: 400 }
    );
  }
  
  const validatedData = validationResult.data; // Type-safe
  // Proceed with validated data...
}
```

**Strict Mode Benefits**:
- Blocks `__proto__` injection
- Prevents `constructor` pollution
- Rejects extra fields that could override internal logic
- Type-safe validated data

**Attack Example Prevented**:
```typescript
// Malicious payload
const maliciousPayload = {
  name: "My Profile",
  terms: { "7": [...] },
  __proto__: { isAdmin: true },  // ❌ Rejected by .strict()
  userId: "admin-id"              // ❌ Rejected (not in schema)
};
```

### Error Handling Pattern
**Purpose**: Consistent error responses, Sentry integration, no debug leaks  
**Implementation**: Structured logging + standardized responses

```typescript
// lib/logger.ts + lib/api-response.ts
export async function GET(request: NextRequest) {
  const requestId = logger.generateRequestId();
  
  try {
    // Sentry breadcrumbs for flow tracking
    Sentry.addBreadcrumb({
      category: "auth",
      message: "User authenticated",
      level: "info",
    });
    
    const { data, error } = await supabase.from("profiles").select();
    
    if (error) {
      logger.error("Database error", error, {
        requestId,
        userId: user.id,
      });
      
      // Automatically sent to Sentry with context
      return NextResponse.json(
        errorResponse("Failed to fetch profiles", requestId),
        { status: 500 }
      );
    }
    
    logger.info("Profiles retrieved", {
      requestId,
      count: data.length,
    });
    
    return NextResponse.json(successResponse(data, requestId));
    
  } catch (error) {
    logger.error("Unexpected error", error, { requestId });
    
    // Sentry.captureException() called automatically
    return NextResponse.json(
      errorResponse("Internal server error", requestId),
      { status: 500 }
    );
  }
}
```

**Error Response Rules**:
1. Never expose stack traces in production
2. Never leak database schema details
3. Always include `requestId` for support
4. Use generic messages for security errors
5. Log full details server-side with Sentry

### Structured Logging Pattern
**Purpose**: Request tracing, debugging, performance monitoring  
**Implementation**: Consistent metadata across all logs

```typescript
// lib/logger.ts
class Logger {
  info(message: string, meta: LogMetadata = {}): void {
    const logData = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    
    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(logData)); // Structured JSON
    } else {
      console.log(`[INFO] ${message}`, meta); // Human-readable
    }
  }
  
  error(message: string, error: Error, meta: LogMetadata = {}): void {
    // Log to console
    console.error(JSON.stringify({ level: "error", message, ...meta }));
    
    // Send to Sentry
    Sentry.captureException(error, {
      contexts: { metadata: meta },
      tags: { requestId: meta.requestId },
    });
  }
}
```

**Standard Metadata**:
- `requestId` - UUID for request correlation
- `userId` - From auth context (if available)
- `duration` - Request processing time
- `path` - API route
- `timestamp` - ISO 8601 format

**Example Log Flow**:
```
[INFO] Profile created successfully {
  requestId: "550e8400-...",
  userId: "auth-user-id",
  profileId: "profile-uuid",
  coursesCount: 12,
  duration: 145
}
```

### Response Standardization Pattern
**Purpose**: Consistent API contract, easier client consumption  
**Implementation**: Typed response helpers

```typescript
// lib/api-response.ts
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  requestId: string;
  timestamp: string;
}

export function successResponse<T>(data: T, requestId: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(message: string, requestId: string): ApiErrorResponse {
  return {
    success: false,
    error: message,
    requestId,
    timestamp: new Date().toISOString(),
  };
}
```

**Client Usage**:
```typescript
// Client knows exactly what to expect
const response = await fetch("/api/profile");
const json = await response.json();

if (json.success) {
  // TypeScript knows json.data exists
  console.log(json.data);
} else {
  // TypeScript knows json.error exists
  console.error(json.error, json.requestId);
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
