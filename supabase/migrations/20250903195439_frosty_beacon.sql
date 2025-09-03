/*
  # Fix comments foreign key constraint

  1. Changes
    - Drop existing foreign key constraint `comments_assinatura_id_fkey` that references `assinaturas."ID da assinatura"`
    - Add new foreign key constraint that references `assinaturas.user_id` instead
    - This allows comments to be linked to users via their user_id

  2. Security
    - Maintains existing RLS policies on comments table
    - No changes to existing policies needed

  3. Notes
    - This fixes the foreign key constraint violation when creating comments
    - Comments will now properly reference users through the user_id column in assinaturas table
*/

-- Drop the existing foreign key constraint that references "ID da assinatura"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_assinatura_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments DROP CONSTRAINT comments_assinatura_id_fkey;
  END IF;
END $$;

-- Add new foreign key constraint that references user_id in assinaturas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (assinatura_id) REFERENCES assinaturas (user_id) ON DELETE CASCADE;
  END IF;
END $$;