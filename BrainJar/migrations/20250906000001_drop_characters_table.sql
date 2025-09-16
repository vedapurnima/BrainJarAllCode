-- Drop characters table and related objects
-- This migration removes the character system from the application

-- Drop the characters table (this will also drop the foreign key constraint to users)
DROP TABLE IF EXISTS characters;