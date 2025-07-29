# **Interactive Master's Profile Builder Product Requirements Document (PRD) - V2 (Mock-Data First Strategy)**

## **1. Goals and Background Context**

### **Executive Summary**
This project proposes the development of the "Interactive Master's Profile Builder," a web-based application for civil engineering students at Linköping University. The tool aims to solve the problem of students being unaware of the flexibility within their master's programs by providing a platform to discover, combine, and visualize courses from different specializations. By leveraging a direct and accurate dataset from the university, the application will empower students to create unique, customized academic profiles that align with their career goals, ultimately enhancing student satisfaction and engagement.

### **Problem Statement**
Civil engineering master's students at Linköping University face a significant information gap when planning their studies. The university offers a flexible curriculum that allows for combining courses across different specializations, enabling students to build unique, career-focused profiles. However, the current system for discovering these opportunities is fragmented and difficult to navigate.

The primary pain points are:
*   **Lack of a Centralized Tool:** Course information is spread across various university portals and documents, making it difficult to get a holistic view of all available options.
*   **Poor Discoverability:** Without a user-friendly interface to filter and compare courses, students often default to standard specialization tracks, unaware of valuable cross-disciplinary combinations.
*   **Missed Opportunities:** This lack of awareness leads to students missing the chance to tailor their education to specific, modern engineering roles, potentially limiting their career prospects and diminishing the value of their master's degree.
*   **Inefficient Planning:** The manual process of planning a custom profile is time-consuming and prone to errors, discouraging students from exploring options beyond the default path.

The urgency lies in empowering students to take full control of their education. Solving this problem will not only increase student satisfaction but also enhance the reputation of Linköping University's engineering programs by producing graduates with highly specialized and relevant skill sets.

### **Goals & Success Metrics**
#### **Business Objectives**
*   **Increase Awareness:** Make students fully aware of the academic flexibility and cross-specialization opportunities available at Linköping University.
*   **Empower Students:** Provide a tool that empowers students to make informed, personalized decisions about their education.
*   **Enhance Program Value:** Increase the perceived and actual value of the master's programs by facilitating the creation of unique, career-focused skill sets.
*   **Improve Student Satisfaction:** Boost overall student satisfaction by removing a significant point of friction and frustration in academic planning.

#### **User Success Metrics**
*   A student successfully discovers and combines courses from at least two different specializations into a viable study plan.
*   A student feels more confident and knowledgeable about their academic options after using the tool.
*   A student uses the export/share feature to facilitate a discussion with an academic advisor.
*   The time required for a student to create a full master's plan is significantly reduced compared to manual methods.

#### **Key Performance Indicators (KPIs)**
*   **Adoption Rate:** Percentage of first-year civil engineering master's students who create an account and build a profile within the first semester.
*   **Profile Diversity:** The average number of courses per profile that are outside the student's primary specialization.
*   **Task Completion Rate:** Percentage of users who start building a profile and successfully save or export it.
*   **User Satisfaction (NPS/CSAT):** A direct survey metric to gauge how helpful and effective students find the tool.

## **2. Requirements**

### **MVP Scope**
#### **Core Features (Must-Have for MVP)**
*   **Master's Course Discovery:** The ability to view and filter the course catalog relevant to the final 90 hp of the master's program (semesters 7, 8, 9). Filters will include term, study block, period, pace, etc.
*   **Custom 90hp Profile Builder (Pinboard):** A feature allowing users to select and arrange courses into a 3-semester plan, visualizing their final 1.5 years of study.
*   **Profile Requirements Check:**
    *   **Description:** A feature that analyzes the 90 hp profile being built on the pinboard. It will verify that the plan includes at least **30 hp of advanced level courses** within the main field of study, providing real-time feedback to the user.
    *   **Rationale:** This provides immediate validation that the student's custom plan meets a key requirement for their Master's Thesis, adding significant value and planning confidence.
*   **Data-Driven Interface:** All filter options and course data are dynamically generated from the university's dataset.
*   **Export/Share Functionality:** A simple mechanism to export the created 90 hp profile to a shareable format.

#### **Out of Scope for MVP (Planned for Future Phases)**
*   **User Accounts & Persistent Storage.**
*   **Verification of Prerequisite 180hp:** The tool will operate on the assumption that the student has already completed the first 180 hp (semesters 1-6) and is eligible to begin their final 90 hp of master's level studies.
*   **Direct Integration with University Systems.**
*   **Course Recommendations/AI Suggestions.**

#### **MVP Success Criteria**
The MVP will be successful if a student can use it to filter the master's course catalog, build a 90 hp profile, use the requirements checker to validate that their plan meets the advanced credit requirements, and export that profile for review.

### **Post-MVP Vision**
#### **Phase 2 Features (Next Priorities)**
*   **User Accounts & Saved Profiles:** Introduce user authentication (e.g., via Supabase/Google) to allow students to save, name, and manage multiple profile drafts over time.
*   **Advanced Profile Validation:** Expand the "Profile Requirements Check" to include more complex rules, such as checking for prerequisite course dependencies within the planned 90hp profile.
*   **Expanded Program Support:** Onboard additional master's programs from other departments at Linköping University, broadening the user base.

#### **Long-term Vision (1-2 Years)**
Our long-term vision is for this tool to become the official, university-endorsed platform for master's level course planning. It would evolve from a standalone tool into an integrated part of the student's academic journey, potentially including features like direct links to course registration pages and integration with academic advising workflows.

#### **Expansion Opportunities**
*   **Alumni Profile Showcase:** Feature profiles of past graduates, showing what course combinations led to specific career paths.
*   **Advisor Dashboard:** A dedicated interface for academic advisors to view and comment on student-shared profiles.
*   **Data Analytics for University:** Provide anonymized data insights to program coordinators about which courses are most popular and what cross-disciplinary combinations students are creating.

## **3. User Interface Design Goals**

### **Proposed Solution**
We propose the "Interactive Master's Profile Builder," a responsive web application designed to transform how Linköping University's civil engineering students plan their master's program. The application will serve as a centralized, dynamic, and highly interactive course discovery and planning tool.

**Core Concept:**
The platform will aggregate all master's level courses from the university-provided dataset into a single, intuitive interface. It moves beyond a static catalog by allowing students to not just view courses, but to actively build, visualize, and refine a custom study plan in real-time.

**Key Differentiators:**
*   **Dynamic Filtering:** A powerful filtering system will allow students to explore the entire course catalog based on multiple criteria (term, block, pace, campus, etc.), revealing combinations they were previously unaware of.
*   **Visual "Pinboard" Builder:** The core of the experience is a "pinboard" or timeline feature where students can select and arrange courses. This provides a clear, visual representation of their custom master's profile, making it easy to see how their choices fit together over time.
*   **Data-Driven Accuracy:** By using a direct data feed from the university, the tool ensures all information is accurate and up-to-date, providing a reliable foundation for academic planning.
*   **Export and Collaboration:** Students can easily export or share their created profiles, facilitating productive conversations with academic advisors, mentors, and peers to validate their choices.

This solution will succeed by directly addressing the current system's shortcomings—poor discoverability and fragmented information—with a single, user-centric platform that prioritizes flexibility and informed decision-making.

### **Target Users**
#### **Primary User Segment: Civil Engineering Master's Students**
*   **Profile:** Students currently enrolled in or about to begin a Master's program in Civil Engineering at Linköping University. They are typically tech-savvy, goal-oriented, and looking to maximize the value of their education.
*   **Current Behaviors & Workflows:** They currently rely on navigating multiple, often confusing, university websites, PDF course catalogs, and word-of-mouth recommendations. Planning is a manual, frustrating process involving spreadsheets or pen and paper to track potential course loads and schedules.
*   **Specific Needs & Pain Points:**
    *   A single, reliable source of truth for all available courses.
    *   An intuitive way to filter and sort courses by various academic criteria.
    *   The ability to visualize how different course choices fit together over the duration of their master's program.
    *   Confidence that their custom-built plan is viable and meets program requirements.
*   **Goals:** To discover interesting courses they were previously unaware of, build a personalized and optimized study plan that aligns with their specific career ambitions, and to feel empowered and in control of their academic journey.

### **Technical Considerations**
#### **Platform Requirements**
*   **Target Platforms:** Web (Desktop, Tablet, Mobile). The application must be fully responsive.
*   **Browser/OS Support:** The latest stable versions of major browsers (Chrome, Firefox, Safari, Edge).
*   **Performance Requirements:** Fast initial page loads (LCP < 2.5s) and instant, lag-free filtering.

## **4. Technical Assumptions**
*   **Repository Structure:** Monorepo.
*   **Service Architecture:** A single, monolithic Next.js application.
*   **Testing Requirements:** Unit tests for critical logic and component tests.
*   **Data Strategy:**
    *   **Phase 1 (MVP Development):** The application will be developed using a **local mock data file** (`mock-courses.json`). This file will contain a representative sample of course data based on our assumed schema.
    *   **Phase 2 (Post-Data Arrival):** Once the official university dataset is provided, the application's data layer will be switched to fetch data from a Supabase database.
*   **Data Ingestion:** A one-time script will be created to parse the university-provided data file and seed it into Supabase **once the file is available**.

---

## **5. Epic List (Revised for Mock-Data First Strategy)**

*   **Epic 1: Foundation & Mock Data:** Establish the core project, define a mock data structure, and build the UI to display it.
*   **Epic 2: Core Application Logic:** Implement all core interactive features (filtering, pinning, validation) using the mock data.
*   **Epic 3: Sharing & Deployment:** Implement the UI for the sharing feature and deploy the mock-data-driven application.
*   **Epic 4: Real Data Integration (Post-Data Arrival):** This epic is blocked until the university data is provided. It involves swapping the mock data source with the live Supabase database.

---

## **6. Epic 1: Foundation & Mock Data**
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

## **7. Epic 2: Core Application Logic**
*Goal: To build all the interactive features of the application using the mock data source.*

*   **Story 2.1: Implement Filter UI & Logic**
    *   **As a** student, **I want** to use a filter panel to narrow down the course list in real-time, **so that** I can find courses that match my needs.
    *   **AC:**
        1.  A filter panel is displayed with UI elements for all known filter criteria.
        2.  Filter options are dynamically generated from the mock data.
        3.  Applying filters updates the displayed course list instantly.

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

## **8. Epic 3: Sharing & Deployment**
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

## **9. Epic 4: Real Data Integration (BLOCKED)**
*Goal: To connect the application to the live university dataset once it becomes available.*

*   **Story 4.1: Supabase Setup and Data Seeding (BLOCKED)**
    *   **As a** developer, **I want** to connect to Supabase and seed the real course data, **so that** the application can use live data.
    *   **AC:** Blocked until the university data file is provided.

*   **Story 4.2: Create Real Course API Endpoint (BLOCKED)**
    *   **As a** developer, **I want** to create an API route that fetches courses from Supabase, **so that** the app can use live data.
    *   **AC:** Blocked until Story 4.1 is complete.

*   **Story 4.3: Swap Data Source in UI (BLOCKED)**
    *   **As a** developer, **I want** to switch the UI's data source from the mock file to the live API endpoint, **so that** the application is using real data.
    *   **AC:** Blocked until Story 4.2 is complete.

*   **Story 4.4: Implement Real Share Functionality (BLOCKED)**
    *   **As a** developer, **I want** to implement the backend logic for the "Share" button to save profiles to Supabase, **so that** the sharing feature is fully functional.
    *   **AC:** Blocked until Story 4.1 is complete.