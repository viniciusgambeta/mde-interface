/*
  # Fix comments table relationships

  1. Schema Changes
    - Add user_id column to comments table for direct user reference
    - Keep assinatura_id for subscription reference
    - Add proper indexes for performance
    
  2. Security
    - Update RLS policies to work with both user_id and assinatura_id
    - Allow authenticated users to comment if they have active subscription
    - Allow users to delete their own comments
    
  3. Data Migration
    - Populate user_id column from existing assinatura relationships
    - Ensure data consistency
*/

-- Add user_id column to comments table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Populate user_id from assinatura relationships
UPDATE comments 
SET user_id = assinaturas.user_id
FROM assinaturas 
WHERE comments.assinatura_id = assinaturas."ID da assinatura"
AND comments.user_id IS NULL;

-- Add foreign key constraint for user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_comments_user_id'
  ) THEN
    CREATE INDEX idx_comments_user_id ON comments(user_id);
  END IF;
END $$;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can create comments if they have active subscription" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Users can read all comments" ON comments;
DROP POLICY IF EXISTS "policycerta" ON comments;

-- Create new RLS policies that work with both user_id and subscription validation
CREATE POLICY "Users can read all comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments with active subscription"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE assinaturas.user_id = auth.uid() 
      AND assinaturas."Status da assinatura" = 'active'
      AND assinaturas."ID da assinatura" = comments.assinatura_id
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);