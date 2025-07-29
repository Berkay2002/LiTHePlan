# **Interactive Master's Profile Builder Fullstack Architecture Document (Corrected)**

## **Introduction**

This document outlines the complete fullstack architecture for the "Interactive Master's Profile Builder." It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This architecture is designed to directly support the requirements outlined in the PRD, with a primary focus on the **"mock data first" strategy**. The initial development will be against a local mock data file, with the final transition to the live Supabase database planned as a seamless switch.

#### **Starter Template or Existing Project**
This project will be initialized using the official Next.js `with-supabase` example template.

**Command:** `npx create-next-app -e with-supabase`

This template provides a production-ready foundation with the Supabase client pre-configured, environment variables set up, and best practices for data fetching and mutations already established. The architecture defined in this document will build upon and extend the patterns provided by this starter.

#### **Change Log**
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| July 29, 2025 | 1.1 | Corrected project structure to use App Router for API routes. | Winston (Architect) |

---

## **High-Level Architecture**

#### **Technical Summary**
The application will be a modern, serverless full-stack application built with Next.js and deployed on Vercel. The backend will be handled by Next.js Route Handlers (API Routes) within the App Router, which will interact with a Supabase Postgres database for data persistence related to the profile sharing feature. The frontend will be a highly interactive, responsive single-page interface built with React, TypeScript, and the shadcn/ui component library. The initial development phase will use a local mock JSON file to simulate the course data, ensuring the entire application can be built and tested before the final university dataset is integrated.

#### **Platform and Infrastructure Choice**
*   **Platform:** Vercel.
*   **Key Services:** Vercel, Supabase.
*   **Deployment Host and Regions:** Vercel's global edge network.

#### **Repository Structure**
*   **Structure:** Monorepo.

#### **High-Level Architecture Diagram**
```mermaid
graph TD
    subgraph User
        A[Student's Browser]
    end

    subgraph Vercel Platform
        B[Next.js Frontend] -- Fetches --> C{Data Source}
        C -- Phase 1 --> D[Local Mock Data</br>(/data/mock-courses.json)]
        C -- Phase 2 --> E[Route Handler</br>(/app/api/courses)]
        E -- Fetches --> F[Supabase DB]
        B -- Shares Profile --> G[Route Handler</br>(/app/api/share)]
        G -- Writes to --> F
    end

    subgraph Supabase Platform
        F[(Postgres DB)]
    end

    A --> B
```

#### **Architectural Patterns**
*   **Component-Based UI:** Reusable React components via shadcn/ui.
*   **Serverless Functions:** Backend logic encapsulated in Next.js Route Handlers.
*   **Static First (for Mock Data):** Initial development will import data from a local JSON file.
*   **API-Driven (for Live Data):** The final application will fetch data from API routes.

---

## **Tech Stack**

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | Next.js | 14+ | Full-stack React framework | Industry standard, excellent performance, Vercel synergy. |
| **Language** | TypeScript | 5+ | Superset of JavaScript | Provides type safety, crucial for maintainability. |
| **UI Library** | React | 18+ | Frontend library | Core of Next.js, component-based architecture. |
| **UI Components** | shadcn/ui | Latest | Composable component library | Modern, accessible, and highly customizable. |
| **Styling** | Tailwind CSS | 3+ | Utility-first CSS framework | Integrates perfectly with shadcn/ui, rapid development. |
| **Database** | Supabase (Postgres) | Latest | Backend-as-a-Service | Provides a robust Postgres DB and easy-to-use client. |
| **DB Client** | @supabase/supabase-js | 2+ | Supabase JS client | Official library for interacting with Supabase. |
| **Deployment** | Vercel | N/A | Hosting Platform | The premier platform for deploying Next.js applications. |
| **Testing** | None | N/A | No testing framework | Skipped for rapid development. |

---

## **Data Models**

#### **Course (Mock Data & Final Schema)**
```typescript
// types/course.ts
export interface Course {
  id: string; // Unique identifier, e.g., course code 'TQXX33'
  name: string;
  credits: number; // e.g., 30
  level: 'grundnivå' | 'avancerad nivå';
  term: 7 | 8 | 9;
  period: 1 | 2;
  block: 1 | 2 | 3 | 4;
  pace: '100%' | '50%';
  examination: string[]; // e.g., ['TEN', 'LAB']
  campus: 'Linköping' | 'Norrköping' | 'Distans';
}
```

#### **SharedProfile (Supabase Table)**
*   **Table Name:** `shared_profiles`
*   **Columns:** `id` (text), `created_at` (timestamptz), `course_ids` (text[])

---

## **API Specification**

*   `GET /api/courses`: Fetches all courses.
*   `POST /api/share`: Creates a new shared profile.
*   `GET /api/profile/[id]`: Retrieves a shared profile.

---

## **Frontend Architecture**

#### **Component Architecture**
*   `/components/ui`: Raw shadcn/ui components.
*   `/components/shared`: General-purpose components.
*   `/components/course`: Course discovery components.
*   `/components/profile`: Profile builder components.

#### **State Management**
*   React `useState` and `useContext` hooks will be used for managing UI state.

#### **Routing**
*   `/`: Main application page.
*   `/profile/[id]`: Dynamic route for shared profiles.

---

## **Unified Project Structure (Corrected)**

```
/
├── app/
│   ├── api/
│   │   ├── courses/
│   │   │   └── route.ts        # Handles GET /api/courses
│   │   ├── share/
│   │   │   └── route.ts        # Handles POST /api/share
│   │   └── profile/
│   │       └── [id]/
│   │           └── route.ts    # Handles GET /api/profile/[id]
│   ├── page.tsx                # Main application page UI
│   └── profile/
│       └── [id]/
│           └── page.tsx        # Shared profile page UI
├── components/
│   ├── ui/
│   ├── shared/
│   ├── course/
│   └── profile/
├── data/
│   └── mock-courses.json       # Mock data for Phase 1 development
├── lib/
│   └── supabase.ts             # Supabase client configuration
├── styles/
│   └── globals.css
├── types/
│   └── course.ts               # TypeScript interface for Course
├── .env.local                  # Environment variables
├── next.config.js
└── tsconfig.json
```

---

## **Development Workflow**

#### **Local Development**
1.  `npm install`
2.  Set up `.env.local` with Supabase keys.
3.  `npm run dev`

#### **Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## **Deployment Architecture**
*   **Strategy:** Continuous Deployment via Vercel from the `main` branch.
*   **Configuration:** Supabase environment variables must be configured in Vercel project settings.

---

## **Testing Strategy**
*   **Testing:** Skipped for rapid development.
*   **Focus:** Manual testing and validation during development.

---

## **Coding Standards**
*   **Linting:** Default Next.js ESLint configuration.
*   **Type Safety:** All new code must be strongly typed using TypeScript.
*   **Component Props:** All component props must be explicitly typed.

---

## **Checklist Results Report**
*This section will be populated after this architecture is validated against the `architect-checklist`.*

## **Next Steps**
This corrected architecture is now ready for the development agent. Development will proceed with **Epic 1: Foundation & Mock Data**, starting with **Story 1.1: Initial Project Scaffolding**.
