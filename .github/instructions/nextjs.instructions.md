---
applyTo: '**'
---

# Next.js Best Practices for LLMs (2025)

_Last updated: October 2025 - Next.js 16.0.1_

This document summarizes the latest, authoritative best practices for building, structuring, and maintaining Next.js 16 applications. It is intended for use by LLMs and developers to ensure code quality, maintainability, and scalability.

---

## Next.js 16 Critical Changes

### Breaking Changes You Must Know

1. **Async Request APIs (MANDATORY)**:
   - `cookies()`, `headers()`, `draftMode()` MUST be awaited
   - `params` and `searchParams` are now Promises
   - No synchronous access allowed (removed in v16)

2. **Middleware → Proxy Migration**:
   - `middleware.ts` renamed to `proxy.ts`
   - Function export: `export function proxy(request)` (not `middleware`)
   - Edge runtime NOT supported in proxy (nodejs only)

3. **Turbopack is Default**:
   - `next dev` and `next build` use Turbopack by default
   - No `--turbopack` flag needed
   - Opt-out with `--webpack` flag if needed

4. **React 19.2**:
   - View Transitions API
   - `useEffectEvent` hook
   - Activity component for background rendering

5. **Removed Features**:
   - AMP support completely removed
   - `next lint` command removed (use ESLint directly)
   - Runtime config (`serverRuntimeConfig`, `publicRuntimeConfig`) removed
   - `next/legacy/image` deprecated

---

## 2. Async Request APIs (Breaking Change in v16)

**CRITICAL**: All dynamic APIs must be awaited in Next.js 16.

### Cookies, Headers, Draft Mode

```tsx
// ❌ Wrong (Next.js 15 syntax - no longer works)
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies() // Error in v16
  const token = cookieStore.get('token')
}

// ✅ Correct (Next.js 16)
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies() // Must await
  const token = cookieStore.get('token')
}
```

### Params and SearchParams

```tsx
// ❌ Wrong (Next.js 15)
export default function Page({ params, searchParams }) {
  const { slug } = params // Error in v16
  const query = searchParams.q
}

// ✅ Correct (Next.js 16)
export default async function Page({ params, searchParams }) {
  const { slug } = await params // Must await
  const query = (await searchParams).q
}
```

### Type Safety with Generated Types

Run `npx next typegen` to generate type helpers:

```tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params // Fully typed
  const query = await props.searchParams // Fully typed
  return <h1>Blog Post: {slug}</h1>
}
```

---

- **Use the `app/` directory** (App Router) for all new projects. Prefer it over the legacy `pages/` directory.
- **Top-level folders:**
  - `app/` — Routing, layouts, pages, and route handlers
  - `public/` — Static assets (images, fonts, etc.)
  - `lib/` — Shared utilities, API clients, and logic
  - `components/` — Reusable UI components
  - `contexts/` — React context providers
  - `styles/` — Global and modular stylesheets
  - `hooks/` — Custom React hooks
  - `types/` — TypeScript type definitions
- **Colocation:** Place files (components, styles, tests) near where they are used, but avoid deeply nested structures.
- **Route Groups:** Use parentheses (e.g., `(admin)`) to group routes without affecting the URL path.
- **Private Folders:** Prefix with `_` (e.g., `_internal`) to opt out of routing and signal implementation details.
- **Feature Folders:** For large apps, group by feature (e.g., `app/dashboard/`, `app/auth/`).
- **Use `src/`** (optional): Place all source code in `src/` to separate from config files.
- **Proxy File** (Next.js 16): Use `proxy.ts` (not `middleware.ts`) for auth session management

---

## 3. Server and Client Component Integration (App Router)

**Never use `next/dynamic` with `{ ssr: false }` inside a Server Component.** This is not supported and will cause a build/runtime error.

**Correct Approach:**
- If you need to use a Client Component (e.g., a component that uses hooks, browser APIs, or client-only libraries) inside a Server Component, you must:
  1. Move all client-only logic/UI into a dedicated Client Component (with `'use client'` at the top).
  2. Import and use that Client Component directly in the Server Component (no need for `next/dynamic`).
  3. If you need to compose multiple client-only elements (e.g., a navbar with a profile dropdown), create a single Client Component that contains all of them.

**Example:**

```tsx
// Server Component
import DashboardNavbar from '@/components/DashboardNavbar';

export default async function DashboardPage() {
  // ...server logic...
  return (
    <>
      <DashboardNavbar /> {/* This is a Client Component */}
      {/* ...rest of server-rendered page... */}
    </>
  );
}
```

**Why:**
- Server Components cannot use client-only features or dynamic imports with SSR disabled.
- Client Components can be rendered inside Server Components, but not the other way around.

**Summary:**
Always move client-only UI into a Client Component and import it directly in your Server Component. Never use `next/dynamic` with `{ ssr: false }` in a Server Component.

---

## 4. Component Best Practices

- **Component Types:**
  - **Server Components** (default): For data fetching, heavy logic, and non-interactive UI.
  - **Client Components:** Add `'use client'` at the top. Use for interactivity, state, or browser APIs.
- **When to Create a Component:**
  - If a UI pattern is reused more than once.
  - If a section of a page is complex or self-contained.
  - If it improves readability or testability.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports (e.g., `UserCard.tsx`).
  - Use `camelCase` for hooks (e.g., `useUser.ts`).
  - Use `snake_case` or `kebab-case` for static assets (e.g., `logo_dark.svg`).
  - Name context providers as `XyzProvider` (e.g., `ThemeProvider`).
- **File Naming:**
  - Match the component name to the file name.
  - For single-export files, default export the component.
  - For multiple related components, use an `index.ts` barrel file.
- **Component Location:**
  - Place shared components in `components/`.
  - Place route-specific components inside the relevant route folder.
- **Props:**
  - Use TypeScript interfaces for props.
  - Prefer explicit prop types and default values.
- **Testing:**
  - Co-locate tests with components (e.g., `UserCard.test.tsx`).

## 5. Naming Conventions (General)

- **Folders:** `kebab-case` (e.g., `user-profile/`)
- **Files:** `PascalCase` for components, `camelCase` for utilities/hooks, `kebab-case` for static assets
- **Variables/Functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`

## 6. API Routes (Route Handlers)

- **Prefer API Routes over Edge Functions** unless you need ultra-low latency or geographic distribution.
- **Location:** Place API routes in `app/api/` (e.g., `app/api/users/route.ts`).
- **HTTP Methods:** Export async functions named after HTTP verbs (`GET`, `POST`, etc.).
- **Request/Response:** Use the Web `Request` and `Response` APIs. Use `NextRequest`/`NextResponse` for advanced features.
- **Dynamic Segments:** Use `[param]` for dynamic API routes (e.g., `app/api/users/[id]/route.ts`).
- **Validation:** Always validate and sanitize input. Use libraries like `zod` or `yup`.
- **Error Handling:** Return appropriate HTTP status codes and error messages.
- **Authentication:** Protect sensitive routes using middleware or server-side session checks.

## 7. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode in `tsconfig.json`.
- **Linting:** Use Biome or ESLint directly (NOT `next lint` - removed in v16)
- **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
- **Testing:** Use Jest, React Testing Library, or Playwright. Write tests for all critical logic and components.
- **Accessibility:** Use semantic HTML and ARIA attributes. Test with screen readers.
- **Performance:**
  - Use built-in Image and Font optimization.
  - Use Suspense and loading states for async data.
  - Avoid large client bundles; keep most logic in Server Components.
  - Leverage Turbopack for faster builds (default in v16)
- **Security:**
  - Sanitize all user input.
  - Use HTTPS in production.
  - Set secure HTTP headers.
- **Documentation:**
  - Write clear README and code comments.
  - Document public APIs and components.

## 8. New Caching APIs (Next.js 16)

### cacheLife and cacheTag (Stable)

No longer need `unstable_` prefix:

```tsx
import { cacheLife, cacheTag } from 'next/cache'

export async function getCourse(id: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('courses', `course-${id}`)
  
  return await db.courses.findById(id)
}
```

### revalidateTag (Updated)

Now accepts `cacheLife` profile as second argument:

```tsx
'use server'
import { revalidateTag } from 'next/cache'

export async function updateArticle(articleId: string) {
  // Users see stale data while it revalidates
  revalidateTag(`article-${articleId}`, 'max')
}
```

### updateTag (New)

Provides read-your-writes semantics:

```tsx
'use server'
import { updateTag } from 'next/cache'

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile)
  // User sees changes immediately
  updateTag(`user-${userId}`)
}
```

### refresh (New)

Refresh client router from Server Action:

```tsx
'use server'
import { refresh } from 'next/cache'

export async function markNotificationAsRead(notificationId: string) {
  await db.notifications.markAsRead(notificationId)
  refresh() // Refresh notification count in header
}
```

## 9. Parallel Routes (Breaking Change)

All parallel route slots now REQUIRE explicit `default.js` files:

```tsx filename="app/@modal/default.tsx"
import { notFound } from 'next/navigation'

export default function Default() {
  notFound() // or return null
}
```

## 10. Image Optimization Changes (Next.js 16)

### Breaking Changes

1. **Local images with query strings**:
```tsx
// Requires configuration
<Image src="/assets/photo?v=1" alt="Photo" width="100" height="100" />
```

```ts filename="next.config.ts"
const nextConfig = {
  images: {
    localPatterns: [{
      pathname: '/assets/**',
      search: '?v=1',
    }],
  },
}
```

2. **minimumCacheTTL**: Default changed from 60s to 4 hours (14400s)
3. **imageSizes**: Value `16` removed from default array
4. **qualities**: Default changed to only `[75]`
5. **Local IP restriction**: Blocked by default (set `dangerouslyAllowLocalIP: true` for private networks)
6. **maximumRedirects**: Default changed from unlimited to 3

### Deprecated

- `next/legacy/image` component - use `next/image`
- `images.domains` config - use `images.remotePatterns`

## 11. Turbopack Configuration (Next.js 16)

**Turbopack is now stable and default** - no `--turbopack` flag needed.

### Configuration Location Changed

```ts filename="next.config.ts"
// ❌ Old (experimental)
const nextConfig = {
  experimental: {
    turbopack: { /* options */ },
  },
}

// ✅ New (top-level)
const nextConfig = {
  turbopack: { /* options */ },
}
```

### Opt-out of Turbopack

```json filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack" // Use Webpack for builds
  }
}
```

### Resolve Alias Fallback

```ts filename="next.config.ts"
const nextConfig = {
  turbopack: {
    resolveAlias: {
      fs: { browser: './empty.ts' }, // Silence fs errors in browser
    },
  },
}
```

## 12. Removed Features (Next.js 16)

**Do NOT use these - they are completely removed:**

1. **AMP Support**:
   - `useAmp()` hook removed
   - `export const config = { amp: true }` removed
   - `amp` config option removed

2. **`next lint` command**:
   - Use `eslint .` directly
   - `eslint` option in `next.config.js` removed

3. **Runtime Configuration**:
   - `serverRuntimeConfig` removed - use `process.env` in Server Components
   - `publicRuntimeConfig` removed - use `NEXT_PUBLIC_*` env vars
   - Use `connection()` function for runtime env access:
   ```tsx
   import { connection } from 'next/server'
   
   export default async function Page() {
     await connection()
     const config = process.env.RUNTIME_CONFIG
     return <p>{config}</p>
   }
   ```

4. **Other Removals**:
   - `devIndicators.appIsrStatus`, `buildActivity`, `buildActivityPosition`
   - `experimental.dynamicIO` (use `cacheComponents` instead)
   - `unstable_rootParams` function

## 13. React Compiler Support (Stable)

```ts filename="next.config.ts"
const nextConfig = {
  reactCompiler: true, // Automatic memoization
}
```

Install plugin:
```bash
npm install -D babel-plugin-react-compiler
```

---

## 14. Avoid Unnecessary Example Files

Do not create example/demo files (like ModalExample.tsx) in the main codebase unless the user specifically requests a live example, Storybook story, or explicit documentation component. Keep the repository clean and production-focused by default.

## 15. Always use the latest documentation and guides

**CRITICAL: Tool Priority for Next.js Projects**

For Next.js-related tasks, ALWAYS prioritize Next.js MCP tools over Context7:

1. **PRIMARY (Next.js MCP Tools)**: Use these FIRST for all Next.js work
   - `nextjs_docs` - Official Next.js 16 documentation and knowledge base
   - `nextjs_runtime` - Query running dev server (errors, logs, routes, metadata)
   - `browser_eval` - Playwright browser testing for page verification
   - `upgrade_nextjs_16` - Official migration and upgrade tool
   - `enable_cache_components` - Cache Components setup assistant

2. **FALLBACK (Context7 Tools)**: Use ONLY for non-Next.js libraries
   - `resolve_library_id` - For Supabase, Tailwind, React libraries, etc.
   - `get_library_docs` - For non-Next.js framework documentation

**Why Next.js MCP is Primary**:
- Official Vercel-maintained tools
- Real-time application state access
- Project-aware context (knows your specific setup)
- Integrated browser testing via Playwright
- Authoritative Next.js 16 documentation

**Example Usage**:
- ✅ "How do I use Server Actions?" → Use `nextjs_docs`
- ✅ "What errors exist in my app?" → Use `nextjs_runtime` with `get_errors`
- ✅ "Test if /profile loads correctly" → Use `browser_eval`
- ✅ "How do I use Supabase RLS?" → Use Context7 `get_library_docs`

