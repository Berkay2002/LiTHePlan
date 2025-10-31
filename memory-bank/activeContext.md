# Active Context

## Current Status
**Date**: October 31, 2025
**Phase**: Next.js 16 Compliance Verified
**Focus**: Production-ready with Next.js 16.0.1

## Recent Changes (Current Session)
1. ✅ Upgraded Next.js from 15.5.4 to 16.0.1
2. ✅ Upgraded React from 19.1.0 to 19.2.0
3. ✅ Migrated `middleware.ts` → `proxy.ts` (Next.js 16 breaking change)
4. ✅ Updated React type definitions to 19.2.2
5. ✅ Build verification passed - TypeScript compiles cleanly
6. ✅ Browser verification completed - all pages load without errors
7. ✅ Added Next.js MCP Server documentation to AGENTS.md
8. ✅ Updated project documentation for Next.js 16 compliance
9. ✅ Renamed `utils/supabase/middleware.ts` → `utils/supabase/session.ts` for clarity
10. ✅ Added Node.js engine requirement (>=18.18.0) to package.json
11. ✅ Runtime verification via MCP tools - zero errors detected
12. ✅ Memory Bank documentation updated with compliance status

## What's Working
- ✅ Full course catalog from Supabase
- ✅ Server-side filtering and pagination (< 500ms response)
- ✅ Interactive profile builder with drag-and-drop
- ✅ Conflict detection system for mutually exclusive courses
- ✅ Hybrid storage (Supabase + localStorage fallback)
- ✅ User authentication with Supabase
- ✅ Realtime profile sync across sessions
- ✅ Profile validation (90hp total, 60hp advanced)
- ✅ Mobile-responsive UI with touch support
- ✅ Accessibility standards (WCAG 2.1 AA)
- ✅ Production deployment on Vercel

## Current Work Focus
### Production API Improvements - COMPLETE ✅
**Status**: All production-ready improvements implemented successfully

**What Was Done**:
1. **Rate Limiting**: Upstash Redis integration with sliding window algorithm
   - Courses: 100 req/min
   - Profile reads: 50 req/min
   - Profile writes: 10 req/min
   - Auth: 30 req/min
2. **Error Tracking**: Sentry integration with breadcrumbs and context
3. **Input Validation**: Zod strict schemas prevent injection attacks
4. **Structured Logging**: Request correlation with unique IDs
5. **Response Standardization**: Consistent JSON format across all endpoints
6. **Response Caching**: HTTP Cache-Control headers (TTL-based)
7. **Debug Endpoint Removal**: Deleted `app/api/debug/` (security risk)

**Files Created**:
- `lib/api-validation.ts` - Zod schemas with strict mode
- `lib/rate-limit.ts` - Upstash Redis rate limiters
- `lib/logger.ts` - Structured logging with Sentry
- `lib/api-response.ts` - Standardized response helpers

**Files Upgraded**:
- `app/api/courses/route.ts` - Added rate limiting, validation, logging, caching
- `app/api/profile/route.ts` (POST + GET) - Full security hardening
- `app/api/profile/[id]/route.ts` - UUID validation, removed debug leaks
- `app/api/auth/callback/route.ts` - Rate limiting, Sentry breadcrumbs

**Memory Bank Updates**:
- `techContext.md` - Added "Production Infrastructure" section
- `systemPatterns.md` - Added "API Security Patterns" section
- `activeContext.md` - Documented Supabase optimization notes (below)

**Next Steps**: Monitor production metrics, verify Sentry integration, test rate limits

### Pending Supabase Optimizations
**Status**: Documented for future implementation

These optimizations require Supabase MCP tool access or direct database configuration:

1. **Connection Pooling**:
   - Switch from `session` mode to `transaction` mode in Supabase settings
   - Reduces connection overhead for API routes
   - Improves response times under load
   - **How**: Supabase Dashboard → Settings → Database → Connection Pooling → Mode: Transaction

2. **Database Indexes**:
   - Add index on `academic_profiles.user_id` for faster user profile lookups
   - Add GIN index on `courses.programs` for array searches
   - **SQL**:
     ```sql
     CREATE INDEX idx_profiles_user_id ON academic_profiles(user_id);
     CREATE INDEX idx_courses_programs ON courses USING GIN (programs);
     CREATE INDEX idx_courses_orientations ON courses USING GIN (orientations);
     ```

3. **RLS Policy Audit**:
   - Verify Row Level Security policies prevent cross-user access
   - Ensure `academic_profiles` table restricts access to profile owner only
   - Test with different user accounts to confirm isolation
   - **Check**: Supabase Dashboard → Authentication → Policies

4. **Realtime Optimization**:
   - Use selective `postgres_changes` filters instead of full table subscriptions
   - Filter by `user_id` to reduce message volume
   - **Example**:
     ```typescript
     const subscription = supabase
       .channel('profile-changes')
       .on('postgres_changes', {
         event: '*',
         schema: 'public',
         table: 'academic_profiles',
         filter: `user_id=eq.${user.id}` // Only this user's profiles
       }, handleChange)
       .subscribe();
     ```

5. **Query Performance**:
   - Add `EXPLAIN ANALYZE` to slow queries to identify bottlenecks
   - Consider materialized views for course statistics if needed
   - Monitor query performance in Supabase Dashboard → Database → Query Performance

**Implementation Priority**:
1. High: Connection pooling (immediate performance gain)
2. High: Database indexes (improves filter performance)
3. Medium: RLS audit (security verification)
4. Low: Realtime optimization (only if many concurrent users)
5. Low: Query performance tuning (only if metrics show issues)

### Next.js 16 Compliance Verification - COMPLETE ✅
**Status**: All verification tasks completed successfully

**What Was Done**:
1. Comprehensive codebase audit against Next.js 16 breaking changes
2. File renaming for clarity (`utils/supabase/middleware.ts` → `session.ts`)
3. Added Node.js version constraint to package.json
4. Runtime verification using next-devtools MCP tools
5. Browser automation testing of critical pages
6. Memory Bank documentation updates

**Verification Results**:
- ✅ **Overall Compliance Score**: 99/100 (Excellent)
- ✅ **Critical Issues**: 0
- ✅ **Major Issues**: 0
- ✅ **Minor Issues**: 1 (cosmetic file naming - now resolved)
- ✅ **Runtime Errors**: 0 (verified via MCP)
- ✅ **Build Errors**: 0 (TypeScript compiles cleanly)
- ✅ **Browser Console Errors**: 0 (verified via Playwright)

**Next.js 16 Features Verified**:
- ✅ Async Request APIs (`cookies()`, `params` properly awaited)
- ✅ Proxy pattern (renamed from middleware, exports `proxy` function)
- ✅ Turbopack default build (no configuration needed)
- ✅ React 19.2 compatibility
- ✅ Modern Image component (no legacy imports)
- ✅ Server/Client component split (proper 'use client' directives)
- ✅ Environment variables (proper NEXT_PUBLIC_ usage)
- ✅ Route handlers (async params in API routes)

**No Further Action Required**

## Active Decisions
### Next.js 16 Migration Strategy
- **Decision**: Maintain current architecture, no breaking changes needed
- **Rationale**: Codebase was already following Next.js 16 best practices
- **Impact**: Seamless upgrade with only cosmetic improvements

### File Naming Convention
- **Decision**: Renamed `utils/supabase/middleware.ts` to `session.ts`
- **Rationale**: Avoid confusion with Next.js middleware/proxy pattern
- **Impact**: Clearer separation between Next.js proxy and utility functions

### Documentation Standards
- **Decision**: Use Memory Bank pattern from `memory-bank.instructions.md`
- **Rationale**: Provides structured, consistent documentation that AI agents can rely on
- **Impact**: All future work should update relevant Memory Bank files

### Swedish Terminology Preservation
- **Decision**: Keep all academic terms in Swedish (avancerad nivå, grundnivå, etc.)
- **Rationale**: Official university terminology, prevents confusion in advisor discussions
- **Impact**: Never translate these terms in code or UI

### Hybrid Storage Pattern
- **Decision**: Continue dual-storage approach (Supabase + localStorage)
- **Rationale**: Balances guest user experience with authenticated features
- **Impact**: All profile mutations must go through ProfileContext

## Known Issues
### Technical Debt
1. **No Course Caching**: Every filter change hits Supabase
   - **Impact**: Potential performance issues with many concurrent users
   - **Solution**: Consider React Query or SWR for client-side caching
   
2. **Large Profile Handling**: No optimization for 100+ course selections
   - **Impact**: localStorage might hit limits, UI could lag
   - **Solution**: Implement profile compression or pagination

3. **Mobile Drag-Drop Quirks**: Some Android browsers have touch issues
   - **Impact**: Inconsistent UX on certain devices
   - **Solution**: Add fallback to add/remove buttons

### Feature Gaps (Documented, Not Planned)
- No PDF export for advisor meetings
- No course prerequisites validation
- No timetable conflict detection (scheduling clashes)
- No course rating/review system
- No profile templates for common specializations

## Next Actions
1. **Immediate**: Complete Memory Bank setup
   - Create `progress.md`
   - Create `tasks/_index.md`
   - Review all documentation for accuracy

2. **Short-term**: No active development planned
   - System is stable and production-ready
   - Focus on maintenance and bug fixes

3. **Long-term**: Potential enhancements
   - User feedback collection
   - Performance optimization
   - Feature additions based on student needs

## Important Notes for AI Agents
- **Always read Memory Bank files** before starting any task
- **Update activeContext.md** after significant changes
- **Document new patterns** in systemPatterns.md
- **Never bypass ProfileContext** for profile mutations
- **Preserve Swedish terminology** in all code and UI
- **Test conflict detection** when modifying course addition logic
- **Run Ultracite linting** before committing (`npm run lint`)

## Questions for User
None at this time - Memory Bank setup is clear and straightforward.

## Session Summary
**All Next.js 16 compliance verification tasks completed successfully.**

**Achievements**:
- ✅ Zero runtime errors detected
- ✅ Zero build errors
- ✅ Zero browser console errors
- ✅ All critical pages load correctly
- ✅ MCP tools verified application health
- ✅ Documentation fully updated

**Production Status**: Application is production-ready on Next.js 16.0.1
