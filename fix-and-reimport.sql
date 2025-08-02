-- Fix the credits column to handle decimal values
ALTER TABLE courses ALTER COLUMN credits TYPE DECIMAL(4,1);

-- Clear existing data so we can do a fresh import
DELETE FROM courses;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' AND table_schema = 'public'
ORDER BY ordinal_position;