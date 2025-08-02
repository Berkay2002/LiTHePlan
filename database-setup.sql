-- ============================================================================
-- PROFILE BUILDER - COMPLETE DATABASE SETUP
-- ============================================================================
-- This SQL builds upon Supabase User Management Starter and adds academic profile sharing

-- ============================================================================
-- 1. USER MANAGEMENT (from Supabase Starter - Enhanced)
-- ============================================================================

-- Create a table for public user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  email TEXT, -- Added for easier user identification

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for user profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- ============================================================================
-- 2. ACADEMIC PROFILE SHARING (New - Our Main Feature)
-- ============================================================================

-- Create table for shared academic profiles
CREATE TABLE IF NOT EXISTS academic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  profile_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
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

-- RLS Policies for academic profiles (drop existing first)
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
-- 3. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger for academic_profiles updated_at
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
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email
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
-- 4. STORAGE SETUP (from Supabase Starter)
-- ============================================================================

-- Set up Storage for avatars
INSERT INTO storage.buckets (id, name)
  VALUES ('avatars', 'avatars')
  ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (drop existing first)
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
CREATE POLICY "Users can update their own avatar." 
  ON storage.objects FOR UPDATE 
  USING (auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar." ON storage.objects;
CREATE POLICY "Users can delete their own avatar." 
  ON storage.objects FOR DELETE 
  USING (auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 5. UTILITY FUNCTIONS FOR ACADEMIC PROFILES
-- ============================================================================

-- Function to get profile statistics
CREATE OR REPLACE FUNCTION get_profile_stats(profile_uuid UUID)
RETURNS TABLE (
  total_profiles BIGINT,
  public_profiles BIGINT,
  private_profiles BIGINT,
  most_recent_profile TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE is_public = true) as public_profiles,
    COUNT(*) FILTER (WHERE is_public = false) as private_profiles,
    MAX(created_at) as most_recent_profile
  FROM academic_profiles 
  WHERE user_id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old profiles (optional - for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_profiles(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM academic_profiles 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old
    AND is_public = true
    AND user_id IS NULL; -- Only clean up orphaned public profiles
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment the following lines if you want to create sample data for testing:

/*
-- Insert a sample academic profile (replace with actual user UUID after signup)
INSERT INTO academic_profiles (user_id, name, profile_data, is_public) 
VALUES (
  'replace-with-actual-user-uuid',
  'Sample Master Program Plan',
  '{
    "id": "sample-profile-1",
    "name": "Sample Master Program Plan", 
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "terms": {
      "7": [{"id": "COURSE1", "name": "Advanced Programming", "credits": 6}],
      "8": [{"id": "COURSE2", "name": "Data Structures", "credits": 6}],
      "9": [{"id": "COURSE3", "name": "Algorithms", "credits": 6}]
    },
    "metadata": {
      "total_credits": 18,
      "advanced_credits": 18,
      "is_valid": true
    }
  }'::jsonb,
  true
);
*/

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
SELECT 
  table_name, 
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'academic_profiles')
ORDER BY table_name;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'academic_profiles');

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'academic_profiles')
ORDER BY tablename, policyname;

-- ============================================================================
-- SETUP COMPLETE! 
-- ============================================================================
-- Your database is now ready for lightning-fast profile sharing!
-- 
-- Next steps:
-- 1. Make sure your .env.local has the correct SUPABASE_SECRET_KEY
-- 2. Test authentication at http://localhost:3000/login  
-- 3. Create a profile and test sharing
-- 4. Check browser console for "⚡ Auth check completed in 2ms"
-- ============================================================================