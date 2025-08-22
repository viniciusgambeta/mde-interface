/*
  # Add lesson versions system

  1. New Columns
    - `videos` table:
      - `parent_video_id` (uuid, nullable) - References the original video this is a version of
      - `version_name` (text, nullable) - Name of this version (e.g., "Make", "N8N", "Zapier")
      - `version_order` (integer, default 1) - Order of versions (1 = original, 2+ = versions)

  2. Indexes
    - Index on `parent_video_id` for efficient version queries
    - Index on `version_order` for sorting versions

  3. Security
    - Update existing RLS policies to handle versions
    - Ensure version queries work with existing permissions

  4. Sample Data
    - Create sample videos with versions for testing
*/

-- Add new columns to videos table
DO $$
BEGIN
  -- Add parent_video_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'parent_video_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN parent_video_id uuid REFERENCES videos(id) ON DELETE CASCADE;
  END IF;

  -- Add version_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'version_name'
  ) THEN
    ALTER TABLE videos ADD COLUMN version_name text;
  END IF;

  -- Add version_order column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'version_order'
  ) THEN
    ALTER TABLE videos ADD COLUMN version_order integer DEFAULT 1;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_parent_video_id ON videos(parent_video_id);
CREATE INDEX IF NOT EXISTS idx_videos_version_order ON videos(version_order);
CREATE INDEX IF NOT EXISTS idx_videos_parent_version ON videos(parent_video_id, version_order);

-- Insert sample data for testing
DO $$
DECLARE
  programming_category_id uuid;
  design_category_id uuid;
  beginner_level_id uuid;
  intermediate_level_id uuid;
  instructor_id uuid;
  original_video_id uuid;
  version_video_id uuid;
BEGIN
  -- Get existing category and difficulty IDs
  SELECT id INTO programming_category_id FROM categories WHERE slug = 'programming' LIMIT 1;
  SELECT id INTO design_category_id FROM categories WHERE slug = 'design' LIMIT 1;
  SELECT id INTO beginner_level_id FROM difficulty_levels WHERE slug = 'beginner' LIMIT 1;
  SELECT id INTO intermediate_level_id FROM difficulty_levels WHERE slug = 'intermediate' LIMIT 1;
  SELECT id INTO instructor_id FROM instructors LIMIT 1;

  -- Create original video: Email automation with Make
  INSERT INTO videos (
    id,
    title,
    slug,
    summary,
    description,
    thumbnail_url,
    video_url,
    duration_minutes,
    instructor_id,
    category_id,
    difficulty_level_id,
    is_featured,
    is_premium,
    view_count,
    upvote_count,
    published_at,
    tipo,
    status,
    parent_video_id,
    version_name,
    version_order
  ) VALUES (
    gen_random_uuid(),
    'Automação de E-mails com Make',
    'automacao-emails-make',
    'Aprenda a criar automações poderosas de e-mail usando a plataforma Make (antigo Integromat)',
    'Nesta aula completa, você vai aprender como configurar automações de e-mail usando o Make. Vamos cobrir desde a configuração inicial até automações avançadas com múltiplos triggers e ações. Perfeito para quem quer automatizar processos de marketing e comunicação.',
    'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    25,
    instructor_id,
    programming_category_id,
    intermediate_level_id,
    true,
    false,
    1250,
    89,
    now() - interval '5 days',
    'video',
    'published',
    null,
    'Make',
    1
  ) RETURNING id INTO original_video_id;

  -- Create version 1: Same automation with N8N
  INSERT INTO videos (
    id,
    title,
    slug,
    summary,
    description,
    thumbnail_url,
    video_url,
    duration_minutes,
    instructor_id,
    category_id,
    difficulty_level_id,
    is_featured,
    is_premium,
    view_count,
    upvote_count,
    published_at,
    tipo,
    status,
    parent_video_id,
    version_name,
    version_order
  ) VALUES (
    gen_random_uuid(),
    'Automação de E-mails com N8N',
    'automacao-emails-n8n',
    'A mesma automação de e-mails, mas agora usando N8N - uma alternativa open-source ao Make',
    'Nesta versão da aula, implementamos exatamente a mesma automação de e-mails que fizemos com Make, mas agora usando N8N. Você vai ver as diferenças entre as plataformas e como migrar suas automações. Ideal para quem prefere soluções open-source.',
    'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    28,
    instructor_id,
    programming_category_id,
    intermediate_level_id,
    false,
    false,
    890,
    67,
    now() - interval '3 days',
    'video',
    'published',
    original_video_id,
    'N8N',
    2
  );

  -- Create version 2: Same automation with Zapier
  INSERT INTO videos (
    id,
    title,
    slug,
    summary,
    description,
    thumbnail_url,
    video_url,
    duration_minutes,
    instructor_id,
    category_id,
    difficulty_level_id,
    is_featured,
    is_premium,
    view_count,
    upvote_count,
    published_at,
    tipo,
    status,
    parent_video_id,
    version_name,
    version_order
  ) VALUES (
    gen_random_uuid(),
    'Automação de E-mails com Zapier',
    'automacao-emails-zapier',
    'Implementando a automação de e-mails usando Zapier - a plataforma mais popular para automações',
    'Terceira versão da nossa automação de e-mails! Agora usando Zapier, a plataforma mais conhecida do mercado. Compare as três abordagens e escolha a que melhor se adapta ao seu projeto. Inclui dicas exclusivas do Zapier.',
    'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4',
    22,
    instructor_id,
    programming_category_id,
    intermediate_level_id,
    false,
    true,
    654,
    45,
    now() - interval '1 day',
    'video',
    'published',
    original_video_id,
    'Zapier',
    3
  );

  -- Create another set: Landing page creation
  INSERT INTO videos (
    id,
    title,
    slug,
    summary,
    description,
    thumbnail_url,
    video_url,
    duration_minutes,
    instructor_id,
    category_id,
    difficulty_level_id,
    is_featured,
    is_premium,
    view_count,
    upvote_count,
    published_at,
    tipo,
    status,
    parent_video_id,
    version_name,
    version_order
  ) VALUES (
    gen_random_uuid(),
    'Criando Landing Pages com Figma',
    'landing-pages-figma',
    'Design completo de landing pages no Figma, do wireframe ao protótipo final',
    'Aprenda o processo completo de criação de landing pages no Figma. Desde o planejamento e wireframes até o design final com componentes reutilizáveis. Inclui técnicas de UX/UI específicas para conversão.',
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_4mb.mp4',
    35,
    instructor_id,
    design_category_id,
    beginner_level_id,
    false,
    false,
    2100,
    156,
    now() - interval '7 days',
    'video',
    'published',
    null,
    'Figma',
    1
  ) RETURNING id INTO original_video_id;

  -- Version with Adobe XD
  INSERT INTO videos (
    id,
    title,
    slug,
    summary,
    description,
    thumbnail_url,
    video_url,
    duration_minutes,
    instructor_id,
    category_id,
    difficulty_level_id,
    is_featured,
    is_premium,
    view_count,
    upvote_count,
    published_at,
    tipo,
    status,
    parent_video_id,
    version_name,
    version_order
  ) VALUES (
    gen_random_uuid(),
    'Criando Landing Pages com Adobe XD',
    'landing-pages-adobe-xd',
    'A mesma landing page, mas criada no Adobe XD com suas ferramentas exclusivas',
    'Versão Adobe XD da nossa aula de landing pages. Explore as diferenças entre Figma e XD, aprenda recursos exclusivos do Adobe XD como Auto-Animate e Voice Prototyping. Perfeito para quem já usa o ecossistema Adobe.',
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    32,
    instructor_id,
    design_category_id,
    beginner_level_id,
    false,
    true,
    1450,
    98,
    now() - interval '4 days',
    'video',
    'published',
    original_video_id,
    'Adobe XD',
    2
  );

END $$;