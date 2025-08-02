# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **LiTHePlan** - a Next.js application for Linköping University civil engineering students to discover, filter, and plan their master's course selections. The app allows students to explore courses across different specializations and build custom 90hp academic profiles for their final 3 semesters.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version (includes TypeScript type checking)
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Testing
No testing framework is currently configured (skipped for rapid development).

### Type Checking
- `npm run build` - Includes TypeScript type checking as part of build process

## Architecture

This is a **Next.js 15** application using the **App Router** with the following key technologies:

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes (App Router pattern in `/app/api/`)
- **Database**: Supabase (Postgres) - for profile sharing functionality
- **Deployment**: Vercel

### Development Strategy
The project follows a **"mock data first"** approach:
- **Phase 1**: Uses local JSON file (`/data/new-real-courses.json`) for course data
- **Phase 2**: Will transition to Supabase database via API routes

### State Management
- **Profile State**: React Context with useReducer pattern in `ProfileContext.tsx`
- **Course Filtering**: Local component state with React hooks
- **Data Persistence**: localStorage for profile data

## Key Files & Structure

```
app/
├── api/              # API routes (App Router pattern) - not yet implemented
├── page.tsx          # Main course catalog with filtering
├── layout.tsx        # Root layout with fonts
└── profile/
    ├── [id]/page.tsx # Shared profile viewing
    └── edit/page.tsx # Profile editing interface

components/
├── course/           # Course discovery & filtering
├── profile/          # Profile builder with Context API
├── shared/           # Navigation and utilities
└── ui/               # shadcn/ui base components

data/
└── new-real-courses.json # Current course dataset

lib/
├── course-utils.ts   # Color coding and display logic
├── profile-utils.ts  # Profile persistence and validation
└── utils.ts          # General utilities

types/
├── course.ts         # Course interface and validation
└── profile.ts        # Profile state and operations
```

## Data Models

### Course Interface
The core data structure in `types/course.ts`:
- Swedish university course with terms 7-9 (master's level)
- Fields: id, name, credits, level, term, period, block, pace, examination, campus, programs
- Level types: 'grundnivå' | 'avancerad nivå' 
- Campus options: 'Linköping' | 'Norrköping' | 'Distans'
- Array fields: term, period, block, examination (multi-value support)

### StudentProfile Interface
Profile management in `types/profile.ts`:
- Courses organized by terms (7, 8, 9) with 90hp target
- Metadata tracking (total_credits, advanced_credits, validation)
- Profile operations: ADD_COURSE, REMOVE_COURSE, CLEAR_TERM, CLEAR_PROFILE

### Current Implementation
- Main page (`app/page.tsx`) loads data from `new-real-courses.json`
- ProfileContext manages state with useReducer pattern
- Real-time filtering with React hooks and useMemo
- Grid/list view toggle with pagination
- Filter panel with multiple criteria and search
- Profile pinboard with localStorage persistence

## Styling & Components

- **Tailwind CSS** with custom configuration
- **shadcn/ui** component library for consistent UI
- **Responsive design** with mobile-first approach
- **Dark/light mode** support via shadcn/ui theming

## Path Aliases
- `@/*` maps to root directory for imports

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Development Notes

- TypeScript is strictly enforced - all components must be typed
- Uses App Router pattern for API routes: `/app/api/[route]/route.ts` (not yet implemented)
- Component props must be explicitly typed
- ProfileContext provides global profile state with localStorage persistence
- Course utilities in `lib/course-utils.ts` handle styling and formatting
- Profile utilities in `lib/profile-utils.ts` handle CRUD operations and validation
- Type guards: `isValidCourse()` and `isValidStudentProfile()` for runtime validation
- Multi-value course fields (term, period, block) support flexible scheduling

## Important Implementation Details

- Profile state persists in localStorage via `ProfileContext`
- Course data loaded directly from JSON (no API yet)
- Filter state managed locally in page components
- Profile validation enforces 90hp total, 60hp advanced minimum
- All course operations go through ProfileContext actions
- Component structure follows atomic design principles