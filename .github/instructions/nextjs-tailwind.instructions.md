---
description: 'Next.js + Tailwind development standards and instructions'
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js, **/*.css'
---

# Next.js + Tailwind Development Instructions

Instructions for high-quality Next.js 16 applications with Tailwind CSS styling and TypeScript.

## Project Context

- Next.js 16 (App Router with Turbopack)
- TypeScript 5+ for type safety
- Tailwind CSS v4 for styling
- React 19.2 with concurrent features

## Development Standards

### Architecture
- App Router with Server and Client Components
- Group routes by feature/domain
- Implement proper error boundaries
- Use React Server Components by default
- Leverage static optimization where possible
- Use `proxy.ts` (not `middleware.ts`) for auth/session management

### Async Request APIs
- **MANDATORY**: Await all dynamic APIs in Next.js 16
- `cookies()`, `headers()`, `draftMode()` must be awaited
- `params` and `searchParams` are now Promises
- Use `npx next typegen` for type-safe async params

### TypeScript
- Strict mode enabled (TypeScript 5.1+ required)
- Clear type definitions
- Proper error handling with type guards
- Zod for runtime type validation
- No `any` types - use `unknown` with type guards

### Styling
- Tailwind CSS with consistent color palette
- Responsive design patterns
- Dark mode support
- Follow container queries best practices
- Maintain semantic HTML structure

### State Management
- React Server Components for server state
- React hooks for client state
- Proper loading and error states
- Optimistic updates where appropriate

### Data Fetching
- Server Components for direct database queries
- React Suspense for loading states
- Proper error handling and retry logic
- Cache invalidation strategies

### Security
- Input validation and sanitization
- Proper authentication checks
- CSRF protection
- Rate limiting implementation
- Secure API route handling

### Performance
- Image optimization with next/image
- Font optimization with next/font
- Route prefetching
- Proper code splitting
- Bundle size optimization

## Implementation Process
1. Plan component hierarchy
2. Define types and interfaces
3. Implement server-side logic
4. Build client components
5. Add proper error handling
6. Implement responsive styling
7. Add loading states
8. Write tests