/*
  # Add onboarding completed field to profiles

  1. New Columns
    - `onboarding_completed` (boolean, default false)
    - `onboarding_data` (jsonb, for storing onboarding responses)

  2. Security
    - Users can update their own onboarding status
    - Public can read onboarding_completed status
*/

-- Add onboarding_completed column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add onboarding_data column to store responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_data'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index for onboarding_completed
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles (onboarding_completed);

-- Update existing policies to include onboarding fields
-- The existing policies should already cover these fields since they use SELECT * and UPDATE *