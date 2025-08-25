/*
  # Setup avatars storage bucket and policies

  1. Storage Setup
    - Create `avatars` bucket if not exists
    - Set bucket to public
    - Add policies for authenticated users

  2. Security
    - Users can upload their own avatars
    - Public read access for all avatars
    - Users can delete their own avatars
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated users to upload avatars
CREATE POLICY IF NOT EXISTS "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to update their own avatars
CREATE POLICY IF NOT EXISTS "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to delete their own avatars
CREATE POLICY IF NOT EXISTS "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for public read access to avatars
CREATE POLICY IF NOT EXISTS "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');