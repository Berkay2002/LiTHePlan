-- ============================================================================
-- PROFILE BUILDER - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Full database setup including course catalog and academic profiles

-- ============================================================================
-- 1. USER MANAGEMENT (Account Info)
-- ============================================================================

-- Clean up existing profiles table
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS website;

-- Make username and email required
ALTER TABLE profiles 
  ALTER COLUMN username SET NOT NULL,
  ALTER COLUMN email SET NOT NULL;

-- Ensure email is also unique (needed for username lookup)
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- ============================================================================
-- 2. COURSE CATALOG (Master Course Data)
-- ============================================================================

-- Create courses table with exact JSON structure from new-real-courses.json
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,                    -- Course code (e.g., "TNK093")
  name TEXT NOT NULL,                     -- Course name
  credits INTEGER NOT NULL,               -- Number of credits
  level TEXT NOT NULL,                    -- "grundnivå" or "avancerad nivå"
  term TEXT[] NOT NULL DEFAULT '{}',      -- Available terms ["7", "8", "9"]
  period TEXT[] NOT NULL DEFAULT '{}',    -- Available periods ["1", "2", "3", "4"]
  block TEXT[] NOT NULL DEFAULT '{}',     -- Block numbers ["1", "2", "3", "4"]
  pace TEXT NOT NULL,                     -- Pace like "50%", "100%"
  examination TEXT[] NOT NULL DEFAULT '{}', -- Examination types ["TEN", "LAB", etc.]
  campus TEXT NOT NULL,                   -- Campus location
  programs TEXT[] NOT NULL DEFAULT '{}',  -- Associated programs
  notes TEXT DEFAULT '',                  -- Additional notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast filtering (matches your current filter system)
CREATE INDEX IF NOT EXISTS courses_level_idx ON courses(level);
CREATE INDEX IF NOT EXISTS courses_campus_idx ON courses(campus);
CREATE INDEX IF NOT EXISTS courses_credits_idx ON courses(credits);
CREATE INDEX IF NOT EXISTS courses_term_idx ON courses USING GIN(term);
CREATE INDEX IF NOT EXISTS courses_period_idx ON courses USING GIN(period);
CREATE INDEX IF NOT EXISTS courses_block_idx ON courses USING GIN(block);
CREATE INDEX IF NOT EXISTS courses_programs_idx ON courses USING GIN(programs);
CREATE INDEX IF NOT EXISTS courses_examination_idx ON courses USING GIN(examination);

-- Full text search index for course names and IDs
CREATE INDEX IF NOT EXISTS courses_search_idx ON courses USING GIN(
  to_tsvector('english', id || ' ' || name)
);

-- ============================================================================
-- 3. ACADEMIC PROFILES (User Course Selections)
-- ============================================================================

-- Create academic_profiles table for user course plans
CREATE TABLE IF NOT EXISTS academic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,                     -- Plan name ("My CS Plan", "Fall 2024")
  profile_data JSONB NOT NULL,            -- Complete course selection data
  is_public BOOLEAN DEFAULT true,         -- Sharing permissions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraints
  CONSTRAINT profile_name_length CHECK (char_length(name) >= 1),
  CONSTRAINT profile_data_not_empty CHECK (profile_data != 'null'::jsonb AND profile_data != '{}'::jsonb)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS academic_profiles_user_id_idx ON academic_profiles(user_id);
CREATE INDEX IF NOT EXISTS academic_profiles_public_idx ON academic_profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS academic_profiles_created_at_idx ON academic_profiles(created_at DESC);

-- Enable Row Level Security for academic profiles
ALTER TABLE academic_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for academic profiles
DROP POLICY IF EXISTS "Public academic profiles are viewable by everyone" ON academic_profiles;
CREATE POLICY "Public academic profiles are viewable by everyone" 
  ON academic_profiles FOR SELECT 
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own academic profiles" ON academic_profiles;
CREATE POLICY "Users can view own academic profiles" 
  ON academic_profiles FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own academic profiles" ON academic_profiles;
CREATE POLICY "Users can create own academic profiles" 
  ON academic_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own academic profiles" ON academic_profiles;
CREATE POLICY "Users can update own academic profiles" 
  ON academic_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own academic profiles" ON academic_profiles;
CREATE POLICY "Users can delete own academic profiles" 
  ON academic_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to get email from username for login
CREATE OR REPLACE FUNCTION public.get_email_from_username(input_username text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT email 
  FROM public.profiles 
  WHERE username = input_username
  LIMIT 1;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_email_from_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_from_username(text) TO anon;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academic_profiles_updated_at ON academic_profiles;
CREATE TRIGGER update_academic_profiles_updated_at 
  BEFORE UPDATE ON academic_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enhanced function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle case where username already exists by appending user ID
    INSERT INTO public.profiles (id, email, username, avatar_url)
    VALUES (
      new.id, 
      new.email,
      COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)) || '_' || substr(new.id::text, 1, 8),
      new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 5. COURSE DATA IMPORT HELPER
-- ============================================================================

-- Function to import course data from JSON (will be used via API)
CREATE OR REPLACE FUNCTION import_course_data(course_json jsonb)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO courses (
    id, name, credits, level, term, period, block, pace, 
    examination, campus, programs, notes
  ) VALUES (
    course_json->>'id',
    course_json->>'name',
    (course_json->>'credits')::integer,
    course_json->>'level',
    ARRAY(SELECT jsonb_array_elements_text(course_json->'term')),
    ARRAY(SELECT jsonb_array_elements_text(course_json->'period')),
    ARRAY(SELECT jsonb_array_elements_text(course_json->'block')),
    course_json->>'pace',
    ARRAY(SELECT jsonb_array_elements_text(course_json->'examination')),
    course_json->>'campus',
    ARRAY(SELECT jsonb_array_elements_text(course_json->'programs')),
    COALESCE(course_json->>'notes', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    credits = EXCLUDED.credits,
    level = EXCLUDED.level,
    term = EXCLUDED.term,
    period = EXCLUDED.period,
    block = EXCLUDED.block,
    pace = EXCLUDED.pace,
    examination = EXCLUDED.examination,
    campus = EXCLUDED.campus,
    programs = EXCLUDED.programs,
    notes = EXCLUDED.notes,
    updated_at = NOW();
END;
$$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- After running this SQL:
-- 1. ✅ User profiles table (username, email, avatar)
-- 2. ✅ Courses table (master catalog matching JSON format)
-- 3. ✅ Academic profiles table (user course selections)
-- 4. ✅ All indexes for fast filtering and search
-- 5. ✅ RLS policies for security
-- 6. ✅ Helper functions for import and lookup
-- 7. ✅ Ready for course data import from new-real-courses.json