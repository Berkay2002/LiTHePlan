# Project Brief: LiTHePlan

## Project Name
LiTHePlan (Linköping University Course Planner)

## Vision
Empower Linköping University civil engineering students to discover and plan personalized 90hp master's programs (terms 7-9) by making 475+ courses across 25 specializations easily discoverable and plannable.

## Core Problem
Civil engineering master's students at Linköping University face significant challenges:
- **Fragmented Information**: Course data scattered across multiple university portals
- **Poor Discoverability**: No intuitive way to explore cross-disciplinary combinations
- **Manual Planning**: Time-consuming, error-prone spreadsheet-based course selection
- **Missed Opportunities**: Students defaulting to standard tracks, missing career-focused customization

## Solution
A modern web application providing:
1. **Centralized Course Catalog**: All 339 curated master's level courses in one searchable, filterable interface
2. **Interactive Profile Builder**: Visual "pinboard" for planning courses across 3 semesters
3. **Validation System**: Automatic checking of degree requirements (90hp total, 60hp advanced)
4. **Conflict Detection**: Prevents selecting mutually exclusive courses
5. **Profile Sharing**: Save and share plans with advisors and peers

## Target Users
**Primary**: Civil engineering master's students (terms 7-9) at Linköping University
**Secondary**: Academic advisors supporting student planning

## Success Criteria
1. Students can discover courses from multiple specializations they weren't aware of
2. Profile creation time reduced from hours (spreadsheets) to minutes
3. Academic requirement violations caught automatically before advisor meetings
4. Students actively share profiles with advisors for consultation

## Technical Scope
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (PostgreSQL)
- **Auth**: Supabase authentication (email/password)
- **Storage**: Hybrid pattern (Supabase for authenticated, localStorage for guests)
- **Database**: 339 curated courses (duplicates/deprecated removed) with Swedish terminology and enhanced metadata

## Non-Goals (Out of Scope)
- Real-time university database integration (manual updates only)
- Prerequisite validation (courses list restrictions in notes field)
- Registration system integration (planning tool only)
- Course recommendation engine (students explore manually)
- Multi-language support (Swedish terms preserved as-is)

## Key Constraints
1. **Data Accuracy**: Course database is manually compiled, NOT officially from LiU
2. **Swedish Terminology**: Academic terms must remain in Swedish (grundnivå, avancerad nivå)
3. **Academic Requirements**: Hard-coded to 90hp total, 60hp advanced minimum
4. **Terms**: Fixed to terms 7, 8, 9 only (master's program)
5. **No Real-Time Sync**: Database updates require manual intervention

## Project Status
**Current Phase**: Production-ready MVP
**Deployment**: Live on Vercel
**Database**: Supabase with 475 courses populated
