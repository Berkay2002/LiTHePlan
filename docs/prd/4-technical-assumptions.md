# **4. Technical Assumptions**
*   **Repository Structure:** Monorepo.
*   **Service Architecture:** A single, monolithic Next.js application.
*   **Testing Requirements:** Unit tests for critical logic and component tests.
*   **Data Strategy:**
    *   **Phase 1 (MVP Development):** The application will be developed using a **local mock data file** (`mock-courses.json`). This file will contain a representative sample of course data based on our assumed schema.
    *   **Phase 2 (Post-Data Arrival):** Once the official university dataset is provided, the application's data layer will be switched to fetch data from a Supabase database.
*   **Data Ingestion:** A one-time script will be created to parse the university-provided data file and seed it into Supabase **once the file is available**.

---
