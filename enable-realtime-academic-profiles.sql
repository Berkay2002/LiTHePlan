-- Enable Realtime for academic_profiles table
-- Run this in Supabase SQL Editor

-- Add the academic_profiles table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE academic_profiles;