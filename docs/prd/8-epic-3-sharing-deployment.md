# **8. Epic 3: Sharing & Deployment**
*Goal: To build the UI for the sharing feature and deploy a functional version of the application running on mock data.*

*   **Story 3.1: Build Share Profile UI & Mocked Interaction**
    *   **As a** student, **I want** to click a "Share" button and receive a fake shareable link, **so that** the complete user flow can be tested.
    *   **AC:**
        1.  A "Share" button is present on the Pinboard.
        2.  Clicking it displays a sample URL (e.g., `app.url/profile/mock-id`) and a "Copy" button.
        3.  This process will **not** call an API or save to a database in this story. It is a UI-only implementation.

*   **Story 3.2: Production Deployment with Mock Data**
    *   **As a** developer, **I want** to deploy the application to Vercel, **so that** stakeholders can test and review the full functionality using the mock data.
    *   **AC:**
        1.  The project is successfully deployed to Vercel.
        2.  The live application is fully functional and operates using the `mock-courses.json` file.
