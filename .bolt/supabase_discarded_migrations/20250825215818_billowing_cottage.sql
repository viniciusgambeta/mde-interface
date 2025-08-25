/*
  # Create video_relateds table

  1. New Tables
    - `video_relateds`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key to videos)
      - `related_video_id` (uuid, foreign key to videos)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `video_relateds` table
    - Add policy for public read access
    - Add policy for authenticated users to manage relations

  3. Constraints
    - Unique constraint on video_id + related_video_id
    - Check constraint to prevent self-relations
    - Foreign key constraints with cascade delete
*/

CREATE TABLE IF NOT EXISTS video_relateds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  related_video_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT video_relateds_unique UNIQUE (video_id, related_video_id),
  CONSTRAINT video_relateds_not_self CHECK (video_id <> related_video_id)
);

-- Add foreign key constraints
ALTER TABLE video_relateds 
ADD CONSTRAINT video_relateds_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;

ALTER TABLE video_relateds 
ADD CONSTRAINT video_relateds_related_video_id_fkey 
FOREIGN KEY (related_video_id) REFERENCES videos(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_relateds_video_id ON video_relateds(video_id);
CREATE INDEX IF NOT EXISTS idx_video_relateds_related_video_id ON video_relateds(related_video_id);

-- Enable RLS
ALTER TABLE video_relateds ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Public can read video relations"
  ON video_relateds
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage video relations"
  ON video_relateds
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);