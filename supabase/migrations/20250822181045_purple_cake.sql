/*
  # Create video versions relationship table

  1. New Tables
    - `video_versions`
      - `id` (uuid, primary key)
      - `main_video_id` (uuid, references videos.id) - The main/original video
      - `version_video_id` (uuid, references videos.id) - The version video
      - `version_name` (text) - Name of this version (e.g., "Versão 2024", "Versão Atualizada")
      - `version_order` (integer) - Order to display versions
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `video_versions` table
    - Add policies for public read access
    - Add policies for authenticated users to manage versions

  3. Indexes
    - Index on main_video_id for fast lookups
    - Index on version_video_id for reverse lookups
    - Unique constraint on main_video_id + version_video_id
*/

-- Create video_versions table
CREATE TABLE IF NOT EXISTS video_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  main_video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  version_video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  version_name text NOT NULL,
  version_order integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure a video can't be a version of itself
  CONSTRAINT video_versions_not_self CHECK (main_video_id != version_video_id),
  
  -- Ensure unique relationship
  CONSTRAINT video_versions_unique UNIQUE (main_video_id, version_video_id)
);

-- Enable RLS
ALTER TABLE video_versions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_versions_main_video_id ON video_versions(main_video_id);
CREATE INDEX IF NOT EXISTS idx_video_versions_version_video_id ON video_versions(version_video_id);
CREATE INDEX IF NOT EXISTS idx_video_versions_order ON video_versions(main_video_id, version_order);

-- RLS Policies
CREATE POLICY "Public can read video versions"
  ON video_versions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage video versions"
  ON video_versions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to get all versions of a video (including the main video itself)
CREATE OR REPLACE FUNCTION get_all_video_versions(input_video_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  version_name text,
  version_order integer,
  is_main boolean
) 
LANGUAGE plpgsql
AS $$
DECLARE
  main_video_id uuid;
BEGIN
  -- First, determine if this video is a main video or a version
  SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM video_versions WHERE main_video_id = input_video_id) THEN input_video_id
    ELSE (SELECT vv.main_video_id FROM video_versions vv WHERE vv.version_video_id = input_video_id LIMIT 1)
  END INTO main_video_id;
  
  -- If no main video found, this video has no versions
  IF main_video_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return the main video first
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.slug,
    'Versão Original'::text as version_name,
    0 as version_order,
    true as is_main
  FROM videos v
  WHERE v.id = main_video_id
    AND v.status = 'published';
  
  -- Then return all versions
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.slug,
    vv.version_name,
    vv.version_order,
    false as is_main
  FROM video_versions vv
  JOIN videos v ON v.id = vv.version_video_id
  WHERE vv.main_video_id = main_video_id
    AND v.status = 'published'
  ORDER BY vv.version_order;
END;
$$;

-- Remove old columns that are no longer needed
DO $$
BEGIN
  -- Remove parent_video_id column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'parent_video_id'
  ) THEN
    ALTER TABLE videos DROP COLUMN parent_video_id;
  END IF;
  
  -- Remove version_name column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'version_name'
  ) THEN
    ALTER TABLE videos DROP COLUMN version_name;
  END IF;
  
  -- Remove version_order column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'version_order'
  ) THEN
    ALTER TABLE videos DROP COLUMN version_order;
  END IF;
END $$;