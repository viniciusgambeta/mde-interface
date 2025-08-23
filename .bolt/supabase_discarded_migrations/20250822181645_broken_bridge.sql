/*
  # Create comprehensive dummy data for testing video versions

  1. New Data
    - Categories for different topics
    - Difficulty levels (Iniciante, Intermediário, Avançado)
    - Instructors with social media
    - Videos with different types (video, prompt, live)
    - Video versions relationships
    - Video materials for downloads/links
    - Featured content for homepage

  2. Version Groups Created
    - React Tutorial Series (3 versions)
    - JavaScript Fundamentals (2 versions)
    - CSS Layout Techniques (3 versions)
    - Design System Creation (2 versions)
    - Node.js API Development (2 versions)
*/

-- Insert Categories
INSERT INTO categories (id, name, slug, description, icon, color) VALUES
('cat-programming', 'Programação', 'programming', 'Tutoriais de programação e desenvolvimento', '💻', '#3b82f6'),
('cat-design', 'Design', 'design', 'Design UI/UX e ferramentas visuais', '🎨', '#f59e0b'),
('cat-marketing', 'Marketing', 'marketing', 'Marketing digital e estratégias', '📈', '#10b981'),
('cat-business', 'Negócios', 'business', 'Empreendedorismo e gestão', '💼', '#8b5cf6'),
('cat-data', 'Ciência de Dados', 'data', 'Análise de dados e IA', '📊', '#ef4444')
ON CONFLICT (id) DO NOTHING;

-- Insert Difficulty Levels
INSERT INTO difficulty_levels (id, name, slug, order_index, color) VALUES
('diff-beginner', 'Iniciante', 'iniciante', 1, '#10b981'),
('diff-intermediate', 'Intermediário', 'intermediario', 2, '#f59e0b'),
('diff-advanced', 'Avançado', 'avancado', 3, '#ef4444')
ON CONFLICT (id) DO NOTHING;

-- Insert Instructors
INSERT INTO instructors (id, name, bio, avatar_url, social_instagram, social_linkedin, social_github, is_verified) VALUES
('inst-joao', 'João Silva', 'Desenvolvedor Full Stack com 8 anos de experiência', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'joaodev', 'joao-silva-dev', 'joaosilva', true),
('inst-maria', 'Maria Santos', 'Designer UX/UI especialista em sistemas complexos', 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'mariadesign', 'maria-santos-ux', 'mariasantos', true),
('inst-pedro', 'Pedro Costa', 'Especialista em JavaScript e Node.js', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'pedrojs', 'pedro-costa-js', 'pedrocosta', true),
('inst-ana', 'Ana Oliveira', 'Marketing Digital e Growth Hacking', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'anamarketing', 'ana-oliveira-marketing', 'anaoliveira', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Main Videos (these will be the "main" videos in version groups)
INSERT INTO videos (id, title, slug, summary, description, thumbnail_url, video_url, duration_minutes, instructor_id, category_id, difficulty_level_id, is_featured, is_premium, view_count, upvote_count, tipo, status) VALUES
-- React Tutorial Series (Main)
('video-react-main', 'React do Zero ao Avançado', 'react-do-zero-ao-avancado', 'Aprenda React desde o básico até conceitos avançados', 'Neste curso completo de React, você vai aprender desde os conceitos básicos como componentes e props, até tópicos avançados como hooks customizados, context API e otimização de performance.

Tópicos abordados:
- Componentes funcionais e de classe
- Props e state
- Hooks (useState, useEffect, useContext)
- Roteamento com React Router
- Gerenciamento de estado
- Testes com Jest e Testing Library', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 180, 'inst-joao', 'cat-programming', 'diff-intermediate', true, false, 1250, 89, 'video', 'published'),

-- JavaScript Fundamentals (Main)
('video-js-main', 'JavaScript Moderno - ES6+', 'javascript-moderno-es6', 'Domine as funcionalidades modernas do JavaScript', 'Aprenda todas as funcionalidades modernas do JavaScript ES6+ que todo desenvolvedor precisa conhecer.

Conteúdo do curso:
- Arrow functions e template literals
- Destructuring e spread operator
- Promises e async/await
- Modules (import/export)
- Classes e herança
- Map, Set e WeakMap', 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 120, 'inst-pedro', 'cat-programming', 'diff-intermediate', false, false, 890, 67, 'video', 'published'),

-- CSS Layout Techniques (Main)
('video-css-main', 'CSS Grid e Flexbox Completo', 'css-grid-flexbox-completo', 'Domine as técnicas modernas de layout CSS', 'Aprenda a criar layouts modernos e responsivos usando CSS Grid e Flexbox.

O que você vai aprender:
- Fundamentos do Flexbox
- CSS Grid Layout
- Responsive design
- Técnicas avançadas de posicionamento
- Casos práticos e projetos', 'https://images.pexels.com/photos/6424586/pexels-photo-6424586.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 95, 'inst-joao', 'cat-programming', 'diff-beginner', false, false, 654, 45, 'video', 'published'),

-- Design System (Main)
('video-design-main', 'Criando Design Systems no Figma', 'criando-design-systems-figma', 'Aprenda a criar design systems escaláveis', 'Neste curso você vai aprender a criar design systems completos e escaláveis usando o Figma.

Tópicos abordados:
- Fundamentos de design systems
- Atomic design methodology
- Criação de componentes no Figma
- Tokens de design
- Documentação e handoff', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 140, 'inst-maria', 'cat-design', 'diff-intermediate', false, true, 432, 38, 'video', 'published'),

-- Node.js API (Main)
('video-node-main', 'API REST com Node.js e Express', 'api-rest-nodejs-express', 'Construa APIs robustas com Node.js', 'Aprenda a criar APIs REST completas e seguras usando Node.js e Express.

Conteúdo:
- Configuração do ambiente Node.js
- Express.js fundamentals
- Middleware e roteamento
- Banco de dados com MongoDB
- Autenticação JWT
- Testes automatizados', 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 200, 'inst-pedro', 'cat-programming', 'diff-advanced', false, true, 789, 56, 'video', 'published')
ON CONFLICT (id) DO NOTHING;

-- Insert Version Videos (alternative versions)
INSERT INTO videos (id, title, slug, summary, description, thumbnail_url, video_url, duration_minutes, instructor_id, category_id, difficulty_level_id, is_featured, is_premium, view_count, upvote_count, tipo, status) VALUES
-- React Versions
('video-react-hooks', 'React Hooks na Prática', 'react-hooks-na-pratica', 'Versão focada em React Hooks', 'Versão especializada do curso de React focando exclusivamente em Hooks e suas aplicações práticas.

Hooks abordados:
- useState e useEffect
- useContext e useReducer
- useMemo e useCallback
- Hooks customizados
- Padrões avançados', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 90, 'inst-joao', 'cat-programming', 'diff-intermediate', false, false, 567, 42, 'video', 'published'),

('video-react-typescript', 'React com TypeScript', 'react-com-typescript', 'React + TypeScript do zero', 'Aprenda a usar React com TypeScript para criar aplicações mais robustas e escaláveis.

Conteúdo:
- Configuração do ambiente
- Tipagem de componentes
- Props e state tipados
- Hooks com TypeScript
- Padrões avançados', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 150, 'inst-joao', 'cat-programming', 'diff-advanced', false, true, 423, 35, 'video', 'published'),

-- JavaScript Version
('video-js-vanilla', 'JavaScript Vanilla - Sem Frameworks', 'javascript-vanilla-sem-frameworks', 'JavaScript puro sem dependências', 'Aprenda JavaScript puro sem frameworks ou bibliotecas externas.

Foco em:
- DOM manipulation
- Event handling
- AJAX e Fetch API
- Local Storage
- Padrões de design
- Performance optimization', 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 110, 'inst-pedro', 'cat-programming', 'diff-beginner', false, false, 345, 28, 'video', 'published'),

-- CSS Versions
('video-css-responsive', 'CSS Responsivo Avançado', 'css-responsivo-avancado', 'Técnicas avançadas de responsive design', 'Domine técnicas avançadas de CSS responsivo para criar layouts que funcionam em qualquer dispositivo.

Técnicas:
- Mobile-first approach
- Breakpoints inteligentes
- Container queries
- Fluid typography
- Advanced media queries', 'https://images.pexels.com/photos/6424586/pexels-photo-6424586.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 85, 'inst-joao', 'cat-programming', 'diff-intermediate', false, false, 298, 22, 'video', 'published'),

('video-css-animations', 'Animações CSS Profissionais', 'animacoes-css-profissionais', 'Crie animações incríveis com CSS', 'Aprenda a criar animações CSS profissionais que encantam usuários.

Conteúdo:
- Transitions e transforms
- Keyframes animations
- Performance optimization
- Micro-interactions
- Loading animations', 'https://images.pexels.com/photos/6424586/pexels-photo-6424586.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 75, 'inst-maria', 'cat-design', 'diff-intermediate', false, false, 412, 31, 'video', 'published'),

-- Design Version
('video-design-adobe', 'Design System com Adobe XD', 'design-system-adobe-xd', 'Versão para Adobe XD', 'Aprenda a criar design systems usando Adobe XD como ferramenta principal.

Diferenças do Figma:
- Interface do Adobe XD
- Componentes e estados
- Prototipagem avançada
- Plugins essenciais
- Workflow de handoff', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 125, 'inst-maria', 'cat-design', 'diff-intermediate', false, true, 234, 19, 'video', 'published'),

-- Node.js Version
('video-node-graphql', 'API GraphQL com Node.js', 'api-graphql-nodejs', 'Versão com GraphQL', 'Aprenda a criar APIs GraphQL modernas com Node.js.

Tecnologias:
- Apollo Server
- GraphQL Schema
- Resolvers e mutations
- Subscriptions em tempo real
- Integração com bancos de dados', 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 180, 'inst-pedro', 'cat-programming', 'diff-advanced', false, true, 356, 29, 'video', 'published')
ON CONFLICT (id) DO NOTHING;

-- Insert Video Versions Relationships
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order) VALUES
-- React Tutorial Group
('video-react-main', 'video-react-hooks', 'Versão Hooks', 1),
('video-react-main', 'video-react-typescript', 'Versão TypeScript', 2),

-- JavaScript Group
('video-js-main', 'video-js-vanilla', 'Versão Vanilla', 1),

-- CSS Group
('video-css-main', 'video-css-responsive', 'Versão Responsiva', 1),
('video-css-main', 'video-css-animations', 'Versão Animações', 2),

-- Design Group
('video-design-main', 'video-design-adobe', 'Versão Adobe XD', 1),

-- Node.js Group
('video-node-main', 'video-node-graphql', 'Versão GraphQL', 1)
ON CONFLICT (main_video_id, version_video_id) DO NOTHING;

-- Insert Video Materials
INSERT INTO video_materials (video_id, title, description, type, url, file_size_mb, icon, order_index) VALUES
-- React Main Materials
('video-react-main', 'Código Fonte Completo', 'Todo o código desenvolvido durante o curso', 'download', 'https://github.com/exemplo/react-curso', 15.5, 'Download', 1),
('video-react-main', 'Slides da Apresentação', 'Slides em PDF com resumo dos conceitos', 'download', 'https://exemplo.com/slides-react.pdf', 8.2, 'FileText', 2),
('video-react-main', 'Documentação Oficial', 'Link para documentação do React', 'link', 'https://reactjs.org/docs', null, 'ExternalLink', 3),

-- JavaScript Materials
('video-js-main', 'Exercícios Práticos', 'Lista de exercícios para praticar', 'download', 'https://exemplo.com/exercicios-js.zip', 5.1, 'Download', 1),
('video-js-main', 'Cheat Sheet ES6+', 'Resumo das funcionalidades ES6+', 'download', 'https://exemplo.com/es6-cheatsheet.pdf', 2.3, 'FileText', 2),

-- CSS Materials
('video-css-main', 'Templates HTML', 'Templates para praticar layouts', 'download', 'https://exemplo.com/templates-css.zip', 12.8, 'Download', 1),
('video-css-main', 'CSS Grid Generator', 'Ferramenta online para CSS Grid', 'link', 'https://cssgrid-generator.netlify.app/', null, 'ExternalLink', 2),

-- Design Materials
('video-design-main', 'Kit de Componentes', 'Biblioteca de componentes Figma', 'link', 'https://figma.com/community/file/exemplo', null, 'ExternalLink', 1),
('video-design-main', 'Guia de Estilo', 'Template de guia de estilo', 'download', 'https://exemplo.com/style-guide.fig', 25.6, 'Download', 2),

-- Node.js Materials
('video-node-main', 'Projeto Base', 'Estrutura inicial do projeto', 'download', 'https://github.com/exemplo/nodejs-api', 8.9, 'Download', 1),
('video-node-main', 'Postman Collection', 'Coleção para testar a API', 'download', 'https://exemplo.com/api-collection.json', 1.2, 'FileText', 2)
ON CONFLICT (id) DO NOTHING;

-- Insert Featured Content
INSERT INTO featured_content (titulo, descricao, tag, nome_botao, link_botao, status, imagem_background) VALUES
('Domine React em 2024', 'Aprenda React do zero ao avançado com projetos práticos e as melhores práticas do mercado. Curso completo com mais de 10 horas de conteúdo.', 'NOVO CURSO', 'Começar Agora', 'https://exemplo.com/curso-react', true, 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')
ON CONFLICT DO NOTHING;

-- Insert some prompts for testing
INSERT INTO videos (id, title, slug, summary, description, thumbnail_url, duration_minutes, instructor_id, category_id, difficulty_level_id, is_featured, is_premium, view_count, upvote_count, tipo, prompt_content, status) VALUES
('prompt-react-main', 'Prompts para Desenvolvimento React', 'prompts-desenvolvimento-react', 'Prompts de IA para acelerar desenvolvimento React', 'Coleção de prompts otimizados para desenvolvimento React usando IA.', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 15, 'inst-joao', 'cat-programming', 'diff-intermediate', false, false, 234, 18, 'prompt', 'Você é um especialista em React. Crie um componente funcional que:

1. Receba props tipadas com TypeScript
2. Use hooks useState e useEffect
3. Implemente loading states
4. Tenha tratamento de erro
5. Seja responsivo com Tailwind CSS

Componente: [DESCREVA O COMPONENTE]

Inclua:
- Código completo
- Comentários explicativos
- Boas práticas de performance
- Testes unitários básicos', 'published'),

('prompt-react-advanced', 'Prompts React Avançados', 'prompts-react-avancados', 'Prompts para padrões avançados React', 'Prompts especializados para desenvolvimento React avançado.', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=640&h=960&fit=crop', 20, 'inst-joao', 'cat-programming', 'diff-advanced', false, true, 156, 12, 'prompt', 'Você é um arquiteto de software React sênior. Crie uma solução completa que:

1. Use Context API + useReducer para estado global
2. Implemente custom hooks reutilizáveis
3. Otimize performance com React.memo e useMemo
4. Use Suspense e Error Boundaries
5. Implemente lazy loading de componentes

Requisitos: [DESCREVA OS REQUISITOS]

Forneça:
- Arquitetura da solução
- Código dos principais componentes
- Estratégias de otimização
- Padrões de teste', 'published')
ON CONFLICT (id) DO NOTHING;

-- Insert prompt versions
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order) VALUES
('prompt-react-main', 'prompt-react-advanced', 'Versão Avançada', 1)
ON CONFLICT (main_video_id, version_video_id) DO NOTHING;