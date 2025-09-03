/*
  # Add onboarding fields to assinaturas table

  1. New Columns
    - `onboarding_completed` (boolean, default false) - tracks if user completed onboarding
    - `onboarding_data` (jsonb, default '{}') - stores complete onboarding data as JSON
    - `bio` (text) - user biography/description
    - `score` (integer, default 0) - user score/points
    - `phone_number` (text) - user phone number (normalized from existing Telefone do cliente)
    - `is_premium` (boolean, default false) - premium status flag
    - `linkedin` (text) - LinkedIn profile URL
    - `created_at_profile` (timestamptz, default now()) - profile creation timestamp
    - `updated_at_profile` (timestamptz, default now()) - profile last update timestamp

  2. Data Migration
    - Copy existing phone data from "Telefone do cliente" to phone_number
    - Set is_premium based on "Status da assinatura"

  3. Indexes
    - Add indexes for frequently queried fields

  4. Triggers
    - Add trigger to update updated_at_profile on changes
*/

-- Add new columns to assinaturas table
DO $$
BEGIN
  -- Add onboarding_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  -- Add onboarding_data column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'onboarding_data'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN onboarding_data jsonb DEFAULT '{}';
  END IF;

  -- Add bio column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'bio'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN bio text;
  END IF;

  -- Add score column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'score'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN score integer DEFAULT 0;
  END IF;

  -- Add phone_number column (normalized)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN phone_number text;
  END IF;

  -- Add is_premium column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN is_premium boolean DEFAULT false;
  END IF;

  -- Add linkedin column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'linkedin'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN linkedin text;
  END IF;

  -- Add profile timestamps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'created_at_profile'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN created_at_profile timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'updated_at_profile'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN updated_at_profile timestamptz DEFAULT now();
  END IF;
END $$;

-- Migrate existing data
UPDATE assinaturas 
SET 
  phone_number = CASE 
    WHEN "Telefone do cliente" IS NOT NULL 
    THEN "Telefone do cliente"::text 
    ELSE NULL 
  END,
  is_premium = CASE 
    WHEN "Status da assinatura" = 'active' 
    THEN true 
    ELSE false 
  END,
  created_at_profile = COALESCE("Data de criação"::timestamptz, now()),
  updated_at_profile = now()
WHERE phone_number IS NULL OR is_premium IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_onboarding_completed 
ON assinaturas (onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_assinaturas_is_premium 
ON assinaturas (is_premium);

CREATE INDEX IF NOT EXISTS idx_assinaturas_score 
ON assinaturas (score DESC);

CREATE INDEX IF NOT EXISTS idx_assinaturas_updated_at_profile 
ON assinaturas (updated_at_profile DESC);

-- Create trigger function for updating updated_at_profile
CREATE OR REPLACE FUNCTION update_assinaturas_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at_profile = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_assinaturas_profile_updated_at_trigger ON assinaturas;
CREATE TRIGGER update_assinaturas_profile_updated_at_trigger
  BEFORE UPDATE ON assinaturas
  FOR EACH ROW
  EXECUTE FUNCTION update_assinaturas_profile_updated_at();