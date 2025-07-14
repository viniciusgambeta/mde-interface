/*
  # Create ferramentas_links table and video relationship

  1. New Tables
    - `ferramentas_links` - Tools/links that can be associated with videos
      - `id` (uuid, primary key)
      - `nome` (text, tool name)
      - `icone` (text, icon name for display)
      - `link` (text, URL to the tool website)
      - `created_at` (timestamp)

    - `video_ferramentas` - Junction table for many-to-many relationship
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key to videos)
      - `ferramenta_id` (uuid, foreign key to ferramentas_links)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public read access for tools
    - Authenticated users can manage video-tool associations

  3. Sample Data
    - Insert common development and design tools
*/

-- Create ferramentas_links table
CREATE TABLE IF NOT EXISTS ferramentas_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  icone text NOT NULL DEFAULT 'ExternalLink',
  link text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create junction table for video-tool relationships
CREATE TABLE IF NOT EXISTS video_ferramentas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  ferramenta_id uuid REFERENCES ferramentas_links(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, ferramenta_id)
);

-- Enable RLS
ALTER TABLE ferramentas_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_ferramentas ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to tools
CREATE POLICY "Public can read ferramentas_links"
  ON ferramentas_links FOR SELECT TO public USING (true);

-- Create policies for authenticated users to manage video-tool associations
CREATE POLICY "Authenticated users can insert video ferramentas"
  ON video_ferramentas FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update video ferramentas"
  ON video_ferramentas FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete video ferramentas"
  ON video_ferramentas FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Public can read video ferramentas"
  ON video_ferramentas FOR SELECT TO public USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_ferramentas_video_id ON video_ferramentas(video_id);
CREATE INDEX IF NOT EXISTS idx_video_ferramentas_ferramenta_id ON video_ferramentas(ferramenta_id);

-- Insert sample tools
INSERT INTO ferramentas_links (nome, icone, link) VALUES
('Visual Studio Code', 'Code', 'https://code.visualstudio.com/'),
('Figma', 'Palette', 'https://figma.com/'),
('GitHub', 'Github', 'https://github.com/'),
('React', 'Zap', 'https://react.dev/'),
('Node.js', 'Server', 'https://nodejs.org/'),
('TypeScript', 'FileCode', 'https://typescriptlang.org/'),
('Tailwind CSS', 'Paintbrush', 'https://tailwindcss.com/'),
('Next.js', 'ArrowRight', 'https://nextjs.org/'),
('Vercel', 'Cloud', 'https://vercel.com/'),
('Netlify', 'Globe', 'https://netlify.com/'),
('Adobe Photoshop', 'Image', 'https://adobe.com/products/photoshop.html'),
('Adobe Illustrator', 'PenTool', 'https://adobe.com/products/illustrator.html'),
('Sketch', 'Square', 'https://sketch.com/'),
('Framer', 'Layout', 'https://framer.com/'),
('Notion', 'FileText', 'https://notion.so/'),
('Slack', 'MessageCircle', 'https://slack.com/'),
('Discord', 'Users', 'https://discord.com/'),
('Zoom', 'Video', 'https://zoom.us/'),
('Google Analytics', 'BarChart3', 'https://analytics.google.com/'),
('Google Ads', 'Target', 'https://ads.google.com/'),
('Facebook Ads', 'Facebook', 'https://facebook.com/business/'),
('Mailchimp', 'Mail', 'https://mailchimp.com/'),
('Canva', 'Palette', 'https://canva.com/'),
('Unsplash', 'Camera', 'https://unsplash.com/'),
('Pexels', 'Image', 'https://pexels.com/'),
('ChatGPT', 'Bot', 'https://chat.openai.com/'),
('Claude', 'Brain', 'https://claude.ai/'),
('Midjourney', 'Sparkles', 'https://midjourney.com/'),
('Stable Diffusion', 'Wand2', 'https://stability.ai/'),
('Python', 'Code2', 'https://python.org/'),
('Jupyter', 'BookOpen', 'https://jupyter.org/'),
('Pandas', 'Database', 'https://pandas.pydata.org/'),
('NumPy', 'Calculator', 'https://numpy.org/'),
('Matplotlib', 'TrendingUp', 'https://matplotlib.org/'),
('Scikit-learn', 'Brain', 'https://scikit-learn.org/'),
('TensorFlow', 'Cpu', 'https://tensorflow.org/'),
('PyTorch', 'Zap', 'https://pytorch.org/'),
('Flutter', 'Smartphone', 'https://flutter.dev/'),
('React Native', 'Smartphone', 'https://reactnative.dev/'),
('Expo', 'Play', 'https://expo.dev/'),
('Firebase', 'Database', 'https://firebase.google.com/'),
('Supabase', 'Database', 'https://supabase.com/'),
('MongoDB', 'Database', 'https://mongodb.com/'),
('PostgreSQL', 'Database', 'https://postgresql.org/'),
('Docker', 'Package', 'https://docker.com/'),
('Kubernetes', 'Server', 'https://kubernetes.io/'),
('AWS', 'Cloud', 'https://aws.amazon.com/'),
('Google Cloud', 'Cloud', 'https://cloud.google.com/'),
('Azure', 'Cloud', 'https://azure.microsoft.com/');

-- Add some sample associations between videos and tools
-- React course tools
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.slug = 'react-18-completo' 
  AND f.nome IN ('React', 'Visual Studio Code', 'Node.js', 'TypeScript', 'GitHub');

-- Design system tools
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.slug = 'design-system-figma' 
  AND f.nome IN ('Figma', 'Adobe Illustrator', 'Notion');

-- Marketing course tools
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.slug = 'marketing-digital-iniciantes' 
  AND f.nome IN ('Google Analytics', 'Google Ads', 'Mailchimp', 'Canva');

-- Python data science tools
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.slug = 'python-ciencia-dados' 
  AND f.nome IN ('Python', 'Jupyter', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn');

-- Flutter course tools
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.slug = 'flutter-mobile-development' 
  AND f.nome IN ('Flutter', 'Visual Studio Code', 'Firebase', 'GitHub');

-- JavaScript course tools
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.slug = 'javascript-avancado-es2024' 
  AND f.nome IN ('Visual Studio Code', 'Node.js', 'GitHub', 'TypeScript');

-- UX Research tools
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.slug = 'ux-research-pratica' 
  AND f.nome IN ('Figma', 'Notion', 'Zoom', 'Miro');

-- Add tools to prompt content
INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.tipo = 'prompt' 
  AND v.title ILIKE '%landing page%'
  AND f.nome IN ('ChatGPT', 'Claude', 'Canva', 'Figma');

INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.tipo = 'prompt' 
  AND v.title ILIKE '%análise%dados%'
  AND f.nome IN ('ChatGPT', 'Claude', 'Python', 'Jupyter', 'Pandas');

INSERT INTO video_ferramentas (video_id, ferramenta_id) 
SELECT 
  v.id,
  f.id
FROM videos v, ferramentas_links f
WHERE v.tipo = 'prompt' 
  AND v.title ILIKE '%design%interface%'
  AND f.nome IN ('ChatGPT', 'Claude', 'Figma', 'Adobe Photoshop');