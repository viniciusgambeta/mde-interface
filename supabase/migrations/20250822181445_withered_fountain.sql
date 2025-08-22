/*
  # Insert dummy data for video_versions table
  
  This migration creates sample version relationships between existing videos
  to test the version system functionality.
  
  1. Creates version groups with main videos and their alternatives
  2. Assigns proper version names and ordering
  3. Uses existing video IDs from the database
*/

-- First, let's create some version relationships
-- We'll use existing videos and create logical groupings

-- Example Group 1: React tutorials (assuming these videos exist)
-- Main video: First React video found
-- Versions: Other React-related videos
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  CASE 
    WHEN version.title ILIKE '%básico%' OR version.title ILIKE '%iniciante%' THEN 'Versão Básica'
    WHEN version.title ILIKE '%avançado%' OR version.title ILIKE '%advanced%' THEN 'Versão Avançada'
    WHEN version.title ILIKE '%prático%' OR version.title ILIKE '%prática%' THEN 'Versão Prática'
    ELSE 'Versão Alternativa'
  END as version_name,
  ROW_NUMBER() OVER (ORDER BY version.created_at) as version_order
FROM 
  (SELECT id, title FROM videos WHERE title ILIKE '%react%' LIMIT 1) main
CROSS JOIN 
  (SELECT id, title, created_at FROM videos WHERE title ILIKE '%react%' AND id != (SELECT id FROM videos WHERE title ILIKE '%react%' LIMIT 1) LIMIT 3) version;

-- Example Group 2: JavaScript tutorials
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  CASE 
    WHEN version.title ILIKE '%es6%' OR version.title ILIKE '%es2015%' THEN 'Versão ES6+'
    WHEN version.title ILIKE '%vanilla%' THEN 'Versão Vanilla'
    WHEN version.title ILIKE '%moderno%' OR version.title ILIKE '%modern%' THEN 'Versão Moderna'
    ELSE 'Versão Alternativa'
  END as version_name,
  ROW_NUMBER() OVER (ORDER BY version.created_at) as version_order
FROM 
  (SELECT id, title FROM videos WHERE title ILIKE '%javascript%' LIMIT 1) main
CROSS JOIN 
  (SELECT id, title, created_at FROM videos WHERE title ILIKE '%javascript%' AND id != (SELECT id FROM videos WHERE title ILIKE '%javascript%' LIMIT 1) LIMIT 2) version;

-- Example Group 3: CSS tutorials
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  CASE 
    WHEN version.title ILIKE '%flexbox%' THEN 'Versão Flexbox'
    WHEN version.title ILIKE '%grid%' THEN 'Versão Grid'
    WHEN version.title ILIKE '%responsive%' THEN 'Versão Responsiva'
    ELSE 'Versão Alternativa'
  END as version_name,
  ROW_NUMBER() OVER (ORDER BY version.created_at) as version_order
FROM 
  (SELECT id, title FROM videos WHERE title ILIKE '%css%' LIMIT 1) main
CROSS JOIN 
  (SELECT id, title, created_at FROM videos WHERE title ILIKE '%css%' AND id != (SELECT id FROM videos WHERE title ILIKE '%css%' LIMIT 1) LIMIT 2) version;

-- Example Group 4: Design tutorials
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  CASE 
    WHEN version.title ILIKE '%figma%' THEN 'Versão Figma'
    WHEN version.title ILIKE '%photoshop%' THEN 'Versão Photoshop'
    WHEN version.title ILIKE '%sketch%' THEN 'Versão Sketch'
    ELSE 'Versão Alternativa'
  END as version_name,
  ROW_NUMBER() OVER (ORDER BY version.created_at) as version_order
FROM 
  (SELECT id, title FROM videos WHERE title ILIKE '%design%' LIMIT 1) main
CROSS JOIN 
  (SELECT id, title, created_at FROM videos WHERE title ILIKE '%design%' AND id != (SELECT id FROM videos WHERE title ILIKE '%design%' LIMIT 1) LIMIT 2) version;

-- If the above queries don't find enough matches, let's create some manual relationships
-- using any existing videos (fallback approach)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v1.id as main_video_id,
  v2.id as version_video_id,
  'Versão Alternativa ' || ROW_NUMBER() OVER (PARTITION BY v1.id ORDER BY v2.created_at) as version_name,
  ROW_NUMBER() OVER (PARTITION BY v1.id ORDER BY v2.created_at) as version_order
FROM 
  (SELECT id, category_id FROM videos WHERE status = 'published' ORDER BY created_at LIMIT 5) v1
JOIN 
  (SELECT id, category_id, created_at FROM videos WHERE status = 'published') v2 
  ON v1.category_id = v2.category_id AND v1.id != v2.id
WHERE NOT EXISTS (
  SELECT 1 FROM video_versions vv WHERE vv.main_video_id = v1.id OR vv.version_video_id = v2.id
)
LIMIT 10;

-- Create some prompt versions as well
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v1.id as main_video_id,
  v2.id as version_video_id,
  CASE 
    WHEN v2.title ILIKE '%chatgpt%' THEN 'Versão ChatGPT'
    WHEN v2.title ILIKE '%claude%' THEN 'Versão Claude'
    WHEN v2.title ILIKE '%gemini%' THEN 'Versão Gemini'
    ELSE 'Versão Alternativa'
  END as version_name,
  ROW_NUMBER() OVER (PARTITION BY v1.id ORDER BY v2.created_at) as version_order
FROM 
  (SELECT id, title FROM videos WHERE tipo = 'prompt' AND status = 'published' LIMIT 3) v1
CROSS JOIN 
  (SELECT id, title, created_at FROM videos WHERE tipo = 'prompt' AND status = 'published') v2 
WHERE v1.id != v2.id
AND NOT EXISTS (
  SELECT 1 FROM video_versions vv WHERE vv.main_video_id = v1.id OR vv.version_video_id = v2.id
)
LIMIT 6;