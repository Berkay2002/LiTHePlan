-- Add academic_profiles table for profile sharing
-- Run this in Supabase SQL Editor

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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_academic_profiles_updated_at ON academic_profiles;
CREATE TRIGGER update_academic_profiles_updated_at 
  BEFORE UPDATE ON academic_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();