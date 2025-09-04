/*
  # Fix comments foreign key relationship

  1. Database Changes
    - Add missing foreign key constraint between comments.user_id and assinaturas.user_id
    - This will allow proper joins between comments and user profile data

  2. Security
    - No changes to existing RLS policies
    - Maintains current security model

  3. Notes
    - This fixes the relationship error when fetching comments with user profile data
    - Uses IF NOT EXISTS to prevent errors if constraint already exists
*/

-- Add foreign key constraint between comments and assinaturas tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_assinatura_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_assinatura_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.assinaturas(user_id) ON DELETE SET NULL;
  END IF;
END $$;