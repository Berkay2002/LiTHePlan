-- ============================================================================
-- PROFILE BUILDER - DATABASE SCHEMA UPDATE (FINAL)
-- ============================================================================
-- Clean up unnecessary fields and prepare for username/email login support

-- ============================================================================
-- 1. CLEAN UP PROFILES TABLE
-- ============================================================================

-- Remove unnecessary columns from profiles table
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS website;

-- Make username and email required (not null)
ALTER TABLE profiles 
  ALTER COLUMN username SET NOT NULL,
  ALTER COLUMN email SET NOT NULL;

-- Ensure email is also unique (needed for username lookup)
-- Drop constraint if it exists and recreate it
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_email_key;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- ============================================================================
-- 2. UPDATE TRIGGER FUNCTION
-- ============================================================================

-- Updated trigger function for new schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), -- Use username or email prefix
    new.raw_user_meta_data->>'avatar_url'  -- Avatar for Google/future users
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

-- ============================================================================
-- 3. CREATE USERNAME LOOKUP FUNCTION
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

-- ============================================================================
-- 4. VERIFY FINAL SCHEMA
-- ============================================================================

-- View the cleaned up profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
ORDER BY ordinal_position;

-- Expected structure:
-- id (uuid, not null, primary key, foreign key to auth.users)
-- updated_at (timestamp with time zone, nullable, default now())
-- username (text, not null, unique, min length 3)
-- avatar_url (text, nullable)
-- email (text, not null, unique)

-- ============================================================================
-- 5. CLEAN UP TEST DATA (OPTIONAL - UNCOMMENT IF NEEDED)
-- ============================================================================

-- Remove any existing profiles with null username or email
-- DELETE FROM public.profiles WHERE username IS NULL OR email IS NULL;

-- Remove any test academic profiles
-- DELETE FROM public.academic_profiles;

-- ============================================================================
-- 6. ADD HELPFUL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for username lookups (login performance)
CREATE INDEX IF NOT EXISTS idx_profiles_username_lookup 
ON public.profiles (username) 
WHERE username IS NOT NULL;

-- Index for email lookups 
CREATE INDEX IF NOT EXISTS idx_profiles_email_lookup 
ON public.profiles (email) 
WHERE email IS NOT NULL;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- After running this SQL:
-- 1. ✅ Removed full_name and website columns
-- 2. ✅ Made username and email required
-- 3. ✅ Added unique constraint on email
-- 4. ✅ Updated trigger to handle username conflicts
-- 5. ✅ Created function to lookup email from username
-- 6. ✅ Added performance indexes
-- 7. ✅ Ready for username OR email login