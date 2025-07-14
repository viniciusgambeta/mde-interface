/*
  # Create featured content table

  1. New Tables
    - `featured_content`
      - `id` (uuid, primary key)
      - `nome_botao` (text) - Button text
      - `link_botao` (text) - Button link
      - `titulo` (text) - Title
      - `descricao` (text) - Description
      - `tag` (text) - Tag/category
      - `status` (boolean) - Active status
      - `imagem_background` (text) - Background image URL
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `featured_content` table
    - Add policy for public read access
    - Add policy for authenticated users to manage content

  3. Sample Data
    - Insert dummy record for testing
*/

CREATE TABLE IF NOT EXISTS featured_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_botao text NOT NULL DEFAULT 'Saiba Mais',
  link_botao text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  tag text,
  status boolean DEFAULT true,
  imagem_background text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE featured_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read active featured content"
  ON featured_content
  FOR SELECT
  TO public
  USING (status = true);

CREATE POLICY "Authenticated users can manage featured content"
  ON featured_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_featured_content_status ON featured_content (status);
CREATE INDEX IF NOT EXISTS idx_featured_content_created_at ON featured_content (created_at DESC);

-- Update trigger
CREATE OR REPLACE FUNCTION update_featured_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_featured_content_updated_at
  BEFORE UPDATE ON featured_content
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_content_updated_at();

-- Insert dummy data
INSERT INTO featured_content (
  nome_botao,
  link_botao,
  titulo,
  descricao,
  tag,
  status,
  imagem_background
) VALUES (
  'Começar Agora',
  'https://example.com/curso-completo',
  'Domine React em 30 Dias',
  'Aprenda React do zero ao avançado com nosso curso mais completo. Inclui projetos práticos, hooks modernos, Context API, Redux e muito mais. Ideal para quem quer se tornar um desenvolvedor React profissional.',
  'Curso Completo',
  true,
  'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
);