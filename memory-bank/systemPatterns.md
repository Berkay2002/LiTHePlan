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

## Cache Components (Next.js 16) - Critical Constraints

### What Are Cache Components?
**Feature**: Next.js 16 renamed PPR (Partial Prerendering) to Cache Components
- Allows marking routes/components/functions as cacheable with `'use cache'` directive
- Uses `cacheLife()` for revalidation timing (replaces `export const revalidate`)
- Requires `cacheComponents: true` in `next.config.ts`
- Designed for pure data fetching without dynamic APIs

### Critical Constraints (Why We Can't Use It)

#### 1. No Dynamic APIs Allowed
```typescript
// ❌ FORBIDDEN in 'use cache' scope:
export default async function Page() {
  'use cache';
  
  const cookieStore = await cookies();  // ❌ Error: cookies() not allowed
  const headersList = await headers();   // ❌ Error: headers() not allowed
  await connection();                    // ❌ Error: connection() not allowed
  const params = await searchParams;     // ❌ Error: searchParams not allowed
}
```

**Error Message**:
```
Error: Route used `cookies()` inside "use cache". Accessing Dynamic data
sources inside a cache scope is not supported. If you need this data inside
a cached function use `cookies()` outside of the cached function and pass
the required dynamic data in as an argument.
```

**Impact on Our App**:
- All Supabase server clients use `await cookies()` for auth
- Cannot cache any route requiring user authentication
- Cannot use `utils/supabase/server.ts` in cached functions

#### 2. No Math.random() Before Uncached Data
```typescript
// ❌ FORBIDDEN: Math.random() before fetch()
export default async function Page() {
  'use cache';
  
  // Supabase client uses Math.random() internally
  const supabase = createClient();  // ❌ Error: Math.random() detected
  const { data } = await supabase.from('courses').select();
}
```

**Error Message**:
```
Error: Route used `Math.random()` before accessing either uncached data
(e.g. `fetch()`) or Request data (e.g. `cookies()`, `headers()`,
`connection()`, and `searchParams`). Accessing random values synchronously
in a Server Component requires reading one of these data sources first.
```

**Why This Happens**:
- Supabase JavaScript client generates request IDs using `Math.random()`
- Next.js requires accessing dynamic data BEFORE using random values
- Workaround (`await connection()`) also forbidden in cached scope

**Impact on Our App**:
- Cannot use Supabase client (even read-only) in cached functions
- All database queries trigger this error
- No workaround available while maintaining caching

#### 3. Config Incompatibility with ISR
```typescript
// ❌ FORBIDDEN when cacheComponents enabled:
export const revalidate = 3600;  // Error: not compatible

// ✅ REQUIRED instead:
export default async function Page() {
  'use cache';
  cacheLife('hours');  // But can't use due to constraints #1 and #2
}
```

**Error Message**:
```
Error: Route segment config "revalidate" is not compatible with
`nextConfig.cacheComponents`. Please remove it.
```

**Impact on Our App**:
- Traditional ISR pattern breaks when Cache Components enabled
- Must choose: Cache Components OR ISR (cannot have both)
- Our ISR implementation relies on `revalidate` constant

#### 4. Metadata Generation Issues
```typescript
// ❌ FORBIDDEN: File-level 'use cache' with metadata
'use cache';  // Error: affects generateMetadata too

export async function generateMetadata() {
  const supabase = createClient();  // ❌ Triggers cookies() error
}

export default async function Page() {
  'use cache';  // ❌ Even component-level fails with Supabase
}
```

**Constraints**:
- File-level `'use cache'` requires ALL exports to be async functions
- Component-level `'use cache'` still triggers Supabase errors
- `generateMetadata()` needs Supabase client for dynamic metadata

**Impact on Our App**:
- Cannot cache course pages with dynamic metadata
- Cannot cache profile pages with user-specific metadata
- No workaround without removing dynamic metadata

### When Cache Components IS Appropriate

```typescript
// ✅ WORKS: Pure data fetching, no auth, no Supabase
export default async function BlogPost() {
  'use cache';
  cacheLife('days');
  
  // Direct fetch (no Supabase, no cookies)
  const response = await fetch('https://api.example.com/post');
  const post = await response.json();
  
  return <article>{post.content}</article>;
}
```

**Ideal Use Cases**:
- Public content APIs (no authentication)
- Static data fetching (no user-specific data)
- Applications NOT using Supabase auth
- Routes without `cookies()`, `headers()`, or dynamic params

### Our Solution: ISR + Suspense

```typescript
// ✅ WORKS: Traditional ISR + Suspense
export const revalidate = 3600;  // ISR: cache for 1 hour

export default async function CoursePage({ params }) {
  const { courseId } = await params;
  const supabase = await createClient();  // ✅ Can use cookies()
  
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  // Suspense for streaming dynamic content
  return (
    <Suspense fallback={<CoursePageSkeleton />}>
      <CoursePageClient course={course} />
    </Suspense>
  );
}
```

**Benefits We Get**:
- ✅ ISR caching (1 hour TTL)
- ✅ Suspense streaming (loading states)
- ✅ Supabase auth works (cookies allowed)
- ✅ Dynamic metadata generation
- ✅ Compatible with existing architecture

**Benefits We DON'T Get** (would need Cache Components):
- ❌ Sub-50ms static shell (still server-rendered)
- ❌ Edge caching (no build-time prerendering)
- ❌ Reduced server costs (every request hits server)

### Decision: Disable Cache Components

**Config Change**:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // cacheComponents: true,  // ❌ Disabled
  // Using ISR + Suspense instead
};
```

**Rationale**:
1. Supabase auth requires `cookies()` → Incompatible
2. Supabase client uses `Math.random()` → Incompatible  
3. ISR uses `revalidate` constant → Incompatible
4. Dynamic metadata needs Supabase → Incompatible
5. ISR + Suspense provides sufficient hybrid rendering

**When to Reconsider**:
- If migrating away from Supabase auth
- If using public-only data (no auth)
- If Next.js relaxes Cache Components constraints
- If Supabase client removes Math.random() dependency

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
