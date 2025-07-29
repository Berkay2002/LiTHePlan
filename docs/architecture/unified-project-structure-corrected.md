# **Unified Project Structure**

```
/
├── app/
│   ├── api/
│   │   ├── courses/
│   │   │   └── route.ts        # Handles GET /api/courses
│   │   ├── share/
│   │   │   └── route.ts        # Handles POST /api/share
│   │   └── profile/
│   │       └── [id]/
│   │           └── route.ts    # Handles GET /api/profile/[id]
│   ├── page.tsx                # Main application page UI
│   └── profile/
│       └── [id]/
│           └── page.tsx        # Shared profile page UI
├── components/
│   ├── ui/
│   ├── shared/
│   ├── course/
│   └── profile/
├── data/
│   └── mock-courses.json       # Mock data for Phase 1 development
├── lib/
│   └── supabase.ts             # Supabase client configuration
├── styles/
│   └── globals.css
├── types/
│   └── course.ts               # TypeScript interface for Course
├── .env.local                  # Environment variables
├── next.config.js
└── tsconfig.json
```

---

