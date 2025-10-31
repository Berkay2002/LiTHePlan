# Product Context

## Why This Exists
Linköping University offers incredible flexibility for civil engineering students to customize their master's programs by combining courses across 15 different engineering programs and 25+ specializations. However, this flexibility is underutilized because:
- Course information is scattered across multiple portals
- Students don't know what cross-disciplinary options exist
- Manual planning with spreadsheets is error-prone
- No validation tools exist to ensure degree requirements are met

LiTHePlan solves this by creating a single, intuitive interface for course discovery and profile building.

## User Journey

### Guest User Flow
1. **Discover Courses**: Land on catalog page with 475 courses
2. **Filter & Search**: Narrow down by term, level, campus, specialization
3. **Build Profile**: Add courses to visual pinboard across terms 7, 8, 9
4. **Validate Plan**: See real-time credit tracking and requirement validation
5. **Save Locally**: Profile persists in localStorage across sessions
6. **Sign Up Prompted**: Encouraged to create account for cloud sync and sharing

### Authenticated User Flow
1. **Same Discovery**: Identical course catalog experience
2. **Cloud Sync**: Profile automatically saves to Supabase
3. **Share Profiles**: Generate unique URLs to share with advisors
4. **Multi-Device**: Access same profile across devices
5. **Realtime Updates**: Changes sync instantly across sessions

### Academic Advisor Flow
1. **Receive Shared Link**: Student shares profile URL
2. **View Profile**: See complete course selection across 3 terms
3. **Review Validation**: Check credit totals and requirement compliance
4. **Provide Feedback**: Discuss with student in meetings

## Core Features

### 1. Course Discovery (Main Page)
**Problem Solved**: Students can't see all available options
**How It Works**:
- Grid/list view toggle for 339 courses
- Multi-select filters: level, term, block, pace, campus, program
- Search across course code, name, examiner, subject area
- Pagination (50 courses per page)
- Server-side filtering via `/api/courses` route
- Enhanced metadata: huvudomrade (subject area), examinator, studierektor

**Key Interaction**: Click course card → Opens modal with details and "Add to Profile" button

### 2. Profile Builder (Pinboard)
**Problem Solved**: Manual planning is tedious and error-prone
**How It Works**:
- Visual columns for terms 7, 8, 9
- Drag-and-drop course cards between terms
- Real-time credit calculation (total and advanced)
- Color-coded validation indicators (green = valid, red = issues)
- Touch-friendly for mobile planning

**Key Interactions**:
- Add course → Select target term → Shows in pinboard
- Remove course → Confirmation modal → Updates totals
- Move course → Drag to different term → Validates availability

### 3. Conflict Detection
**Problem Solved**: Students accidentally select mutually exclusive courses
**How It Works**:
- Scans course `notes` field for restriction patterns
- Pattern: "The course may not be included in a degree together with: TSBK02, TSBK35"
- Shows modal when adding conflicting course
- User chooses: remove existing course or cancel addition

**Example**: Adding TSBK07 when TSBK02 already in profile → Modal lists conflict → User removes TSBK02 → TSBK07 added

### 4. Validation System
**Problem Solved**: Students miss degree requirements
**How It Works**:
- Automatic validation after every profile change
- Checks:
  - Total credits = 90hp (exact)
  - Advanced credits ≥ 60hp (minimum)
  - No duplicate courses across terms
  - Courses only in valid terms
- Visual feedback in sidebar and summary card

**Validation States**:
- ✅ Valid: All requirements met
- ⚠️ Warning: Credits not matching targets
- ❌ Error: Duplicates or invalid term placement

### 5. Profile Persistence
**Problem Solved**: Students lose work between sessions
**How It Works**:
- **Hybrid Storage Pattern**:
  - Guest users → localStorage only
  - Authenticated → Supabase + localStorage fallback
  - Automatic cloud sync on every change
  - Graceful degradation if Supabase fails
- Profile includes: name, creation date, courses per term, metadata

## User Experience Goals

### Performance
- Initial page load: < 2.5s LCP
- Filter response: Instant (client-side state + server-side data)
- Course addition: < 100ms feedback
- Pagination: Smooth, no jarring transitions

### Accessibility
- Keyboard navigation for all interactions
- Screen reader support via semantic HTML
- ARIA labels on interactive elements
- High contrast for validation states
- Touch targets ≥ 44x44px for mobile

### Mobile Experience
- Responsive grid/list layouts
- Touch-optimized drag-and-drop
- Collapsible filters in sidebar
- Bottom navigation for key actions
- Readable course cards on small screens

### Visual Design
- Clean, modern interface with Tailwind CSS
- shadcn/ui components for consistency
- Color coding: Blue (info), Green (valid), Red (error), Yellow (warning)
- Swedish flag colors for LiTH branding context

## Key Decisions

### Why Hybrid Storage?
- **Guest-first approach**: Let users explore without signup friction
- **Conversion path**: Prompt for signup to unlock cloud features
- **Reliability**: localStorage fallback ensures no data loss

### Why Swedish Terms?
- **Academic accuracy**: Official university terminology
- **No translation errors**: Prevents confusion in advisor discussions
- **Student familiarity**: Target users already know these terms

### Why Manual Database?
- **LiU integration complexity**: No public API available
- **Update frequency**: Courses change annually, not daily
- **Control**: Ensures data quality and consistency

### Why No Prerequisite Validation?
- **Complexity**: Prerequisite chains are complex and exceptions exist
- **Student responsibility**: Advisors ultimately validate prerequisites
- **Scope limitation**: Conflict detection covers most critical cases

## Future Enhancements (Not Implemented)
- Export to PDF for advisor meetings
- Profile templates for common specializations
- Alumni career path examples
- Course rating/review system
- Timetable conflict detection (scheduling clashes)
- Prerequisite chain visualization
