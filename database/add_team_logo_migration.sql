-- TeamTango Team Logo Migration
-- Add logo column to teams table for storing team logo URLs
-- Run this in your Supabase SQL Editor

-- Add logo column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment for the new column
COMMENT ON COLUMN teams.logo_url IS 'URL to the team logo image stored in Supabase Storage';

-- Update the teams_with_sports view to include logo_url
CREATE OR REPLACE VIEW teams_with_sports AS
SELECT 
  t.*,
  s.name as sport_name
FROM teams t
LEFT JOIN sports s ON t.sport_id = s.id;

-- Verify the migration
SELECT 'Team logo column added successfully!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teams' AND column_name = 'logo_url'; 