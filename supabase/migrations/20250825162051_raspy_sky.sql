/*
  # Ensure profiles table has onboarding columns

  1. Modifications
    - Add `onboarding_completed` column if it doesn't exist
    - Add `onboarding_data` column if it doesn't exist
    - Set default values for existing users

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add onboarding_completed column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add onboarding_data column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_data'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_data jsonb DEFAULT '{}';
  END IF;
END $$;

-- Set existing users as having completed onboarding (so they don't see it)
UPDATE profiles 
SET onboarding_completed = true 
WHERE onboarding_completed IS NULL OR onboarding_completed = false;