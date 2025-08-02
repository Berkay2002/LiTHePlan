-- Fix RLS policies for academic_profiles table
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own academic profiles" ON academic_profiles;
DROP POLICY IF EXISTS "Users can view own academic profiles" ON academic_profiles;
DROP POLICY IF EXISTS "Users can update own academic profiles" ON academic_profiles;
DROP POLICY IF EXISTS "Users can delete own academic profiles" ON academic_profiles;
DROP POLICY IF EXISTS "Public academic profiles are viewable by everyone" ON academic_profiles;

-- Create correct policies for authenticated users
CREATE POLICY "Users can view own academic profiles" 
  ON academic_profiles FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own academic profiles" 
  ON academic_profiles FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own academic profiles" 
  ON academic_profiles FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own academic profiles" 
  ON academic_profiles FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Optional: Allow public viewing of public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON academic_profiles FOR SELECT 
  TO public
  USING (is_public = true);