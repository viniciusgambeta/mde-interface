/*
  # Fix comments RLS policy for onboarding validation

  1. Policy Updates
    - Drop existing INSERT policy that checks for active subscription
    - Create new INSERT policy that checks for completed onboarding
    - Ensure policy allows users to comment only if they have completed onboarding

  2. Security
    - Maintain user ownership validation (user_id = auth.uid())
    - Add onboarding completion check via assinaturas table
    - Keep existing SELECT, UPDATE, DELETE policies unchanged
*/

-- Drop the existing INSERT policy that checks for active subscription
DROP POLICY IF EXISTS "Authenticated users can create comments with active subscriptio" ON comments;

-- Create new INSERT policy that checks for completed onboarding
CREATE POLICY "Users can create comments with completed onboarding"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) AND 
    (EXISTS (
      SELECT 1
      FROM assinaturas
      WHERE assinaturas.user_id = auth.uid() 
        AND assinaturas.onboarding_completed = true
        AND assinaturas."ID da assinatura" = comments.assinatura_id
    ))
  );