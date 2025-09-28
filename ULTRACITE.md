# Ultracite Quick Reference

This file distills the shared rules from `GEMINI.md` and `.cursor/rules/ultracite.mdc` so agents only need a single checklist. Refer to the source files if you need exhaustive wording or future updates.

## Canonical Sources
- `GEMINI.md`: human-oriented overview of Ultracite.
- `.cursor/rules/ultracite.mdc`: machine-enforced rule set used by editors.
- Run `npm run lint` (Biome + Ultracite) before every handoff; it is the source of truth.

## Core Workflow Expectations
- Study nearby code, edge cases, and accessibility needs before writing anything.
- Keep TypeScript strict: no `any`, prefer typed helpers, and use server components unless interactivity requires a client boundary.
- Do not introduce console statements, debuggers, loose equality, or `var` declarations.
- Prefer `const`, arrow functions, optional chaining, and literal property access.
- Let Biome handle formatting; never hand-format.

## Accessibility Hotlist
- Provide meaningful `alt` text, accessible link content, and `type="button"` on `<button>` elements.
- Avoid positive `tabIndex`, `aria-hidden` on focusable elements, or unsupported ARIA roles/properties.
- Pair pointer handlers with keyboard equivalents and maintain visible focus states.
- Supply `<title>` for `<svg>` and `<iframe>`, `lang` on `<html>`, and captions for media.

## Code Quality Traps to Avoid
- Replace `Array.forEach` with `for...of` when sequencing logic.
- Prefer `.flatMap()` over `map().flat()` and `Date.now()` over `new Date().getTime()`.
- Use optional chaining/coalescing instead of chained logical expressions.
- Never assign within conditionals, create sparse arrays, or throw non-`Error` values.
- Keep control flow simple: avoid nested `else` chains when early returns work.

## Next.js Specifics
- Use `next/image`, not raw `<img>` tags.
- Keep `<head>` usage within App Router conventions; never import `next/document` in regular modules.

## Testing Notes
- No focused (`it.only`) or skipped (`it.skip`) tests; keep assertions inside `it(...)` blocks.
- Use ESM syntax, not `require`/`module.exports`, in test files.

## Daily Commands
- `npm run lint` / `npm run check`: ensure Ultracite and Biome stay green.
- `npm run lint:fix`: auto-fix issues, then review the diff manually.

If Ultracite flags something unfamiliar, search the codebase for a compliant example or consult the source documents above.
