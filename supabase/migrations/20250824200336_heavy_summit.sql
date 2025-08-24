/*
  # Add onboarding fields to assinaturas table

  1. New Columns
    - `avatar_usuario` (text) - URL of user's avatar image
    - `experiencia_ia` (text) - User's AI/automation experience level
    - `objetivo_principal` (text) - User's main goal/objective
    - `tipo_trabalho` (text) - User's work type/context
    - `porte_negocio` (text) - Business size
    - `instagram` (text) - Instagram handle (optional)
    - `linkedin` (text) - LinkedIn profile URL (optional)

  2. Indexes
    - Add indexes for better query performance on new fields
*/

-- Add new columns for onboarding data
ALTER TABLE assinaturas 
ADD COLUMN IF NOT EXISTS avatar_usuario text,
ADD COLUMN IF NOT EXISTS experiencia_ia text,
ADD COLUMN IF NOT EXISTS objetivo_principal text,
ADD COLUMN IF NOT EXISTS tipo_trabalho text,
ADD COLUMN IF NOT EXISTS porte_negocio text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS linkedin text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_experiencia_ia ON assinaturas (experiencia_ia);
CREATE INDEX IF NOT EXISTS idx_assinaturas_objetivo_principal ON assinaturas (objetivo_principal);
CREATE INDEX IF NOT EXISTS idx_assinaturas_tipo_trabalho ON assinaturas (tipo_trabalho);
CREATE INDEX IF NOT EXISTS idx_assinaturas_porte_negocio ON assinaturas (porte_negocio);