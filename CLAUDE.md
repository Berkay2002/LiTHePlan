# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Interactive Master's Profile Builder** - a Next.js application for Linköping University civil engineering students to discover, filter, and plan their master's course selections. The app allows students to explore courses across different specializations and build custom 90hp academic profiles for their final 3 semesters.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Testing
No testing framework is currently configured (skipped for rapid development).

## Architecture

This is a **Next.js 15** application using the **App Router** with the following key technologies:

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes (App Router pattern in `/app/api/`)
- **Database**: Supabase (Postgres) - for profile sharing functionality
- **Deployment**: Vercel

### Development Strategy
The project follows a **"mock data first"** approach:
- **Phase 1**: Uses local JSON file (`/data/mock-courses.json`) for course data
- **Phase 2**: Will transition to Supabase database via API routes

## Key Files & Structure

```
app/
├── api/              # API routes (App Router pattern)
├── page.tsx          # Main course catalog page
└── profile/[id]/     # Shared profile pages

components/
├── course/           # Course discovery & filtering components
├── profile/          # Profile builder components
├── shared/           # General-purpose components
└── ui/               # shadcn/ui base components

data/
└── mock-courses.json # Mock course data for development

types/
└── course.ts         # Course interface and validation
```

## Data Models

### Course Interface
The core data structure in `types/course.ts`:
- Swedish university course with terms 7-9 (master's level)
- Fields: id, name, credits, level, term, period, block, pace, examination, campus
- Level types: 'grundnivå' | 'avancerad nivå'
- Campus options: 'Linköping' | 'Norrköping' | 'Distans'

### Current Implementation
- Main page (`app/page.tsx`) loads mock data directly from JSON
- Real-time filtering with React hooks and useMemo
- Course cards display with shadcn/ui components
- Filter panel with multiple criteria (level, term, period, block, pace, campus, examination)

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
- Uses App Router pattern for API routes: `/app/api/[route]/route.ts`
- Component props must be explicitly typed
- Filter state management uses React hooks (no external state library)
- Course utility functions in `lib/course-utils.ts` for color coding and display logic