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

## UI Patterns

### Course Browsing Cards

- Grid-style course cards should favor a four-zone editorial composition: top rail, title block, structured metadata, and footer actions
- On mobile, `CourseCard` should switch to a dedicated compact composition instead of stacking the desktop layout: use a tight identity rail, a short title block, a dense two-column summary tile rail, and a touch-sized two-action footer with the primary CTA visually dominant
- Keep metadata calm and readable by preferring labeled sections over stacking many equally weighted badges
- Preserve the dominant primary add/remove/conflict CTA and keep the details action visibly secondary
- Keep note indicators compact in the top rail and preserve the existing mobile tooltip-toggle behavior when reworking the surface

### Responsive Tooltips

- When a tooltip or similar Base UI primitive is controlled only on mobile, render it as a distinct keyed instance across breakpoint changes instead of flipping a single instance between `open={...}` and uncontrolled props

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
- Homepage-specific shell pieces belong under `components/home-sidebar/`; only reusable filter logic should stay in `components/course/` and generic framing should stay in `components/layout/`
- When reworking the homepage discovery surface, keep `FilterPanelControls` as the single source of truth for course filter UI and drive the left shell through `PageLayout` rather than cloning sidebar markup in `app/page.tsx`
- In the expanded homepage sidebar header, keep the LiTHePlan brand row separate from course search; the search field should live in its own row beneath the logo/trigger controls
- The homepage mobile discovery navbar should stay a single sticky three-zone row: a restrained but oversized bare sidebar glyph on the left, a centered LiTHePlan lockup in the middle, and one direct text-first `Course Profile` action on the right; avoid decorative icon clusters, logo pills, and oversized CTA heights, and keep course search inside the mobile drawer header instead of duplicating it inline
- The desktop homepage sidebar collapse trigger should use a bare icon-button treatment with no circular container, a slightly larger icon, and no collapsed logo placeholder beside it
- In collapsed desktop mode, the homepage filter section should avoid generic icons and instead show a compact stacked snapshot of the live filter state or key filter dimensions
- Even with the bare-trigger treatment, the desktop collapse button still needs a clear hover/focus wash and a visibly oversized icon so the control reads as interactive at a glance
- Client components must not import the root `flags.ts` Hypertune adapter directly; temporary homepage/UI kill switches should live in `lib/ui-feature-flags.ts` so both browser and server code can read them safely

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
