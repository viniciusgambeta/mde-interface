/*
  # Create coupons table

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `nome` (text, coupon name)
      - `logo` (text, logo URL or emoji)
      - `descricao` (text, description)
      - `desconto` (text, discount percentage)
      - `codigo_cupom` (text, coupon code)
      - `categoria` (text, category)
      - `link` (text, external link)
      - `preco_original` (text, original price)
      - `preco_desconto` (text, discounted price)
      - `valido_ate` (date, expiration date)
      - `usado_por` (integer, usage count)
      - `avaliacao` (numeric, rating)
      - `visibilidade` (boolean, visibility status)
      - `ordem` (integer, display order)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `coupons` table
    - Add policy for public read access
    - Add policy for authenticated users to manage coupons

  3. Sample Data
    - Insert dummy coupon data for testing
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  logo text DEFAULT '🎁',
  descricao text NOT NULL,
  desconto text NOT NULL,
  codigo_cupom text NOT NULL,
  categoria text NOT NULL,
  link text NOT NULL,
  preco_original text,
  preco_desconto text,
  valido_ate date,
  usado_por integer DEFAULT 0,
  avaliacao numeric(2,1) DEFAULT 5.0,
  visibilidade boolean DEFAULT true,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read active coupons"
  ON coupons
  FOR SELECT
  TO public
  USING (visibilidade = true);

CREATE POLICY "Authenticated users can manage coupons"
  ON coupons
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_categoria ON coupons(categoria);
CREATE INDEX IF NOT EXISTS idx_coupons_visibilidade ON coupons(visibilidade);
CREATE INDEX IF NOT EXISTS idx_coupons_ordem ON coupons(ordem);
CREATE INDEX IF NOT EXISTS idx_coupons_valido_ate ON coupons(valido_ate);

-- Insert dummy data
INSERT INTO coupons (nome, logo, descricao, desconto, codigo_cupom, categoria, link, preco_original, preco_desconto, valido_ate, usado_por, avaliacao, ordem) VALUES
('Adobe Creative Cloud', '🎨', 'Acesso completo a todos os aplicativos da Adobe para criação de conteúdo profissional', '50%', 'ADOBE50', 'Design', 'https://adobe.com', 'R$ 89,90', 'R$ 44,95', '2024-12-31', 1250, 4.8, 1),
('Figma Pro', '🎯', 'Ferramenta de design colaborativo para criar interfaces e protótipos', '30%', 'FIGMA30', 'Design', 'https://figma.com', 'R$ 45,00', 'R$ 31,50', '2024-11-30', 890, 4.9, 2),
('Notion Pro', '📝', 'Workspace tudo-em-um para produtividade, notas e gerenciamento de projetos', '40%', 'NOTION40', 'Produtividade', 'https://notion.so', 'R$ 32,00', 'R$ 19,20', '2024-10-15', 2100, 4.7, 3),
('GitHub Copilot', '🤖', 'Assistente de IA para programação que acelera o desenvolvimento de código', '25%', 'COPILOT25', 'Desenvolvimento', 'https://github.com/features/copilot', 'R$ 40,00', 'R$ 30,00', '2024-12-25', 1800, 4.6, 4),
('Canva Pro', '🎨', 'Plataforma de design gráfico com templates profissionais e recursos avançados', '35%', 'CANVA35', 'Design', 'https://canva.com', 'R$ 54,90', 'R$ 35,69', '2024-11-20', 3200, 4.5, 5),
('Slack Premium', '💬', 'Plataforma de comunicação empresarial com recursos avançados de colaboração', '20%', 'SLACK20', 'Produtividade', 'https://slack.com', 'R$ 26,75', 'R$ 21,40', '2024-12-10', 950, 4.4, 6),
('Vercel Pro', '⚡', 'Plataforma de deploy e hosting para aplicações web modernas', '30%', 'VERCEL30', 'Desenvolvimento', 'https://vercel.com', 'R$ 80,00', 'R$ 56,00', '2024-11-15', 720, 4.7, 7),
('Linear', '📊', 'Ferramenta de gerenciamento de projetos e issues para equipes de desenvolvimento', '25%', 'LINEAR25', 'Produtividade', 'https://linear.app', 'R$ 32,00', 'R$ 24,00', '2024-12-05', 650, 4.8, 8),
('Framer', '🎭', 'Ferramenta de design e prototipagem para criar sites e aplicações interativas', '40%', 'FRAMER40', 'Design', 'https://framer.com', 'R$ 60,00', 'R$ 36,00', '2024-10-30', 480, 4.6, 9),
('ChatGPT Plus', '🧠', 'Versão premium do ChatGPT com acesso prioritário e recursos avançados de IA', '15%', 'CHATGPT15', 'IA', 'https://openai.com/chatgpt', 'R$ 80,00', 'R$ 68,00', '2024-12-20', 2800, 4.9, 10);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();