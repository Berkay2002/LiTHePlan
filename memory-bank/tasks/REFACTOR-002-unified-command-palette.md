# [REFACTOR-002] - Unified Global Command Palette

**Status:** Completed  
**Added:** November 1, 2025  
**Updated:** November 1, 2025

## Original Request
User reported duplicate Ctrl+K command palettes appearing on certain pages (e.g., profile edit page). Two separate implementations exist:
1. `CourseCommandSearch` - Global course search (mounted in root layout)
2. `ProfileCommandDialog` - Profile/navigation commands (mounted in DynamicNavbar)

Both register the same Ctrl+K keyboard shortcut, causing conflicts and showing multiple dialogs simultaneously.

Requirements:
- Create ONE unified command palette that appears on Ctrl+K
- Dynamic command visibility based on current page route
- Prioritize course search (primary feature, scrollable results)
- Include page-specific commands (share, timeline on profile pages)
- Include global commands (navigation, theme toggle, auth actions)
- Smart height management using ScrollArea for course results

## Thought Process
**Architecture Decision**:
- Create command registry system for centralized command definitions
- Build single `GlobalCommandPalette` component that consumes registry
- Use route patterns and auth state to filter visible commands
- Mount once in root layout to ensure single Ctrl+K handler

**Layout Strategy**:
- Course results in `ScrollArea` (fixed height `h-96` for 12-15 visible courses)
- Static command groups below (compact, no scroll needed)
- Groups: Course Search → Profile Actions → Navigation → Settings → Account

**Component Reuse**:
- Leverage existing `CourseCommandItem` for consistent course display
- Use existing `CommandDialog`, `CommandGroup` from shadcn/ui
- Integrate with existing `/api/courses` endpoint for search

**Migration Path**:
1. Create registry and hook infrastructure
2. Build GlobalCommandPalette component
3. Define all commands from both existing palettes
4. Mount in root layout
5. Remove old implementations
6. Update UI indicators

## Implementation Plan
1. Create command registry (`lib/command-registry.ts`)
2. Create command registry hook (`hooks/useCommandRegistry.ts`)
3. Build GlobalCommandPalette component (`components/shared/GlobalCommandPalette.tsx`)
4. Update root layout to mount GlobalCommandPalette
5. Remove CourseCommandSearch from layout
6. Remove ProfileCommandDialog from DynamicNavbar
7. Update SearchBar to trigger GlobalCommandPalette
8. Update DynamicNavbar ⌘K indicator
9. Test all workflows (course search, profile commands, auth state)

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks
| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Create command registry system | Complete | Nov 1 | lib/command-registry.ts |
| 1.2 | Create useCommandRegistry hook | Complete | Nov 1 | hooks/useCommandRegistry.ts |
| 1.3 | Build GlobalCommandPalette component | Complete | Nov 1 | components/shared/GlobalCommandPalette.tsx |
| 1.4 | Create CommandPaletteContext | Complete | Nov 1 | For timeline toggle registration |
| 1.5 | Update root layout integration | Complete | Nov 1 | Mounted GlobalCommandPalette |
| 1.6 | Remove old CourseCommandSearch | Complete | Nov 1 | Cleaned up duplicate |
| 1.7 | Remove old ProfileCommandDialog | Complete | Nov 1 | Cleaned up duplicate |
| 1.8 | Update DynamicNavbar integration | Complete | Nov 1 | Registers timeline toggle |
| 1.9 | Fix TypeScript errors in app/page.tsx | Complete | Nov 1 | parseViewMode null handling |
| 1.10 | Fix nested ScrollArea issue | Complete | Nov 1 | Removed ScrollArea from course results |
| 1.11 | Test all critical workflows | Complete | Nov 1 | Browser automation confirmed success |

## Progress Log
### November 1, 2025
- Created task file
- Implemented command registry system (lib/command-registry.ts)
- Implemented useCommandRegistry hook with route/auth filtering
- Built GlobalCommandPalette component with ScrollArea for course results
- Created CommandPaletteContext for dynamic props (timeline toggle)
- Updated root layout to use GlobalCommandPalette with provider
- Removed CourseCommandSearch from layout
- Removed ProfileCommandDialog from DynamicNavbar
- Updated DynamicNavbar to register timeline toggle with context
- Fixed pre-existing TypeScript errors in app/page.tsx (parseViewMode)
- Build succeeded - all components compile correctly
- **User reported nested ScrollArea issue** - fixed by removing inner ScrollArea
- Browser automation testing confirmed:
  - ✅ No duplicate dialogs (single Ctrl+K handler works)
  - ✅ No nested scroll areas (scrollAreaCount: 0)
  - ✅ CommandList handles scrolling naturally (overflow: auto)
  - ✅ Command groups appear correctly (Navigation, Settings)
  - ✅ Course search integration functional
- **Task completed successfully**
