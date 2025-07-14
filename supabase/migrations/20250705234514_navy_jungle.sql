/*
  # Ensure all videos have valid slugs

  1. Updates
    - Generate slugs for videos that don't have them
    - Ensure all slugs are unique and URL-friendly

  2. Data integrity
    - Update existing videos with proper slugs based on their titles
*/

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[áàâãä]', 'a', 'g'),
        '[éèêë]', 'e', 'g'
      ),
      '[^a-z0-9\s-]', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update videos that have empty or null slugs
UPDATE videos 
SET slug = generate_slug(title) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL OR slug = '' OR slug = 'video-slug';

-- Ensure all slugs are unique by appending ID suffix if needed
UPDATE videos 
SET slug = slug || '-' || substring(id::text, 1, 8)
WHERE id IN (
  SELECT id FROM (
    SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM videos
  ) t WHERE rn > 1
);

-- Clean up the function
DROP FUNCTION generate_slug(TEXT);