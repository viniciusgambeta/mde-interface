/*
  # Add onboarding fields to assinaturas table

  1. New Columns
    - `avatar_usuario` (text) - URL da imagem do avatar do usuário
    - `experiencia_ia` (text) - Nível de experiência com IA
    - `objetivo_principal` (text) - Objetivo principal do usuário
    - `tipo_trabalho` (text) - Contexto profissional
    - `porte_negocio` (text) - Tamanho do negócio
    - `instagram` (text) - Handle do Instagram
    - `linkedin` (text) - URL do LinkedIn

  2. Indexes
    - Add indexes for filtering and analytics on new fields

  3. Notes
    - All fields are nullable to allow gradual data collection
    - Fields will be populated during onboarding flow
*/

-- Add onboarding fields to assinaturas table
DO $$
BEGIN
  -- Add avatar_usuario column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'avatar_usuario'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN avatar_usuario text;
  END IF;

  -- Add experiencia_ia column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'experiencia_ia'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN experiencia_ia text;
  END IF;

  -- Add objetivo_principal column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'objetivo_principal'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN objetivo_principal text;
  END IF;

  -- Add tipo_trabalho column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'tipo_trabalho'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN tipo_trabalho text;
  END IF;

  -- Add porte_negocio column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'porte_negocio'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN porte_negocio text;
  END IF;

  -- Add instagram column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'instagram'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN instagram text;
  END IF;

  -- Add linkedin column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assinaturas' AND column_name = 'linkedin'
  ) THEN
    ALTER TABLE assinaturas ADD COLUMN linkedin text;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_experiencia_ia ON assinaturas (experiencia_ia);
CREATE INDEX IF NOT EXISTS idx_assinaturas_objetivo_principal ON assinaturas (objetivo_principal);
CREATE INDEX IF NOT EXISTS idx_assinaturas_tipo_trabalho ON assinaturas (tipo_trabalho);
CREATE INDEX IF NOT EXISTS idx_assinaturas_porte_negocio ON assinaturas (porte_negocio);