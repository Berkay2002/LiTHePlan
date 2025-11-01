# Technical Context

## Technology Stack

### Frontend Framework
- **Next.js 16.0.1**: App Router (not Pages Router)
  - Server Components by default
  - Client Components with `'use client'`
  - Built-in API routes
  - Automatic code splitting
  - Image optimization
  - **Turbopack**: Default build tool (no `--turbopack` flag needed)
  - **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` must be awaited
  - **Proxy File**: `proxy.ts` (replaces `middleware.ts`)
  
- **React 19.2**: Latest stable with new features
  - Hooks (useState, useEffect, useReducer, useContext)
  - No class components
  - Concurrent features enabled
  - **View Transitions API**: Animate elements during navigation
  - **useEffectEvent**: Extract non-reactive logic from Effects
  - **Activity Component**: Background rendering support

- **TypeScript 5**: Strict mode (minimum 5.1.0)
  - All files `.ts` or `.tsx`
  - No `any` type allowed (Ultracite rule)
  - Type imports with `import type`
  - Strict null checks enabled
  - Use `npx next typegen` for async params type helpers

### Styling
- **Tailwind CSS v4**: PostCSS-based (not JIT)
  - Utility-first approach
  - Custom color palette
  - Responsive breakpoints: sm, md, lg, xl, 2xl
  - Dark mode support (class-based)

- **shadcn/ui**: Component library
  - Built on Radix UI primitives
  - Customizable components in `components/ui/`
  - Accessibility built-in
  - Components: Button, Card, Dialog, Select, Checkbox, etc.

### Backend & Database
- **Supabase**: 
  - PostgreSQL database (hosted)
  - Authentication (email/password)
  - Realtime subscriptions
  - Row-level security (RLS)
  - Storage package: `@supabase/ssr` (Server-Side Rendering support)

### State Management
- **React Context API**: Global profile state
  - ProfileProvider wraps app
  - useReducer for complex state transitions
  - No Redux/Zustand (Context sufficient for this scale)

### Icons & UI Assets
- **Lucide React**: Icon library
  - Tree-shakeable
  - Consistent design system
  - Used throughout UI

### Drag & Drop
- **@hello-pangea/dnd**: Fork of react-beautiful-dnd
  - Touch-friendly
  - Accessible keyboard navigation
  - Used in ProfilePinboard

### Build & Development Tools
- **Ultracite**: Biome-based linter/formatter
  - Replaces ESLint + Prettier
  - Subsecond performance
  - Strict rules (see `biome.jsonc`)
  - Commands: `npm run lint`, `npm run format`

## Project Structure

```
LiTHePlan/
├── app/                          # Next.js App Router
│   ├── globals.css              # Tailwind imports, global styles
│   ├── layout.tsx               # Root layout (ProfileProvider)
│   ├── page.tsx                 # Home/catalog page (Server Component)
│   ├── api/                     # API routes
│   │   ├── courses/route.ts    # GET /api/courses (filtering)
│   │   ├── profile/route.ts    # Profile CRUD
│   │   └── auth/callback/route.ts  # Supabase auth callback
│   ├── login/page.tsx          # Auth pages
│   ├── signup/page.tsx
│   └── profile/
│       ├── [id]/page.tsx       # View profile by ID
│       └── edit/page.tsx       # Edit mode
│
├── components/
│   ├── course/                 # Course discovery features
│   │   ├── CourseCard.tsx     # Display single course
│   │   ├── CourseGrid.tsx     # Grid layout
│   │   ├── CourseList.tsx     # List layout
│   │   ├── FilterPanel.tsx    # Multi-select filters
│   │   ├── ConflictResolutionModal.tsx  # Handle conflicts
│   │   └── TermSelectionModal.tsx       # Select term when adding
│   ├── profile/               # Profile builder features
│   │   ├── ProfileContext.tsx # Global state (CRITICAL)
│   │   ├── ProfilePinboard.tsx  # Drag-drop interface
│   │   ├── ProfileSidebar.tsx   # Credit tracking, validation
│   │   └── PinnedCourseCard.tsx # Course in pinboard
│   ├── shared/                # Reusable across features
│   │   ├── DynamicNavbar.tsx # Navbar with auth state
│   │   └── Pagination.tsx    # Course pagination
│   └── ui/                    # shadcn/ui components (don't edit)
│
├── hooks/
│   ├── useCourses.ts          # Course fetching logic
│   ├── useRealtimeProfiles.ts # Supabase subscriptions
│   └── useMediaQuery.ts       # Responsive breakpoints
│
├── lib/
│   ├── profile-utils.ts       # Profile CRUD operations
│   ├── course-conflict-utils.ts  # Conflict detection
│   ├── course-utils.ts        # Course formatting helpers
│   ├── api-validation.ts      # Zod schemas for API validation
│   ├── rate-limit.ts          # Redis rate limiting utilities
│   ├── logger.ts              # Structured logging with Sentry
│   ├── api-response.ts        # Standardized API responses
│   └── utils.ts               # General utilities (cn, etc.)
│
├── types/
│   ├── course.ts              # Course interface + validation
│   └── profile.ts             # Profile interfaces + validation
│
├── utils/supabase/
│   ├── client.ts              # Browser Supabase client
│   ├── server.ts              # Server Supabase client (SSR)
│   └── middleware.ts          # Auth utilities (imported by proxy.ts)
│
├── proxy.ts                    # Auth session refresh (Next.js 16)
│
├── scripts/
│   └── fetch-course-stats.js  # Database stats generator
│
├── public/                     # Static assets
├── supabase/                   # Supabase config
├── .github/                    # GitHub configs
│   ├── copilot-instructions.md
│   └── instructions/          # Development guidelines
└── memory-bank/               # Project documentation (this)
```

## Development Setup

### Prerequisites
- Node.js 20.9+ (minimum required for Next.js 16, tested on v20.19.0)
- npm 9+ (or yarn/pnpm)
- Git
- Supabase account (free tier)

### Environment Variables
**File**: `.env.local` (never commit!)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Sentry Error Tracking
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=berkaycom
SENTRY_PROJECT=javascript-nextjs

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXw-xxx
```

**How to Get**:
1. **Supabase**: Create project → Project Settings → API → Copy URL and keys
2. **Sentry**: Run `npx @sentry/wizard@latest -i nextjs` (auto-configured)
3. **Upstash Redis**: Create account at upstash.com → Create Redis database → Copy REST credentials

### Installation Steps
```powershell
# Clone repository
git clone https://github.com/Berkay2002/LiTHePlan.git
cd LiTHePlan

# Install dependencies
npm install

# Create .env.local with Supabase credentials

# Start development server
npm run dev
```

### Available Commands
```powershell
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build + TypeScript check
npm run start      # Serve production build
npm run lint       # Run Ultracite linter (check only)
npm run format     # Auto-fix code style with Ultracite
npm run check      # Alias for lint

# Database utilities
node scripts/fetch-course-stats.js  # Generate stats from Supabase
```

## Production Infrastructure

### Rate Limiting (Upstash Redis)
**Service**: Upstash Redis (https://upstash.io)  
**Free Tier**: 500,000 commands/month, 256MB storage  
**Implementation**: `lib/rate-limit.ts`

**Rate Limits by Endpoint**:
- **Courses API** (`/api/courses`): 100 requests/minute per IP
- **Profile Read** (`/api/profile`, `/api/profile/[id]`): 50 requests/minute per IP
- **Profile Write** (`/api/profile` POST): 10 requests/minute per IP
- **Auth Callback** (`/api/auth/callback`): 30 requests/minute per IP

**Algorithm**: Sliding window with Redis sorted sets  
**Response Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`  
**Behavior**: Returns `429 Too Many Requests` when limit exceeded

**Configuration**:
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
```

### Error Tracking (Sentry)
**Sentry**: Error tracking service (https://sentry.io)  
**Free Tier**: 5,000 errors/month, 5M spans/month  
**Organization**: `berkaycom`  
**Project**: `javascript-nextjs`  
**Region**: `de.sentry.io` (Europe - Germany)
**DSN**: `https://58d2112c06a633cb7923c8ab82488d6b@o4508233068052480.ingest.de.sentry.io/4508233068445776`

**Features Enabled**:
- Error tracking with stack traces
- Breadcrumbs for request flow
- User context (ID, email)
- Request metadata (requestId, duration)
- Performance monitoring (basic)

**Integration**:
```typescript
// lib/logger.ts - Auto-captures errors
logger.error("Database error", error, {
  requestId,
  userId,
});

// Sentry.captureException() called automatically
// Includes breadcrumbs from request flow
```

**Sentry Breadcrumbs Example**:
1. Auth check → User authenticated
2. Validation → Profile data validated
3. Database → Saving to academic_profiles
4. Error → Constraint violation (if fails)

### Input Validation (Zod)
**Library**: `zod` (v3+)  
**Pattern**: Strict schemas prevent injection attacks  
**Implementation**: `lib/api-validation.ts`

**Validation Schemas**:
- **CourseFiltersSchema**: Validates query parameters (pagination, filters, search)
- **ProfileDataSchema**: Validates profile structure (terms, courses, metadata)
- **UUIDSchema**: Validates all ID parameters

**Strict Mode** (`.strict()`):
- Rejects unknown fields → prevents prototype pollution
- Blocks `__proto__`, `constructor` injection
- Prevents parameter pollution attacks

**Example**:
```typescript
// Validates and rejects malicious payloads
const validationResult = ProfileDataSchema.strict().safeParse(profile);
if (!validationResult.success) {
  return errorResponse("Invalid profile data", requestId);
}
```

### Structured Logging
**Implementation**: `lib/logger.ts`  
**Format**: JSON in production, human-readable in development

**Log Levels**:
- `logger.info()` - Request start/end, success operations
- `logger.warn()` - Rate limits, validation failures, auth issues
- `logger.error()` - Database errors, exceptions (auto-sent to Sentry)

**Metadata Included**:
- `requestId` - Unique UUID per request
- `timestamp` - ISO 8601 format
- `userId` - From auth context (if available)
- `path` - API route path
- `duration` - Request processing time (ms)

**Example Log Entry**:
```json
{
  "level": "info",
  "message": "Profile created successfully",
  "timestamp": "2025-10-31T12:34:56.789Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "auth-user-id",
  "profileId": "profile-uuid",
  "coursesCount": 12,
  "duration": 145
}
```

### Response Caching
**Implementation**: HTTP `Cache-Control` headers  
**Strategy**: TTL-based (no manual purge endpoints)

**Cache Durations**:
- **Courses API**: `public, max-age=300, s-maxage=600` (5min client, 10min CDN)
- **Public Profiles**: `public, max-age=60` (1min)
- **User Profiles**: `private, max-age=60` (1min, user-specific)

**Rationale**:
- Courses data changes infrequently (manual updates)
- Public profiles need freshness for sharing
- User profiles must not be cached across users

### API Response Format
**Implementation**: `lib/api-response.ts`  
**Pattern**: Standardized JSON structure

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "requestId": "550e8400-...",
  "timestamp": "2025-10-31T12:34:56.789Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Profile not found",
  "requestId": "550e8400-...",
  "timestamp": "2025-10-31T12:34:56.789Z"
}
```

**Security**: No stack traces or debug info in production responses

## Database Schema

### Supabase Tables

**`courses`** (339 rows - duplicates and deprecated courses removed):
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,                    -- Course code (e.g., 'TSBK02')
  name TEXT NOT NULL,                     -- Course name
  programs TEXT[] NOT NULL,               -- Program names (29 programs)
  huvudomrade TEXT,                       -- Main subject area (Swedish)
  examinator TEXT,                        -- Course examiner
  studierektor TEXT,                      -- Study director
  credits NUMERIC NOT NULL DEFAULT 6,     -- HP (usually 6)
  level TEXT NOT NULL,                    -- 'grundnivå' | 'avancerad nivå'
  term TEXT[] NOT NULL,                   -- ['7', '8', '9']
  period TEXT[] NOT NULL,                 -- ['1', '2']
  block TEXT[] NOT NULL,                  -- ['1', '2', '3', '4']
  pace NUMERIC NOT NULL DEFAULT 1.0,      -- 1.0 = 100%, 0.5 = 50% (changed from string)
  examination TEXT[] NOT NULL,            -- ['TEN', 'LAB', 'PROJ', ...]
  campus TEXT NOT NULL,                   -- 'Linköping' | 'Norrköping'
  notes TEXT,                             -- Restrictions, warnings (unstructured)
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

-- RLS policies (users can only access their own profiles)
ALTER TABLE academic_profiles ENABLE ROW LEVEL SECURITY;
```

### Data Population
Courses imported via custom script (not in repo):
1. Scrape/collect course data from LiU portals
2. Transform to CSV/JSON format
3. Import to Supabase via SQL or API

**Note**: Database is manually maintained, no real-time LiU sync.

## Technical Constraints

### Performance Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **API Response**: < 500ms for course filtering
- **Profile Save**: < 200ms (localStorage), < 1s (Supabase)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)
- No IE11 support

### Accessibility Requirements
- **WCAG 2.1 Level AA**: Target compliance
- Keyboard navigation for all interactions
- Screen reader compatible (ARIA labels)
- Minimum contrast ratio 4.5:1
- Touch targets ≥ 44x44px

### TypeScript Configuration
**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,                  // All strict checks
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./*"]                 // Absolute imports
    }
  }
}
```

### Biome/Ultracite Configuration
**File**: `biome.jsonc`
```jsonc
{
  "extends": ["ultracite"],
  "linter": {
    "rules": {
      "style": {
        "noNonNullAssertion": "off",     // Allow ! for Supabase types
        "useFilenamingConvention": "off"  // PascalCase components OK
      }
    }
  }
}
```

## External Services

### Supabase
- **Region**: Auto-selected (closest to user)
- **Database**: PostgreSQL 15
- **Storage**: Not used (no file uploads)
- **Auth Providers**: Email/password (OAuth ready but not configured)
- **Realtime**: Enabled for `academic_profiles` table

### Vercel Deployment
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Environment Variables**: Set in Vercel dashboard
- **Region**: Auto (edge functions)

## Known Technical Limitations

### No Realtime Course Updates
- Courses stored in Supabase but not synced with LiU
- Updates require manual database modifications
- Users see stale data if courses change

### No Prerequisite Validation
- Prerequisite chains are complex
- Not modeled in database schema
- Students must verify manually

### localStorage Limits
- 5-10MB storage limit per domain
- Large profiles (100+ courses) could hit limit
- No compression or cleanup implemented

### Mobile Drag-Drop Issues
- Some Android browsers have quirks
- iOS Safari touch events may lag
- Fallback to add/remove buttons exists

### Server Component Hydration
- Cannot use hooks in Server Components
- Dynamic imports with `ssr: false` not supported
- Must split into Client Components properly

## Development Best Practices

### Git Workflow
```powershell
# Feature branch workflow
git checkout -b feature/your-feature
git commit -m "feat: description"  # Conventional commits
git push origin feature/your-feature
# Create PR to main
```

### Code Review Checklist
- [ ] TypeScript compiles (`npm run build`)
- [ ] Ultracite passes (`npm run lint`)
- [ ] No console.log in production code
- [ ] Tests added/updated (if applicable)
- [ ] Accessibility checked (keyboard, screen reader)
- [ ] Mobile responsive tested

### Debugging Tools
- **React DevTools**: Component tree, props
- **Supabase Studio**: Database explorer, logs
- **Network Tab**: API calls, timing
- **Redux DevTools**: Not used (no Redux)
- **Lighthouse**: Performance, accessibility audits

### Common Issues & Solutions

**Issue**: "Cannot use hooks in Server Component"
**Solution**: Move hook usage to Client Component with `'use client'`

**Issue**: "Supabase CORS error"
**Solution**: Check API keys, ensure URL matches project

**Issue**: "localStorage not defined (SSR)"
**Solution**: Check for `typeof window !== 'undefined'` before access

**Issue**: "Drag-drop not working on mobile"
**Solution**: Ensure touch event handlers are passive, check iOS Safari quirks
