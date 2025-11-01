# [DESIGN-001] - Color Theme Migration to Cyan-Teal

**Status:** Deferred  
**Added:** November 1, 2025  
**Updated:** November 1, 2025

## Original Request
Migrate entire application from purple-pink Catppuccin theme to cyan-teal color scheme with full theme awareness. Goal is to have consistent LiU-inspired branding (turquoise/cyan colors) and support proper light/dark mode switching.

## Thought Process
Initial approach was to do bulk find-replace of color values, but this led to inconsistencies:
- Some components converted to theme tokens ✅
- Many components still use hardcoded Tailwind classes (amber, air-superiority-blue) ❌
- Custom colors (picton-blue, air-superiority-blue) are undefined in Tailwind config

Better approach:
1. Complete global CSS conversion (DONE ✅)
2. Create semantic color mapping utility
3. Systematically update components one-by-one
4. Remove or define custom color classes
5. Test theme switching thoroughly

Decision to defer:
- Not blocking production functionality
- Partial theme works acceptably
- Requires focused effort to complete properly
- Can be completed when user prioritizes visual consistency

## Implementation Plan

### Phase 1: Foundation (COMPLETE ✅)
1. ✅ Convert global CSS OKLCH values to cyan-teal hues
2. ✅ Update primary colors: 297° → 192-195° (cyan)
3. ✅ Update accent colors: 235° → 178-180° (teal)
4. ✅ Update neutral grays with cyan-teal tint

### Phase 2: Component Migration (~40% Complete ⏳)
1. ✅ Update utility functions (course-utils, conflict-utils)
2. ✅ Update core components (FilterPanel, ViewToggle, etc.)
3. ⏳ Update remaining 15+ components with hardcoded colors
4. ⏳ Define or remove custom color classes

### Phase 3: Validation (NOT STARTED)
1. ❌ Test light/dark mode switching
2. ❌ Verify all components use theme tokens
3. ❌ Check contrast ratios (WCAG AA compliance)
4. ❌ Cross-browser testing

## Progress Tracking

**Overall Status:** Deferred - 40% Complete

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Convert global CSS colors | Complete | Nov 1 | All OKLCH values updated |
| 1.2 | Update course-utils.ts | Complete | Nov 1 | Badge functions theme-aware |
| 1.3 | Update conflict-utils.ts | Complete | Nov 1 | Conflict styling uses destructive token |
| 1.4 | Update FilterPanel | Complete | Nov 1 | ~90% complete, some white text remains |
| 1.5 | Update ViewToggle | Complete | Nov 1 | Fully theme-aware |
| 1.6 | Update CourseGrid/List | Complete | Nov 1 | White text → foreground |
| 1.7 | Update Pagination | Complete | Nov 1 | All colors → theme tokens |
| 1.8 | Update TermSelectionModal | Complete | Nov 1 | Fully theme-aware |
| 1.9 | Update SortDropdown | Complete | Nov 1 | Air-superiority-blue removed |
| 2.1 | Update ProfileStatsCard | Not Started | - | Amber warnings need chart-4 |
| 2.2 | Update ProfileSummary | Not Started | - | Status colors (red/green/amber) |
| 2.3 | Update ProfileSidebarSkeleton | Not Started | - | Air-superiority-blue hardcoded |
| 2.4 | Update ProfilePinboard | Not Started | - | Amber warnings |
| 2.5 | Update PinnedCourseCard | Not Started | - | Amber badges → chart-4 |
| 2.6 | Update CourseListItem | Not Started | - | Amber pin badges → chart-4 |
| 2.7 | Update CourseCard | Not Started | - | Amber warnings → chart-4 |
| 2.8 | Update DraggableTermCard | Not Started | - | Block badge colors |
| 2.9 | Update EditableTermCard | Not Started | - | Block badge colors |
| 2.10 | Update SimpleTermCard | Not Started | - | Cross-period badge colors |
| 2.11 | Update remaining 5+ components | Not Started | - | Various hardcoded colors |
| 3.1 | Define custom color classes | Not Started | - | picton-blue, air-superiority-blue |
| 3.2 | Test theme switching | Not Started | - | Light/dark mode validation |
| 3.3 | WCAG contrast validation | Not Started | - | Ensure AA compliance |

## Progress Log

### November 1, 2025
- Audited entire codebase for hardcoded colors
- Found 200+ instances of Tailwind color classes
- Found 18 hex color values in components
- Documented 10+ undefined custom colors
- Created systematic migration plan
- **Decision**: Defer until user prioritizes visual consistency
- **Rationale**: Not blocking functionality, ~40% completion is acceptable interim state
- Updated Memory Bank to reflect deferred status

## Technical Notes

### Color Mapping Strategy
```typescript
// Advanced level: bg-primary/10 text-primary (cyan)
// Basic level: bg-chart-2/10 text-chart-2 (green)
// Linköping: bg-accent/10 text-accent (teal)
// Norrköping: bg-chart-4/10 text-chart-4 (orange)
// Blocks: bg-chart-1/10 through bg-chart-4/10
// Conflicts: text-destructive, border-destructive (red)
// Status complete: text-chart-2 (green)
// Status warning: text-chart-4 (orange)
```

### Custom Colors to Resolve
- `picton-blue` - 30+ references (needs definition or replacement)
- `air-superiority-blue` - 20+ references (needs definition or replacement)
- `electric-blue` - Few references
- `battleship-gray` - Few references
- `custom-red` - Replace with destructive token

### Files Modified (Phase 1 & 2)
- `app/globals.css` - OKLCH colors converted ✅
- `lib/course-utils.ts` - Badge functions theme-aware ✅
- `lib/conflict-utils.ts` - Conflict styling theme-aware ✅
- `components/TermCard.tsx` - Block/conflict colors ✅
- `components/course/FilterPanel.tsx` - ~90% converted ✅
- `components/course/ViewToggle.tsx` - Fully converted ✅
- `components/course/CourseGrid.tsx` - Fully converted ✅
- `components/course/CourseList.tsx` - Fully converted ✅
- `components/shared/Pagination.tsx` - Fully converted ✅
- `components/course/TermSelectionModal.tsx` - Fully converted ✅
- `components/course/SortDropdown.tsx` - Fully converted ✅

### Files Pending (Phase 2)
- `components/ProfileStatsCard.tsx`
- `components/profile/ProfileSummary.tsx`
- `components/profile/ProfileSidebarSkeleton.tsx`
- `components/profile/ProfilePinboard.tsx`
- `components/profile/PinnedCourseCard.tsx`
- `components/course/CourseListItem.tsx`
- `components/course/CourseCard.tsx`
- `components/DraggableTermCard.tsx`
- `components/EditableTermCard.tsx`
- `components/SimpleTermCard.tsx`
- Plus 5+ additional components with scattered hardcoded colors

## When to Resume
This task should be resumed when:
1. User explicitly prioritizes visual consistency
2. Theme switching becomes a required feature
3. Brand guidelines require strict color adherence
4. User reports confusion from color inconsistencies

## Completion Criteria
- [ ] All components use theme-aware colors (no hardcoded Tailwind classes)
- [ ] All custom colors defined in Tailwind config or removed
- [ ] Light/dark mode switching works correctly across all components
- [ ] WCAG AA contrast ratios verified
- [ ] No console warnings about undefined colors
- [ ] Visual consistency across entire application
