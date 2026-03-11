# Conventions

## TypeScript Standards

- **Strict mode enabled**: All files `.ts` or `.tsx`
- **No `any` type**: Use `unknown` with type guards instead
- **Type imports**: Use `import type { ... }` for type-only imports
- **ES Modules only**: Never use CommonJS (`require`, `module.exports`)

## Component Patterns

### Server Components (Default)

```typescript
// app/page.tsx - NO 'use client'
export default async function Page() {
  const data = await fetchServerData();
  return <ClientComponent initialData={data} />;
}
```

### Client Components

```typescript
// components/FilterPanel.tsx
"use client"; // REQUIRED at top

import { useState } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
```

> [!CAUTION]
> Never use `next/dynamic` with `{ ssr: false }` in Server Components. Extract to Client Components instead.

## File Naming

- **Components**: `PascalCase.tsx` (e.g., `CourseCard.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useCourses.ts`)
- **Types**: `camelCase.ts` (e.g., `course.ts`)

## Critical Rules

### ProfileContext (Mandatory)

```typescript
// ✅ CORRECT
const { addCourse } = useProfile();
await addCourse(newCourse, 7);

// ❌ WRONG - Direct mutation
profile.terms[7].push(newCourse);
```

### Conflict Checking (Mandatory)

```typescript
// ALWAYS check before adding courses
const conflicts = findCourseConflicts(newCourse, profile);
if (conflicts.length > 0) {
  showConflictModal({ newCourse, conflicts });
}
```

### API Routes

```typescript
// ✅ Use existing API route
const response = await fetch("/api/courses?term=7");

// ❌ Don't duplicate logic client-side
const courses = await supabase.from("courses").select("*");
```

### Dense Filter Controls

- `components/ui/MultiSelect` treats `maxCount={0}` as an intentional compact-summary mode for dense filter surfaces; it should render a count summary badge instead of zero visible selection chips

## Ultracite Linting Rules

- No `console.log` in production code
- Arrow functions preferred over function expressions
- Template literals over string concatenation
- Async/await over raw promises
- The default Biome/Ultracite pass is scoped to application code only: `app/`, `components/` except `components/ui/`, `hooks/`, `lib/`, `tests/`, `types/`, `utils/`, and root runtime/config entrypoints
- Tooling and documentation folders such as `.agent/`, `.agents/`, `.claude/`, `.github/`, and `.vscode/` are force-ignored and intentionally out of scope for `npm run lint`

## Commit Conventions

```
feat: Add drag-and-drop to ProfilePinboard
fix: Resolve localStorage persistence bug
refactor: Extract conflict logic to utility
docs: Update API documentation
```

## Common Pitfalls

| ❌ Don't                             | ✅ Do                                      |
| ------------------------------------ | ------------------------------------------ |
| Use `any` type                       | Use `unknown` + type guards                |
| Mutate profile directly              | Use ProfileContext actions                 |
| Skip conflict checking               | Always call `findCourseConflicts()`        |
| Hardcode Tailwind colors for banners | Use `AlertBanner` component                |
| Access localStorage during SSR       | Guard with `typeof window !== 'undefined'` |
