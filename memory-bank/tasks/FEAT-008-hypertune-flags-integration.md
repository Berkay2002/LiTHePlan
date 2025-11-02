# [FEAT-008] - Hypertune Flags SDK Integration

**Status:** In Progress  
**Added:** November 2, 2025  
**Updated:** November 2, 2025

## Original Request
Integrate Hypertune with Vercel's Flags SDK so the application can evaluate feature flags backed by Hypertune data. The Vercel integration has been created already; we need to finish the application-side setup so flags can be consumed across server components, route handlers, and middleware.

## Thought Process
- Use the official Hypertune App Router quickstart as the baseline and extend it with the Vercel Flags SDK adapter section.
- Keep the integration server-first so existing components can call flags without large refactors; provide client-side hydration hooks later if needed.
- Reuse Supabase-authenticated user context for flag identification where possible, with a safe fallback for guests.
- Ensure the generated Hypertune client lives under `generated/` and document the regeneration workflow so future changes stay in sync with Hypertune UI updates.
- Provide sensible fallbacks when environment variables are missing to prevent runtime crashes in local environments that have not pulled the integration secrets yet.

## Implementation Plan
- Add required runtime dependencies (`hypertune`, `server-only`, `flags`, `@flags-sdk/hypertune`, `@vercel/edge-config`).
- Define the Hypertune configuration helpers (`lib/getHypertune.ts`) that hydrate from Vercel Edge Config when available and expose a memoised identify hook that reads Supabase auth.
- Create `flags.ts` that wires the Hypertune adapter into the Vercel Flags SDK and exports typed flag accessors.
- Expose the Vercel Toolbar discovery endpoint at `app/.well-known/vercel/flags/route.ts`.
- (Deferred) Update global layout to provide Hypertune context only when we have a token so client components can consume flags later without extra plumbing.
- Document environment variables in `.env.local` and Memory Bank notes as needed.
- Run `npx hypertune` to materialise the generated client files and commit them alongside the integration.
- Verify TypeScript builds cleanly and lint passes.

## Progress Tracking

**Overall Status:** In Progress - 70%

### Subtasks
| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Add dependencies and regenerate lockfile | Complete | Nov 2 | Added Hypertune + Flags packages, installed with npm |
| 1.2 | Implement Hypertune helper (`lib/getHypertune.ts`) | Complete | Nov 2 | Server helper hydrates from Edge Config when available |
| 1.3 | Create Vercel Flags adapter (`flags.ts`) | Complete | Nov 2 | Adapter exposes `createServerFlag` helper |
| 1.4 | Add discovery route & optional provider wiring | Complete | Nov 2 | Added `app/.well-known/vercel/flags/route.ts` |
| 1.5 | Document env vars and update Memory Bank if needed | In Progress | Nov 2 | `.env.local` updated; Memory Bank update pending |
| 1.6 | Generate Hypertune client and verify build/lint | Blocked | Nov 2 | `npx hypertune` fails because no flags exist yet |

## Progress Log
### November 2, 2025
- Captured requirements in Memory Bank and outlined implementation steps.
- Added Hypertune / Vercel Flags dependencies and updated lockfile.
- Created fallback `generated` client stubs to allow compilation until real flags exist.
- Implemented `lib/getHypertune.ts` with Supabase-aware context resolution.
- Added server-side adapter in `flags.ts` plus discovery endpoint at `app/.well-known/vercel/flags/route.ts`.
- Updated `.env.local` with required Hypertune CLI variables.
- Attempted `npx hypertune`; command fails because the Hypertune project has no flags yet—documented as blocked.
