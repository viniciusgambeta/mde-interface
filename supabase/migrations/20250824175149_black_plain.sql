/*
  # Add etapa field to video_suggestions table

  1. Changes
    - Add `etapa` column to video_suggestions table
    - Add check constraint for valid etapa values
    - Update existing records to have default etapa

  2. Security
    - No changes to existing RLS policies
*/

-- Add etapa column to video_suggestions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_suggestions' AND column_name = 'etapa'
  ) THEN
    ALTER TABLE video_suggestions ADD COLUMN etapa text DEFAULT 'sugestao';
  END IF;
END $$;

-- Add check constraint for etapa values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'video_suggestions_etapa_check'
  ) THEN
    ALTER TABLE video_suggestions 
    ADD CONSTRAINT video_suggestions_etapa_check 
    CHECK (etapa = ANY (ARRAY['sugestao'::text, 'producao'::text, 'prontas'::text]));
  END IF;
END $$;

-- Create index for etapa column
CREATE INDEX IF NOT EXISTS idx_video_suggestions_etapa ON video_suggestions(etapa);