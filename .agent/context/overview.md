# Project Overview

## Description

**LiTHePlan** is a modern web application that empowers Linköping University civil engineering students to discover and plan personalized 90hp master's programs (terms 7-9) by making 339 curated courses across 25+ specializations easily discoverable and plannable.

## Goals

1. Students can discover courses from multiple specializations they weren't aware of
2. Profile creation time reduced from hours (spreadsheets) to minutes
3. Academic requirement violations caught automatically before advisor meetings
4. Students actively share profiles with advisors for consultation

## Target Users

- **Primary**: Civil engineering master's students (terms 7-9) at Linköping University
- **Secondary**: Academic advisors supporting student planning

## Key Terminology

> [!IMPORTANT]
> Swedish academic terms are used throughout and **must NOT be translated**.

| Term                        | Meaning                                            |
| --------------------------- | -------------------------------------------------- |
| `grundnivå`                 | Basic/undergraduate level                          |
| `avancerad nivå`            | Advanced/master's level                            |
| Terms `7`, `8`, `9`         | Master's program semesters (not years)             |
| Blocks `1`-`4`              | Study periods within each term                     |
| `TEN`, `LAB`, `PROJ`, `UPG` | Examination types (exam, lab, project, assignment) |
| `hp`                        | Credits (högskolepoäng)                            |

## Academic Requirements (Hard Constraints)

- **Total Credits**: Exactly 90hp across terms 7, 8, 9
- **Advanced Credits**: Minimum 60hp at "avancerad nivå"
- **No Duplicates**: Same course cannot appear in multiple terms
- **Course Conflicts**: Some courses cannot be taken together (extracted from `notes` field in database)

## Data Source Disclaimer

The course database (339 curated courses) is **manually compiled, NOT officially from Linköping University**. No real-time synchronization exists. Updates require manual database modifications.

## Project Status

- **Phase**: Production-ready MVP
- **Deployment**: Live on Vercel
- **Database**: Supabase with 339 active curated courses (475 total rows including deprecated)
- **Homepage UX**: The main discovery page now uses a dedicated left `home-sidebar` shell for search, filters, and account actions while keeping the existing right `ProfileSidebar`
