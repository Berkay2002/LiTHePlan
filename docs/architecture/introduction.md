# **Introduction**

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
