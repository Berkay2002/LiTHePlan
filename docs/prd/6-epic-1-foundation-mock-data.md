# **6. Epic 1: Foundation & Mock Data**
*Goal: To create a functional Next.js application that can read from a local mock data file and display the courses in the UI.*

*   **Story 1.1: Initial Project Scaffolding**
    *   **As a** developer, **I want** to set up a new Next.js project with TypeScript, Tailwind CSS, and shadcn/ui, **so that** I have a clean, standardized foundation.
    *   **AC:** A new Next.js project is created and configured with the specified technologies.

*   **Story 1.2: Define and Create Mock Course Data**
    *   **As a** developer, **I want** to define a `Course` interface in TypeScript and create a `mock-courses.json` file, **so that** we have a stable, predictable data source for development.
    *   **AC:**
        1.  A `types/course.ts` file is created with a `Course` interface containing all known fields (code, name, hp, level, term, block, etc.).
        2.  A `data/mock-courses.json` file is created with 15-20 sample course objects that conform to the `Course` interface.

*   **Story 1.3: Display Mock Course Catalog**
    *   **As a** student, **I want** to see a list of all available master's courses from the mock data file, **so that** I can begin exploring the UI.
    *   **AC:**
        1.  The main page directly imports and reads the `mock-courses.json` file.
        2.  A grid or list of "Course Cards" is displayed, populated with the mock data.
        3.  Each Course Card shows key information from the mock data.
