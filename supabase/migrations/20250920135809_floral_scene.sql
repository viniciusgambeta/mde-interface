/*
  # Create video_relateds table

  1. New Tables
    - `video_relateds`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key to videos) - The main video
      - `related_video_id` (uuid, foreign key to videos) - The related video
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `video_relateds` table
    - Add policy for public read access
    - Add policy for authenticated users to manage relationships

  3. Sample Data
    - Insert some sample relationships between existing videos
*/

CREATE TABLE IF NOT EXISTS video_relateds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  related_video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure a video can't be related to itself
  CONSTRAINT video_relateds_not_self CHECK (video_id != related_video_id),
  
  -- Ensure unique relationship
  CONSTRAINT video_relateds_unique UNIQUE (video_id, related_video_id)
);

-- Enable RLS
ALTER TABLE video_relateds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read video relateds"
  ON video_relateds
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage video relateds"
  ON video_relateds
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_relateds_video_id ON video_relateds(video_id);
CREATE INDEX IF NOT EXISTS idx_video_relateds_related_video_id ON video_relateds(related_video_id);

-- Insert sample data (relationships between existing videos)
INSERT INTO video_relateds (video_id, related_video_id)
SELECT 
  v1.id as video_id,
  v2.id as related_video_id
FROM 
  (SELECT id, category_id FROM videos WHERE status = 'published' ORDER BY created_at LIMIT 10) v1
CROSS JOIN 
  (SELECT id, category_id FROM videos WHERE status = 'published' ORDER BY created_at DESC LIMIT 10) v2
WHERE v1.id != v2.id 
  AND v1.category_id = v2.category_id
LIMIT 20;