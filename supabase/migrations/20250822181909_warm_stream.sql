/*
  # Insert video_versions relationships

  1. Relationships Created
    - React Tutorial group (3 versions)
    - JavaScript group (2 versions) 
    - CSS Layout group (3 versions)
    - Design System group (2 versions)
    - Node.js API group (2 versions)
    - React Prompts group (2 versions)

  2. Structure
    - Each group has one main video
    - Other videos are versions of the main video
    - Proper version names and ordering
*/

-- React Tutorial Group (3 versions)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  CASE 
    WHEN version.slug = 'react-hooks-avancado' THEN 'Versão Hooks'
    WHEN version.slug = 'react-typescript-completo' THEN 'Versão TypeScript'
  END as version_name,
  CASE 
    WHEN version.slug = 'react-hooks-avancado' THEN 1
    WHEN version.slug = 'react-typescript-completo' THEN 2
  END as version_order
FROM 
  (SELECT id FROM videos WHERE slug = 'react-do-zero-ao-avancado' LIMIT 1) main,
  videos version
WHERE version.slug IN ('react-hooks-avancado', 'react-typescript-completo');

-- JavaScript Group (2 versions)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  'Versão Vanilla' as version_name,
  1 as version_order
FROM 
  (SELECT id FROM videos WHERE slug = 'javascript-es6-moderno' LIMIT 1) main,
  (SELECT id FROM videos WHERE slug = 'javascript-vanilla-puro' LIMIT 1) version;

-- CSS Layout Group (3 versions)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  CASE 
    WHEN version.slug = 'css-responsivo-mobile' THEN 'Versão Responsiva'
    WHEN version.slug = 'css-animacoes-modernas' THEN 'Versão Animações'
  END as version_name,
  CASE 
    WHEN version.slug = 'css-responsivo-mobile' THEN 1
    WHEN version.slug = 'css-animacoes-modernas' THEN 2
  END as version_order
FROM 
  (SELECT id FROM videos WHERE slug = 'css-flexbox-grid-completo' LIMIT 1) main,
  videos version
WHERE version.slug IN ('css-responsivo-mobile', 'css-animacoes-modernas');

-- Design System Group (2 versions)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  'Versão Adobe XD' as version_name,
  1 as version_order
FROM 
  (SELECT id FROM videos WHERE slug = 'design-system-figma' LIMIT 1) main,
  (SELECT id FROM videos WHERE slug = 'design-system-adobe-xd' LIMIT 1) version;

-- Node.js API Group (2 versions)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  'Versão GraphQL' as version_name,
  1 as version_order
FROM 
  (SELECT id FROM videos WHERE slug = 'nodejs-api-rest' LIMIT 1) main,
  (SELECT id FROM videos WHERE slug = 'nodejs-graphql-api' LIMIT 1) version;

-- React Prompts Group (2 versions)
INSERT INTO video_versions (main_video_id, version_video_id, version_name, version_order)
SELECT 
  main.id as main_video_id,
  version.id as version_video_id,
  'Versão Avançada' as version_name,
  1 as version_order
FROM 
  (SELECT id FROM videos WHERE slug = 'react-prompts-basicos' LIMIT 1) main,
  (SELECT id FROM videos WHERE slug = 'react-prompts-avancados' LIMIT 1) version;