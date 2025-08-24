/*
  # Create secondary highlights table

  1. New Tables
    - `secondary_highlights`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `descricao` (text)
      - `titulo_botao` (text, not null)
      - `link` (text, not null)
      - `imagem` (text)
      - `posicao` (integer, not null)
      - `status` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `secondary_highlights` table
    - Add policy for public read access to active highlights
    - Add policy for authenticated users to manage highlights

  3. Sample Data
    - WhatsApp group highlight (position 1)
    - Calendar events highlight (position 2)
*/

CREATE TABLE IF NOT EXISTS secondary_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  titulo_botao text NOT NULL,
  link text NOT NULL,
  imagem text,
  posicao integer NOT NULL,
  status boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE secondary_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active secondary highlights"
  ON secondary_highlights
  FOR SELECT
  TO public
  USING (status = true);

CREATE POLICY "Authenticated users can manage secondary highlights"
  ON secondary_highlights
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_secondary_highlights_posicao ON secondary_highlights (posicao);
CREATE INDEX IF NOT EXISTS idx_secondary_highlights_status ON secondary_highlights (status);

-- Insert sample data
INSERT INTO secondary_highlights (nome, descricao, titulo_botao, link, imagem, posicao) VALUES
(
  'Entre no Grupo',
  'Participe da nossa comunidade no WhatsApp',
  'Entrar agora',
  'https://chat.whatsapp.com/example',
  'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  1
),
(
  'Adicionar Eventos',
  'Adicione nossos eventos à sua agenda',
  'Adicionar agora',
  'https://calendar.google.com/calendar/u/0?cid=example@group.calendar.google.com',
  'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  2
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_secondary_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_secondary_highlights_updated_at
  BEFORE UPDATE ON secondary_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_secondary_highlights_updated_at();