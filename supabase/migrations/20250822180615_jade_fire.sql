/*
  # Fix Video Versions System

  1. Database Changes
    - Add indexes for better performance on version queries
    - Add function to get all versions of a video (including parent and siblings)
    - Ensure proper foreign key relationships

  2. New Features
    - Improved version detection and retrieval
    - Better parent-child relationship handling
    - Optimized queries for version navigation

  3. Security
    - Maintain existing RLS policies
    - Ensure version data is properly accessible
*/

-- Add indexes for better version query performance
CREATE INDEX IF NOT EXISTS idx_videos_parent_video_id_version_order 
ON videos (parent_video_id, version_order) 
WHERE parent_video_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_videos_id_parent_lookup 
ON videos (id) 
WHERE parent_video_id IS NULL;

-- Function to get all versions of a video (including the video itself if it's a parent)
CREATE OR REPLACE FUNCTION get_video_versions(input_video_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  summary text,
  description text,
  thumbnail_url text,
  video_url text,
  duration_minutes integer,
  instructor_id uuid,
  category_id uuid,
  difficulty_level_id uuid,
  is_featured boolean,
  is_premium boolean,
  view_count integer,
  upvote_count integer,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  tipo text,
  prompt_content text,
  status text,
  parent_video_id uuid,
  version_name text,
  version_order integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_parent_id uuid;
BEGIN
  -- First, determine the parent video ID
  SELECT COALESCE(v.parent_video_id, v.id)
  INTO target_parent_id
  FROM videos v
  WHERE v.id = input_video_id;
  
  -- If no video found, return empty
  IF target_parent_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return all versions (parent + children) ordered by version_order
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.slug,
    v.summary,
    v.description,
    v.thumbnail_url,
    v.video_url,
    v.duration_minutes,
    v.instructor_id,
    v.category_id,
    v.difficulty_level_id,
    v.is_featured,
    v.is_premium,
    v.view_count,
    v.upvote_count,
    v.published_at,
    v.created_at,
    v.updated_at,
    v.tipo,
    v.prompt_content,
    v.status,
    v.parent_video_id,
    v.version_name,
    v.version_order
  FROM videos v
  WHERE (v.id = target_parent_id OR v.parent_video_id = target_parent_id)
    AND v.status = 'published'
  ORDER BY v.version_order ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_video_versions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_video_versions(uuid) TO anon;