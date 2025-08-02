-- ============================================================================
-- PROFILE BUILDER - COURSE CATALOG ADDITION
-- ============================================================================
-- This adds the courses table and import functionality to your existing database
-- Run this AFTER database-setup.sql and database-schema-update-final.sql

-- ============================================================================
-- 1. COURSE CATALOG (Master Course Data)
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
-- 2. COURSE DATA IMPORT HELPER
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
-- 3. UPDATE TRIGGER FOR COURSES
-- ============================================================================

-- Add trigger for courses updated_at (reusing existing function)
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

-- Verify courses table was created
SELECT 
  table_name, 
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'courses';

-- Verify indexes were created
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'courses' 
  AND schemaname = 'public'
ORDER BY indexname;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- After running this SQL:
-- 1. ✅ Courses table created with proper structure
-- 2. ✅ All indexes for fast filtering and search
-- 3. ✅ Import function for loading course data from JSON
-- 4. ✅ Updated_at trigger for courses table
-- 5. ✅ Ready to import data from new-real-courses.json via API
--
-- Next steps:
-- 1. Use your API routes to import course data from new-real-courses.json
-- 2. Test course filtering through the database instead of JSON file
-- 3. Optionally transition your app to use Supabase courses API