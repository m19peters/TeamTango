-- Add theme preference to user_profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE user_profiles 
ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'system' 
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Create index for theme preference queries
CREATE INDEX user_profiles_theme_preference_idx ON user_profiles(theme_preference);

-- Update existing users to have 'system' preference (they'll keep their current localStorage setting)
UPDATE user_profiles 
SET theme_preference = 'system' 
WHERE theme_preference IS NULL; 