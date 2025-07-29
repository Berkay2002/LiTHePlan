# **High-Level Architecture**

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
