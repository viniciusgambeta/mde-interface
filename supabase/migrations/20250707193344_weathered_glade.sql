/*
  # Adicionar campo tipo na tabela videos

  1. Alterações
    - Adicionar coluna 'tipo' na tabela videos
    - Definir valores permitidos: 'video' e 'prompt'
    - Definir 'video' como valor padrão
    - Atualizar videos existentes para tipo 'video'

  2. Segurança
    - Manter políticas RLS existentes
    - Adicionar constraint para validar valores
*/

-- Adicionar coluna tipo na tabela videos
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'video' CHECK (tipo IN ('video', 'prompt'));

-- Atualizar todos os videos existentes para tipo 'video' (caso não tenham valor)
UPDATE videos 
SET tipo = 'video' 
WHERE tipo IS NULL;

-- Adicionar índice para melhor performance nas consultas por tipo
CREATE INDEX IF NOT EXISTS idx_videos_tipo ON videos(tipo);

-- Inserir alguns exemplos de conteúdo tipo 'prompt' para demonstração
INSERT INTO videos (title, slug, summary, description, thumbnail_url, duration_minutes, instructor_id, category_id, difficulty_level_id, is_featured, is_premium, view_count, upvote_count, tipo) VALUES
(
  'Prompt para Criar Landing Pages Eficazes',
  'prompt-landing-pages-eficazes',
  'Prompt completo para gerar landing pages que convertem usando IA. Inclui estrutura, copywriting e elementos visuais.',
  'Este prompt foi desenvolvido para ajudar você a criar landing pages altamente eficazes usando ferramentas de IA como ChatGPT, Claude ou Gemini. O prompt inclui instruções detalhadas sobre estrutura da página, técnicas de copywriting persuasivo, elementos visuais essenciais e estratégias de conversão.

Você aprenderá a usar este prompt para:
- Definir a proposta de valor única
- Criar headlines que capturam atenção
- Estruturar o conteúdo de forma lógica
- Incluir calls-to-action eficazes
- Otimizar para diferentes dispositivos

O prompt pode ser adaptado para diferentes nichos e tipos de negócio, desde produtos digitais até serviços profissionais.',
  'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  15,
  (SELECT id FROM instructors WHERE name = 'Ana Costa'),
  (SELECT id FROM categories WHERE slug = 'marketing'),
  (SELECT id FROM difficulty_levels WHERE slug = 'intermediate'),
  false,
  false,
  234,
  18,
  'prompt'
),
(
  'Prompt para Análise de Dados com Python',
  'prompt-analise-dados-python',
  'Prompt especializado para análise exploratória de dados usando Python, pandas e visualizações.',
  'Prompt completo para realizar análise exploratória de dados de forma sistemática e profissional. Este prompt guia a IA para gerar código Python otimizado usando pandas, numpy, matplotlib e seaborn.

O prompt inclui:
- Carregamento e limpeza de dados
- Análise estatística descritiva
- Identificação de outliers e valores faltantes
- Criação de visualizações informativas
- Geração de insights e recomendações
- Documentação do processo de análise

Ideal para cientistas de dados, analistas e profissionais que trabalham com dados e querem automatizar parte do processo de análise exploratória.',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  20,
  (SELECT id FROM instructors WHERE name = 'Pedro Santos'),
  (SELECT id FROM categories WHERE slug = 'data'),
  (SELECT id FROM difficulty_levels WHERE slug = 'advanced'),
  false,
  true,
  156,
  12,
  'prompt'
),
(
  'Prompt para Design de Interfaces Modernas',
  'prompt-design-interfaces-modernas',
  'Prompt para criar designs de interface modernos e funcionais usando princípios de UX/UI.',
  'Este prompt foi criado para ajudar designers e desenvolvedores a criar interfaces modernas e centradas no usuário. O prompt guia a IA para gerar especificações detalhadas de design seguindo as melhores práticas de UX/UI.

Inclui diretrizes para:
- Hierarquia visual e tipografia
- Paleta de cores e contraste
- Layout responsivo e grid systems
- Componentes de interface consistentes
- Microinterações e estados de hover
- Acessibilidade e usabilidade

O prompt pode ser usado para diferentes tipos de projetos: websites, aplicativos mobile, dashboards e sistemas web complexos.',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  12,
  (SELECT id FROM instructors WHERE name = 'Carlos Silva'),
  (SELECT id FROM categories WHERE slug = 'design'),
  (SELECT id FROM difficulty_levels WHERE slug = 'intermediate'),
  false,
  false,
  89,
  7,
  'prompt'
);