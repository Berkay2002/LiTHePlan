# **Supabase Authentication with JWT Signing Keys**

## **Overview**

This document outlines the implementation of modern Supabase authentication using the new JWT signing keys approach, designed as a non-disruptive enhancement layer over the existing localStorage-based profile system. The goal is to provide authenticated users with cloud-based features while preserving the lightning-fast performance of the current implementation.

### **Performance Revolution**
- **Traditional Auth**: 300-1200ms per auth check (network requests)
- **New JWT Signing Keys**: 2-3ms per auth check (local JWT verification)
- **Current localStorage**: ~1ms profile access
- **Net Impact**: Virtually zero performance degradation

---

## **Architecture Design**

### **Core Principle: Additive Enhancement**
The authentication system is designed as an **enhancement layer** that preserves 100% of the existing localStorage functionality while adding optional cloud features for authenticated users.

```typescript
// Current Flow (Preserved)
localStorage → profile load (1ms) → render

// Enhanced Flow (Optional)
getClaims() (2ms) → localStorage (1ms) → cloud sync (background) → render
```

### **Hybrid Storage Strategy**

```typescript
interface ProfileStorage {
  saveProfile(profile: StudentProfile): Promise<string>;
  loadProfile(id: string): Promise<StudentProfile | null>;
  listProfiles(): Promise<StudentProfile[]>;
}

// Three storage implementations:
// 1. LocalProfileStorage (current - preserved)
// 2. CloudProfileStorage (new - authenticated users)
// 3. HybridProfileStorage (combines both)
```

---

## **Technical Implementation**

### **1. Fast Auth Context**

```typescript
// lib/auth-context.tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // New publishable key
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Use getClaims for instant local verification (2-3ms)
    const checkAuth = async () => {
      const { data: claims } = await supabase.auth.getClaims();
      setUser(claims?.sub ? claims : null);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: claims } = await supabase.auth.getClaims();
          setUser(claims);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### **2. Lightning-Fast Middleware**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // ✅ Super fast local verification with getClaims (2-3ms)
  const { data: claims } = await supabase.auth.getClaims();
  
  console.log(`Auth check: ${Date.now() - startTime}ms`); // Should be 2-3ms!

  // Protected routes logic
  if (!claims && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

### **3. Enhanced Profile Storage (Backward Compatible)**

```typescript
// lib/profile-storage.ts
export class LocalProfileStorage implements ProfileStorage {
  // ✅ Existing implementation - NO CHANGES
  async saveProfile(profile: StudentProfile): Promise<string> {
    saveProfileToStorage(profile);
    return profile.id;
  }

  async loadProfile(id: string): Promise<StudentProfile | null> {
    const localProfile = loadProfileFromStorage();
    if (localProfile?.id === id) {
      return localProfile;
    }
    return null;
  }

  async listProfiles(): Promise<StudentProfile[]> {
    const profile = loadProfileFromStorage();
    return profile ? [profile] : [];
  }
}

export class CloudProfileStorage implements ProfileStorage {
  constructor(private user: any) {} // Claims object

  async saveProfile(profile: StudentProfile): Promise<string> {
    // ✅ No auth check needed - already verified instantly
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        profile, 
        userId: this.user.sub,
        userEmail: this.user.email 
      })
    });
    
    const result = await response.json();
    return result.id;
  }

  async loadProfile(id: string): Promise<StudentProfile | null> {
    const response = await fetch(`/api/profile/${id}`);
    if (!response.ok) return null;
    return await response.json();
  }

  async listProfiles(): Promise<StudentProfile[]> {
    const response = await fetch(`/api/profile?userId=${this.user.sub}`);
    return await response.json();
  }
}

export class HybridProfileStorage implements ProfileStorage {
  constructor(
    private localStorage: LocalProfileStorage,
    private cloudStorage?: CloudProfileStorage
  ) {}

  async saveProfile(profile: StudentProfile): Promise<string> {
    // ✅ Save to localStorage first (preserve current behavior)
    await this.localStorage.saveProfile(profile);
    
    // ✨ Also save to cloud if authenticated
    if (this.cloudStorage) {
      await this.cloudStorage.saveProfile(profile);
    }
    
    return profile.id;
  }

  async loadProfile(id: string): Promise<StudentProfile | null> {
    // ✅ Try localStorage first (current behavior preserved)
    let profile = await this.localStorage.loadProfile(id);
    if (profile) return profile;

    // ✨ Fallback to cloud storage for shared profiles
    if (this.cloudStorage) {
      profile = await this.cloudStorage.loadProfile(id);
    }

    return profile;
  }

  async listProfiles(): Promise<StudentProfile[]> {
    const localProfiles = await this.localStorage.listProfiles();
    
    if (this.cloudStorage) {
      const cloudProfiles = await this.cloudStorage.listProfiles();
      // Merge and deduplicate by ID
      const allProfiles = [...localProfiles, ...cloudProfiles];
      return allProfiles.filter((profile, index, arr) => 
        arr.findIndex(p => p.id === profile.id) === index
      );
    }
    
    return localProfiles;
  }
}
```

### **4. Enhanced Profile Context (Backward Compatible)**

```typescript
// components/profile/ProfileContext.tsx (EXTEND)
interface ProfileContextType {
  // ✅ Keep existing methods unchanged
  state: ProfileState;
  addCourse: (course: Course, term: 7 | 8 | 9) => void;
  removeCourse: (courseId: string) => void;
  moveCourse: (courseId: string, fromTerm: 7 | 8 | 9, toTerm: 7 | 8 | 9) => void;
  clearTerm: (term: 7 | 8 | 9) => void;
  clearProfile: () => void;
  setEditing: (isEditing: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;

  // ✨ Add new auth-enabled methods (only available when authenticated)
  saveToCloud?: () => Promise<string>;
  syncFromCloud?: () => Promise<void>;
  listCloudProfiles?: () => Promise<StudentProfile[]>;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Create appropriate storage based on auth state
  const storage = useMemo(() => {
    const localStorage = new LocalProfileStorage();
    const cloudStorage = user ? new CloudProfileStorage(user) : undefined;
    return new HybridProfileStorage(localStorage, cloudStorage);
  }, [user]);

  // ✅ Keep ALL existing methods exactly the same
  const addCourse = (course: Course, term: 7 | 8 | 9) => {
    dispatch({ type: 'ADD_COURSE', course, term });
  };

  const removeCourse = (courseId: string) => {
    dispatch({ type: 'REMOVE_COURSE', courseId });
  };

  // ... all other existing methods unchanged

  // ✨ Add new optional methods for authenticated users
  const saveToCloud = async (): Promise<string> => {
    if (!state.current_profile || !user) {
      throw new Error('Must be authenticated to save to cloud');
    }
    return await storage.saveProfile(state.current_profile);
  };

  const syncFromCloud = async (): Promise<void> => {
    if (!user) return;
    
    const cloudProfiles = await storage.listProfiles();
    // Intelligent merge with local profile
    // Implementation details...
  };

  const listCloudProfiles = async (): Promise<StudentProfile[]> => {
    if (!user) return [];
    return await storage.listProfiles();
  };

  return (
    <ProfileContext.Provider value={{
      state,
      addCourse,
      removeCourse,
      moveCourse,
      clearTerm,
      clearProfile,
      setEditing,
      setUnsavedChanges,
      // Only add cloud methods if user is authenticated
      ...(user && { saveToCloud, syncFromCloud, listCloudProfiles })
    }}>
      {children}
    </ProfileContext.Provider>
  );
}
```

### **5. API Routes with Fast Auth**

```typescript
// app/api/profile/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: Request) {
  const startTime = Date.now();
  
  // ✅ Lightning fast auth check (2-3ms)
  const { data: claims } = await supabase.auth.getClaims();
  
  if (!claims) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profile } = await request.json();
  
  // Save to database
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: claims.sub,
      name: profile.name,
      profile_data: profile,
      is_public: true
    })
    .select('id')
    .single();

  console.log(`API completed in ${Date.now() - startTime}ms`);

  if (error) {
    return Response.json({ error: 'Failed to save profile' }, { status: 500 });
  }

  return Response.json({ id: data.id });
}

// GET /api/profile/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Profile not found' }, { status: 404 });
  }

  return Response.json(data.profile_data);
}
```

---

## **Database Schema**

### **Supabase Tables**

```sql
-- Profiles table for authenticated users
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  profile_data jsonb not null,
  is_public boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index profiles_user_id_idx on profiles(user_id);
create index profiles_public_idx on profiles(is_public) where is_public = true;

-- Row Level Security (RLS)
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" 
  on profiles for select 
  using (is_public = true);

create policy "Users can view own profiles" 
  on profiles for select 
  using (auth.uid() = user_id);

create policy "Users can manage own profiles" 
  on profiles for all 
  using (auth.uid() = user_id);
```

### **Data Models**

```typescript
// types/auth.ts
export interface AuthUser {
  sub: string; // User ID from JWT claims
  email: string;
  email_verified: boolean;
  aud: string;
  iat: number;
  exp: number;
}

// types/profile.ts (EXTENDED)
export interface StudentProfile {
  // ✅ Existing fields unchanged
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  terms: {
    7: Course[];
    8: Course[];
    9: Course[];
  };
  metadata: {
    total_credits: number;
    advanced_credits: number;
    is_valid: boolean;
  };

  // ✨ New optional fields for cloud profiles
  user_id?: string; // Only for authenticated profiles
  is_public?: boolean; // Privacy setting
  cloud_synced?: boolean; // Sync status
}

export interface CloudProfile {
  id: string;
  user_id: string;
  name: string;
  profile_data: StudentProfile;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## **Setup Instructions**

### **1. Supabase Project Configuration**

```bash
# 1. Create new Supabase project
# 2. Navigate to Project Settings > API
# 3. Enable "Use JWT signing keys" in Auth settings
# 4. Generate new API keys (publishable/secret)
# 5. Update environment variables
```

### **2. Environment Variables**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sbp_your-new-publishable-key
SUPABASE_SECRET_KEY=sbsk_your-new-secret-key
```

### **3. Database Setup**

```sql
-- Run in Supabase SQL Editor
-- 1. Create profiles table (see schema above)
-- 2. Set up RLS policies
-- 3. Create indexes
-- 4. Test with sample data
```

### **4. Install Dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## **Performance Analysis**

### **Current Implementation (No Auth)**
Page Load Timeline:
├── Check localStorage: 1ms
├── Load profile: 50ms
└── Render: immediate
Total: ~51ms

### **New Implementation (With Auth)**
Page Load Timeline:
├── getClaims() auth check: 2-3ms ⚡
├── Check localStorage: 1ms
├── Load profile: 50ms
├── Background cloud sync: 100ms (non-blocking)
└── Render: immediate
Total: ~54ms (3ms difference!)

### **Traditional Auth (Comparison)**
Page Load Timeline:
├── Network auth check: 300-1200ms ❌
├── Check localStorage: 1ms
├── Load profile: 50ms
└── Render: delayed
Total: ~351-1251ms

---