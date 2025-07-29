# **2. Requirements**

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
