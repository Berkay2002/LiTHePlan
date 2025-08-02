-- Fix credits column to handle decimal values like 7.5
ALTER TABLE courses ALTER COLUMN credits TYPE DECIMAL(4,1);

-- Verify the change
\d courses;