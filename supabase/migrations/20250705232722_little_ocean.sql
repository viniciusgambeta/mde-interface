/*
  # Populate Database with Dummy Data

  1. Insert sample instructors
  2. Insert categories
  3. Insert difficulty levels
  4. Insert sample videos
  5. Insert video materials
  6. Insert some sample upvotes and bookmarks
*/

-- Insert difficulty levels
INSERT INTO difficulty_levels (name, slug, order_index, color) VALUES
('Iniciante', 'beginner', 1, '#10b981'),
('Intermediário', 'intermediate', 2, '#f59e0b'),
('Avançado', 'advanced', 3, '#ef4444'),
('Expert', 'expert', 4, '#8b5cf6');

-- Insert categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Programação', 'programming', 'Cursos de desenvolvimento e programação', 'Code', '#3b82f6'),
('Design', 'design', 'Design UI/UX, gráfico e web', 'Palette', '#ec4899'),
('Marketing', 'marketing', 'Marketing digital e estratégias', 'TrendingUp', '#f59e0b'),
('Negócios', 'business', 'Empreendedorismo e gestão', 'Briefcase', '#10b981'),
('Dados', 'data', 'Ciência de dados e analytics', 'BarChart3', '#8b5cf6'),
('Mobile', 'mobile', 'Desenvolvimento mobile', 'Smartphone', '#06b6d4');

-- Insert instructors
INSERT INTO instructors (name, bio, avatar_url, social_instagram, social_linkedin, social_github, is_verified) VALUES
('Sarah Johnson', 'Desenvolvedora Full-Stack com 8 anos de experiência em React e Node.js. Especialista em arquitetura de sistemas modernos.', 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop', '@sarahjohnson', 'sarah-johnson-dev', 'sarahjohnson', true),
('Carlos Silva', 'Designer UI/UX com foco em experiência do usuário. Trabalhou em startups e grandes empresas de tecnologia.', 'https://images.pexels.com/photos/2889942/pexels-photo-2889942.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop', '@carlosdesign', 'carlos-silva-ux', 'carlossilva', true),
('Ana Costa', 'Especialista em Marketing Digital e Growth Hacking. Ajudou mais de 100 empresas a crescer online.', 'https://images.pexels.com/photos/3370021/pexels-photo-3370021.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop', '@anacosta', 'ana-costa-marketing', null, true),
('Pedro Santos', 'Cientista de Dados e Machine Learning Engineer. PhD em Inteligência Artificial pela USP.', 'https://images.pexels.com/photos/1870163/pexels-photo-1870163.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop', '@pedrodata', 'pedro-santos-data', 'pedrosantos', true),
('Julia Oliveira', 'Desenvolvedora Mobile especializada em Flutter e React Native. Criou mais de 50 apps publicados.', 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop', '@juliamobile', 'julia-oliveira-mobile', 'juliaoliveira', true),
('Roberto Lima', 'Empreendedor e consultor de negócios. Fundou 3 startups e mentor de aceleradoras.', 'https://images.pexels.com/photos/2889942/pexels-photo-2889942.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop', '@robertolima', 'roberto-lima-business', null, false);

-- Insert videos
INSERT INTO videos (title, slug, summary, description, thumbnail_url, video_url, duration_minutes, instructor_id, category_id, difficulty_level_id, is_featured, is_premium, view_count, upvote_count) VALUES
(
  'Curso Completo de React 18 - Do Zero ao Avançado',
  'react-18-completo',
  'Aprenda React 18 com hooks, context, suspense e as mais novas funcionalidades do framework mais popular do mercado.',
  'Neste curso completo de React 18, você aprenderá desde os conceitos básicos até técnicas avançadas. Cobrimos hooks, context API, suspense, concurrent features, e muito mais. Ideal para quem quer dominar o desenvolvimento front-end moderno.',
  'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  165,
  (SELECT id FROM instructors WHERE name = 'Sarah Johnson'),
  (SELECT id FROM categories WHERE slug = 'programming'),
  (SELECT id FROM difficulty_levels WHERE slug = 'intermediate'),
  true,
  false,
  2150,
  89
),
(
  'Design System Completo com Figma',
  'design-system-figma',
  'Crie design systems profissionais e escaláveis usando Figma. Aprenda componentes, tokens e documentação.',
  'Aprenda a criar design systems completos e profissionais usando Figma. Cobrimos desde a criação de componentes básicos até sistemas complexos com tokens de design, documentação e guidelines para equipes.',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  120,
  (SELECT id FROM instructors WHERE name = 'Carlos Silva'),
  (SELECT id FROM categories WHERE slug = 'design'),
  (SELECT id FROM difficulty_levels WHERE slug = 'intermediate'),
  true,
  true,
  1890,
  156
),
(
  'Marketing Digital para Iniciantes',
  'marketing-digital-iniciantes',
  'Fundamentos do marketing digital: SEO, redes sociais, email marketing e métricas essenciais.',
  'Curso introdutório ao marketing digital cobrindo os principais canais e estratégias. Aprenda SEO, marketing de conteúdo, redes sociais, email marketing e como medir resultados.',
  'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  90,
  (SELECT id FROM instructors WHERE name = 'Ana Costa'),
  (SELECT id FROM categories WHERE slug = 'marketing'),
  (SELECT id FROM difficulty_levels WHERE slug = 'beginner'),
  false,
  false,
  1245,
  67
),
(
  'Python para Ciência de Dados',
  'python-ciencia-dados',
  'Domine Python para análise de dados com pandas, numpy, matplotlib e scikit-learn.',
  'Curso completo de Python aplicado à ciência de dados. Aprenda manipulação de dados com pandas, visualização com matplotlib/seaborn, e machine learning com scikit-learn.',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  200,
  (SELECT id FROM instructors WHERE name = 'Pedro Santos'),
  (SELECT id FROM categories WHERE slug = 'data'),
  (SELECT id FROM difficulty_levels WHERE slug = 'intermediate'),
  false,
  true,
  987,
  134
),
(
  'Desenvolvimento Mobile com Flutter',
  'flutter-mobile-development',
  'Crie apps nativos para iOS e Android com Flutter. Do básico ao deploy nas lojas.',
  'Aprenda desenvolvimento mobile multiplataforma com Flutter. Cobrimos widgets, navegação, estado, APIs, banco de dados local e deploy para App Store e Google Play.',
  'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  180,
  (SELECT id FROM instructors WHERE name = 'Julia Oliveira'),
  (SELECT id FROM categories WHERE slug = 'mobile'),
  (SELECT id FROM difficulty_levels WHERE slug = 'intermediate'),
  false,
  false,
  756,
  98
),
(
  'Empreendedorismo Digital',
  'empreendedorismo-digital',
  'Como criar e validar ideias de negócio digital. Lean startup, MVP e crescimento.',
  'Guia completo para empreendedores digitais. Aprenda metodologias lean startup, validação de ideias, criação de MVP, métricas de crescimento e captação de investimento.',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  135,
  (SELECT id FROM instructors WHERE name = 'Roberto Lima'),
  (SELECT id FROM categories WHERE slug = 'business'),
  (SELECT id FROM difficulty_levels WHERE slug = 'beginner'),
  false,
  false,
  623,
  45
),
(
  'JavaScript Avançado e ES2024',
  'javascript-avancado-es2024',
  'Domine conceitos avançados de JavaScript e as novidades do ES2024.',
  'Curso avançado de JavaScript cobrindo closures, prototypes, async/await, generators, proxies e todas as novidades do ES2024. Para desenvolvedores que querem dominar a linguagem.',
  'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  145,
  (SELECT id FROM instructors WHERE name = 'Sarah Johnson'),
  (SELECT id FROM categories WHERE slug = 'programming'),
  (SELECT id FROM difficulty_levels WHERE slug = 'advanced'),
  false,
  true,
  1456,
  203
),
(
  'UX Research na Prática',
  'ux-research-pratica',
  'Métodos de pesquisa com usuários: entrevistas, testes de usabilidade e análise de dados.',
  'Aprenda métodos práticos de UX Research. Cobrimos planejamento de pesquisa, entrevistas com usuários, testes de usabilidade, card sorting e análise de dados qualitativos.',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  'https://player.vimeo.com/video/76979871',
  110,
  (SELECT id FROM instructors WHERE name = 'Carlos Silva'),
  (SELECT id FROM categories WHERE slug = 'design'),
  (SELECT id FROM difficulty_levels WHERE slug = 'intermediate'),
  false,
  false,
  834,
  76
);

-- Insert video materials
INSERT INTO video_materials (video_id, title, description, type, url, file_size_mb, icon, order_index) VALUES
-- React 18 Course Materials
((SELECT id FROM videos WHERE slug = 'react-18-completo'), 'Código Fonte Completo', 'Todo o código desenvolvido durante o curso', 'download', 'https://github.com/example/react-18-course', 15.5, 'Download', 1),
((SELECT id FROM videos WHERE slug = 'react-18-completo'), 'Slides da Apresentação', 'Slides em PDF com todos os conceitos', 'download', 'https://example.com/react-slides.pdf', 8.2, 'FileText', 2),
((SELECT id FROM videos WHERE slug = 'react-18-completo'), 'Documentação Oficial React', 'Link para a documentação oficial', 'link', 'https://react.dev', null, 'ExternalLink', 3),
((SELECT id FROM videos WHERE slug = 'react-18-completo'), 'Exercícios Práticos', 'Lista de exercícios para praticar', 'download', 'https://example.com/exercises.zip', 3.1, 'FileText', 4),

-- Design System Materials
((SELECT id FROM videos WHERE slug = 'design-system-figma'), 'Template Figma', 'Template completo do design system', 'link', 'https://figma.com/design-system-template', null, 'ExternalLink', 1),
((SELECT id FROM videos WHERE slug = 'design-system-figma'), 'Guia de Implementação', 'PDF com guia de implementação', 'download', 'https://example.com/implementation-guide.pdf', 12.3, 'FileText', 2),
((SELECT id FROM videos WHERE slug = 'design-system-figma'), 'Tokens de Design', 'Arquivo JSON com tokens', 'download', 'https://example.com/design-tokens.json', 0.5, 'Download', 3),

-- Marketing Digital Materials
((SELECT id FROM videos WHERE slug = 'marketing-digital-iniciantes'), 'Planilha de Métricas', 'Template para acompanhar métricas', 'download', 'https://example.com/metrics-template.xlsx', 2.1, 'FileText', 1),
((SELECT id FROM videos WHERE slug = 'marketing-digital-iniciantes'), 'Checklist SEO', 'Lista de verificação para SEO', 'download', 'https://example.com/seo-checklist.pdf', 1.8, 'FileText', 2),
((SELECT id FROM videos WHERE slug = 'marketing-digital-iniciantes'), 'Google Analytics', 'Link para configuração', 'link', 'https://analytics.google.com', null, 'ExternalLink', 3),

-- Python Data Science Materials
((SELECT id FROM videos WHERE slug = 'python-ciencia-dados'), 'Notebooks Jupyter', 'Todos os notebooks do curso', 'download', 'https://github.com/example/python-data-science', 25.7, 'Download', 1),
((SELECT id FROM videos WHERE slug = 'python-ciencia-dados'), 'Datasets de Exemplo', 'Conjuntos de dados para prática', 'download', 'https://example.com/datasets.zip', 45.2, 'Download', 2),
((SELECT id FROM videos WHERE slug = 'python-ciencia-dados'), 'Cheat Sheet Pandas', 'Guia rápido do Pandas', 'download', 'https://example.com/pandas-cheatsheet.pdf', 2.3, 'FileText', 3),

-- Flutter Materials
((SELECT id FROM videos WHERE slug = 'flutter-mobile-development'), 'Projeto Completo', 'Código fonte do app desenvolvido', 'download', 'https://github.com/example/flutter-app', 18.9, 'Download', 1),
((SELECT id FROM videos WHERE slug = 'flutter-mobile-development'), 'Guia de Deploy', 'Como publicar nas lojas', 'download', 'https://example.com/deploy-guide.pdf', 5.4, 'FileText', 2),
((SELECT id FROM videos WHERE slug = 'flutter-mobile-development'), 'Flutter Documentation', 'Documentação oficial', 'link', 'https://flutter.dev', null, 'ExternalLink', 3);

-- Insert some sample upvotes (simulating user interactions)
-- Note: These would normally be created by actual user interactions
-- We'll create a few sample ones for demonstration