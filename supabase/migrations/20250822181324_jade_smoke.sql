/*
  # Fix ambiguous column reference in get_all_video_versions function

  1. Problem
    - The function has ambiguous reference to "main_video_id" 
    - Could refer to PL/pgSQL variable or table column
    
  2. Solution
    - Properly qualify all column references with table aliases
    - Use clear table aliases (vv for video_versions, v for videos)
    - Ensure no conflicts between variable names and column names
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_all_video_versions(uuid);

-- Recreate the function with proper column qualification
CREATE OR REPLACE FUNCTION get_all_video_versions(input_video_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  tipo text,
  view_count integer,
  version_name text,
  version_order integer,
  is_main boolean
) 
LANGUAGE plpgsql
AS $$
DECLARE
  target_main_video_id uuid;
BEGIN
  -- First, determine if the input video is a main video or a version
  SELECT vv.main_video_id INTO target_main_video_id
  FROM video_versions vv
  WHERE vv.version_video_id = input_video_id
  LIMIT 1;
  
  -- If not found, the input video might be the main video itself
  IF target_main_video_id IS NULL THEN
    -- Check if this video has versions (meaning it's a main video)
    SELECT vv.main_video_id INTO target_main_video_id
    FROM video_versions vv
    WHERE vv.main_video_id = input_video_id
    LIMIT 1;
    
    -- If still not found, this video has no versions
    IF target_main_video_id IS NULL THEN
      -- Return just this video
      RETURN QUERY
      SELECT 
        v.id,
        v.title,
        v.slug,
        v.tipo,
        v.view_count,
        'Original'::text as version_name,
        0 as version_order,
        true as is_main
      FROM videos v
      WHERE v.id = input_video_id
        AND v.status = 'published';
      RETURN;
    END IF;
    
    -- If found, the input video is the main video
    target_main_video_id := input_video_id;
  END IF;
  
  -- Return the main video first
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.slug,
    v.tipo,
    v.view_count,
    'Original'::text as version_name,
    0 as version_order,
    true as is_main
  FROM videos v
  WHERE v.id = target_main_video_id
    AND v.status = 'published';
  
  -- Then return all versions
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.slug,
    v.tipo,
    v.view_count,
    vv.version_name,
    vv.version_order,
    false as is_main
  FROM video_versions vv
  JOIN videos v ON v.id = vv.version_video_id
  WHERE vv.main_video_id = target_main_video_id
    AND v.status = 'published'
  ORDER BY vv.version_order;
END;
$$;