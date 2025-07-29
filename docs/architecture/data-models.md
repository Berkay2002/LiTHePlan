# **Data Models**

#### **Course (Mock Data & Final Schema)**
```typescript
// types/course.ts
export interface Course {
  id: string; // Unique identifier, e.g., course code 'TQXX33'
  name: string;
  credits: number; // e.g., 30
  level: 'grundnivå' | 'avancerad nivå';
  term: 7 | 8 | 9;
  period: 1 | 2;
  block: 1 | 2 | 3 | 4;
  pace: '100%' | '50%';
  examination: string[]; // e.g., ['TEN', 'LAB']
  campus: 'Linköping' | 'Norrköping' | 'Distans';
}
```

#### **SharedProfile (Supabase Table)**
*   **Table Name:** `shared_profiles`
*   **Columns:** `id` (text), `created_at` (timestamptz), `course_ids` (text[])

---
