# **Project Brief: Interactive Master's Profile Builder**

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

### **Technical Considerations**
#### **Platform Requirements**
*   **Target Platforms:** Web (Desktop, Tablet, Mobile). The application must be fully responsive.
*   **Browser/OS Support:** The latest stable versions of major browsers (Chrome, Firefox, Safari, Edge).
*   **Performance Requirements:** Fast initial page loads (LCP < 2.5s) and instant, lag-free filtering.

#### **Technology Preferences**
*   **Frontend:** **Next.js / React** with **TypeScript**.
*   **UI Components:** **shadcn/ui** will be used for building the user interface, leveraging its accessible and composable components.
*   **Styling:** **Tailwind CSS** will be used for all styling, as it integrates seamlessly with shadcn/ui.
*   **Backend:** Backend logic will be handled by **Next.js API Routes**.
*   **Database:** **Supabase** will be used for any database needs, such as storing data for shared profiles.
*   **Hosting/Infrastructure:** **Vercel** is the recommended platform for its first-class Next.js support.

#### **Architecture Considerations**
*   **Repository Structure:** A **Monorepo** containing the single Next.js application.
*   **Service Architecture:** A monolithic Next.js app with serverless functions (API Routes) for backend tasks.
*   **Integration Requirements:** The primary integration is with the university-provided course dataset. The format of this data needs to be confirmed (e.g., JSON, CSV, API).
*   **Security/Compliance:** Shared profile URLs should be unguessable. No personal user data will be stored in the MVP.

### **Constraints & Assumptions**
#### **Constraints**
*   **Budget:** This project is assumed to be developed with minimal to no budget, relying on free or low-cost tiers for services like Vercel and Supabase.
*   **Timeline:** To be determined, but the MVP scope is designed to be achievable within a typical university semester project timeframe.
*   **Resources:** The project will be developed by a small team.
*   **Technical:** The application is entirely dependent on the quality, accuracy, and timely provision of the course dataset from Linköping University. The application cannot function without this data.

#### **Key Assumptions**
*   **Data Availability:** We assume that a comprehensive and structured course dataset for the relevant master's programs will be provided by the university.
*   **Data Structure:** We assume the provided data will contain all necessary fields for filtering (term, block, pace, etc.) and for the "Profile Requirements Check" (course level, credits).
*   **Student Eligibility:** We assume that users of the tool have already met the requirements for the first 180 hp of their program and are eligible to plan their final 90 hp.
*   **Advisory Role:** We assume that academic advisors will remain the final authority on graduation requirements and that this tool is a planning aid, not a replacement for official academic advising.
*   **User Interest:** We assume there is a genuine need and interest from students for a tool of this nature.

### **Risks & Open Questions**
#### **Key Risks**
*   **Initial Data Quality Risk:** (High Impact) The project's success hinges on the initial provision of a clean, structured, and complete course dataset. The format is currently unknown, and an unstructured or incomplete file would require significant upfront data cleaning efforts.
*   **Adoption Risk:** (Medium Impact) There is a risk that students may not discover or adopt the tool.
*   **Scope Creep Risk:** (Medium Impact) The potential for future features is high. There is a risk of adding complexity to the MVP, which could delay its launch.

#### **Open Questions**
*   **What is the exact format and schema of the initial course dataset?** (e.g., JSON, CSV, Excel). This is the most critical unknown.
*   While data updates are rare, what is the process for receiving a new data file if one is released in the future?
*   Are there any university branding guidelines or usage policies we must adhere to?

#### **Areas Needing Further Research**
*   The optimal strategy for parsing the (currently unknown format of the) university's course data and seeding it into Supabase for fast and efficient filtering.
*   The most secure and robust method for implementing the "share via URL" feature.