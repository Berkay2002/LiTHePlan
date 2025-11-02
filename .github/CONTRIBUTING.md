## Contributing to LiTHePlan

Thank you for your interest in improving LiTHePlan. This project helps Linköping University civil engineering students plan 90hp study paths, so quality and clarity matter. The guidelines below explain how to prepare changes, open issues, and collaborate with the maintainers.

### Before You Start
- Review the README and the Memory Bank (`memory-bank/`) to understand the vision, active context, and open tasks.
- Search the issue tracker to check whether your idea or bug has already been reported.
- For substantial work, coordinate with the maintainers through an issue before investing significant time.

### Development Environment
1. Install Node.js 20.19 or newer and npm 9 or newer.
2. Clone the repository and install dependencies:
   ```powershell
   git clone https://github.com/Berkay2002/LiTHePlan.git
   cd LiTHePlan
   npm install
   ```
3. Copy `.env.example` (or create `.env.local`) and supply Supabase, Sentry, and Upstash credentials.
4. Start the development server with `npm run dev` (defaults to http://localhost:3000).
5. Run the type checker in watch mode with `npx tsc --watch --noEmit` when making iterative changes.

### Coding Standards
- This project uses Next.js 16 (App Router), React 19.2, TypeScript 5, Tailwind CSS v4, and shadcn/ui.
- Follow strict TypeScript patterns (`unknown` + guards instead of `any`, `import type` for type-only imports).
- Place new components alongside related features (e.g., `components/course/`, `components/profile/`).
- Preserve Swedish academic terminology (e.g., `avancerad nivå`, `grundnivå`, `huvudomrade`).
- Do not mutate profile state directly; use the reducer actions exposed by `ProfileContext`.

### Required Checks
Before opening a pull request:
- `npm run lint`
- `npm run build`
- Execute relevant Playwright tests (`npm run test` or focused `npx playwright test path/to/spec.ts`).
- Manually verify critical flows if they are affected (course filtering, profile mutations, conflict detection, authentication, mobile layout).

### Memory Bank Workflow
For every substantial task:
1. Create a new task file in `memory-bank/tasks/` using the documented template.
2. Update `memory-bank/tasks/_index.md` when the task status changes.
3. Adjust `memory-bank/activeContext.md` and `memory-bank/progress.md` when work shifts the current focus or completion state.

### Commit and Branch Strategy
- Use descriptive branches such as `feat/course-search-analytics` or `fix/profile-conflict-modal`.
- Follow Conventional Commits (e.g., `feat: add course overview component`, `fix: resolve profile duplication bug`).
- Keep commits focused; avoid bundling unrelated changes.

### Opening an Issue
When filing an issue, use the provided templates:
- **Bug report**: Include reproduction steps, expected vs. actual behavior, environment details, and relevant logs.
- **Feature request**: Describe the problem, the desired capability, possible alternatives, and context.

### Pull Request Expectations
- Describe the motivation and implementation at the top of the PR.
- Reference related issues or task IDs (from the Memory Bank) where applicable.
- Confirm the required checks have passed and paste or summarize test output if relevant.
- Add screenshots or screen recordings when the UI changes materially.
- Update documentation, Memory Bank files, or tests alongside the code whenever behavior changes.
- Keep the conversation respectful and respond promptly to review feedback.

Following these guidelines keeps LiTHePlan maintainable and trustworthy for students and advisors who rely on it. We appreciate every contribution that helps improve the planning experience.
