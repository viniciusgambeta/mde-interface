/*
  # Insert video versions relationships

  1. Direct INSERT statements
    - Creates version relationships between existing videos
    - Uses simple INSERT statements without complex logic
    - Creates multiple version groups for testing

  2. Version Groups Created
    - Each group has a main video and alternative versions
    - Different version names for variety
    - Proper ordering with version_order
*/

-- First, let's get some video IDs that likely exist
-- We'll create version relationships using direct INSERTs

-- Group 1: First 3 videos as versions of each other
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v1.id as main_video_id,
  v2.id as version_video_id,
  'Versão Alternativa' as version_name,
  2 as version_order
FROM 
  (SELECT id FROM videos ORDER BY created_at LIMIT 1) v1,
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 1) v2
WHERE v1.id != v2.id;

INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v1.id as main_video_id,
  v3.id as version_video_id,
  'Versão Prática' as version_name,
  3 as version_order
FROM 
  (SELECT id FROM videos ORDER BY created_at LIMIT 1) v1,
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 2) v3
WHERE v1.id != v3.id;

-- Group 2: Next 2 videos as versions
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v4.id as main_video_id,
  v5.id as version_video_id,
  'Versão Avançada' as version_name,
  2 as version_order
FROM 
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 3) v4,
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 4) v5
WHERE v4.id != v5.id;

-- Group 3: More versions
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v6.id as main_video_id,
  v7.id as version_video_id,
  'Versão Básica' as version_name,
  2 as version_order
FROM 
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 5) v6,
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 6) v7
WHERE v6.id != v7.id;

INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v6.id as main_video_id,
  v8.id as version_video_id,
  'Versão Completa' as version_name,
  3 as version_order
FROM 
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 5) v6,
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 7) v8
WHERE v6.id != v8.id;

-- Add some reverse relationships (so versions can see other versions)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v2.id as main_video_id,
  v1.id as version_video_id,
  'Versão Original' as version_name,
  1 as version_order
FROM 
  (SELECT id FROM videos ORDER BY created_at LIMIT 1) v1,
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 1) v2
WHERE v1.id != v2.id;

INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  v2.id as main_video_id,
  v3.id as version_video_id,
  'Versão Prática' as version_name,
  3 as version_order
FROM 
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 1) v2,
  (SELECT id FROM videos ORDER BY created_at LIMIT 1 OFFSET 2) v3
WHERE v2.id != v3.id;