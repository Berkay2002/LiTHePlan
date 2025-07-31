# **7. Epic 2: Core Application Logic**
*Goal: To build all the interactive features of the application using the mock data source.*

*   ~~**Story 2.1: Implement Filter UI & Logic**~~
    *   ~~**As a** student, **I want** to use a filter panel to narrow down the course list in real-time, **so that** I can find courses that match my needs.~~
    *   ~~**AC:**~~
        ~~1.  A filter panel is displayed with UI elements for all known filter criteria.~~
        ~~2.  Filter options are dynamically generated from the mock data.~~
        ~~3.  Applying filters updates the displayed course list instantly.~~

*   **Story 2.2: Implement Pinboard and "Pin Course" Functionality**
    *   **As a** student, **I want** to add courses to a "My Profile" pinboard, **so that** I can build my study plan.
    *   **AC:**
        1.  A "Pinboard" UI with sections for Term 7, 8, and 9 is displayed.
        2.  Users can add and remove courses from the catalog to their pinboard.
        3.  The pinboard state is managed on the client-side.

*   **Story 2.3: Implement Profile Requirements Check**
    *   **As a** student, **I want** to see if my planned profile meets the 30hp advanced course requirement, **so that** I know my plan is valid.
    *   **AC:**
        1.  A display on the pinboard shows a real-time count of advanced credits.
        2.  The logic correctly identifies advanced courses based on the mock data.
