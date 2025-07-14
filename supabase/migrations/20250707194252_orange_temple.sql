/*
  # Adicionar campo prompt na tabela videos

  1. Novo Campo
    - `prompt_content` - Campo de texto para armazenar o conteúdo do prompt
    - Apenas para videos do tipo 'prompt'

  2. Atualizações
    - Migrar conteúdo existente da descrição para o novo campo prompt
    - Manter descrição para informações gerais
*/

-- Adicionar coluna prompt_content na tabela videos
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS prompt_content text;

-- Migrar conteúdo dos prompts existentes da descrição para o novo campo
UPDATE videos 
SET prompt_content = description
WHERE tipo = 'prompt' AND prompt_content IS NULL;

-- Atualizar descrições dos prompts para serem mais informativas
UPDATE videos 
SET description = 'Este prompt foi desenvolvido para ajudar você a ' || 
  CASE 
    WHEN title ILIKE '%landing page%' THEN 'criar landing pages altamente eficazes usando ferramentas de IA como ChatGPT, Claude ou Gemini.'
    WHEN title ILIKE '%análise%dados%' THEN 'realizar análise exploratória de dados de forma sistemática e profissional usando Python.'
    WHEN title ILIKE '%design%interface%' THEN 'criar interfaces modernas e centradas no usuário seguindo as melhores práticas de UX/UI.'
    ELSE 'resolver problemas específicos usando inteligência artificial de forma eficiente.'
  END
WHERE tipo = 'prompt';

-- Inserir conteúdo de prompt de exemplo para os prompts existentes
UPDATE videos 
SET prompt_content = 'Você é um especialista em criação de landing pages de alta conversão. Crie uma landing page completa para [PRODUTO/SERVIÇO] seguindo esta estrutura:

## HEADLINE PRINCIPAL
- Crie um headline que capture atenção em 3 segundos
- Use a fórmula: Benefício + Para quem + Diferencial
- Máximo 10 palavras

## SUBHEADLINE
- Explique o benefício principal em 1-2 frases
- Seja específico sobre o resultado que o cliente terá

## SEÇÃO DE BENEFÍCIOS
Liste 3 benefícios principais:
1. [Benefício 1] - Como isso resolve um problema específico
2. [Benefício 2] - Como isso economiza tempo/dinheiro
3. [Benefício 3] - Como isso melhora a vida do cliente

## PROVA SOCIAL
- 2-3 depoimentos específicos com nome e resultado
- Números de clientes atendidos ou resultados alcançados
- Logos de empresas conhecidas (se aplicável)

## CALL TO ACTION
- Botão principal: Verbo de ação + Benefício
- Criar senso de urgência sem ser agressivo
- Oferecer garantia ou teste grátis

## SEÇÃO DE OBJEÇÕES
Responda as 3 principais objeções:
1. "É muito caro" - Mostre ROI
2. "Não tenho tempo" - Mostre facilidade
3. "Não vai funcionar para mim" - Mostre casos similares

Adapte todo o conteúdo para o tom de voz: [PROFISSIONAL/CASUAL/TÉCNICO] e para o público-alvo: [DESCREVER PERSONA].'
WHERE tipo = 'prompt' AND title ILIKE '%landing page%';

UPDATE videos 
SET prompt_content = 'Você é um cientista de dados experiente. Realize uma análise exploratória completa do dataset fornecido seguindo esta estrutura:

## 1. CARREGAMENTO E INSPEÇÃO INICIAL
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Carregar dados
df = pd.read_csv("seu_dataset.csv")

# Inspeção básica
print("Shape do dataset:", df.shape)
print("\nTipos de dados:")
print(df.dtypes)
print("\nPrimeiras 5 linhas:")
print(df.head())
```

## 2. ANÁLISE DE QUALIDADE DOS DADOS
```python
# Verificar valores faltantes
print("Valores faltantes por coluna:")
print(df.isnull().sum())

# Verificar duplicatas
print(f"\nLinhas duplicadas: {df.duplicated().sum()}")

# Estatísticas descritivas
print("\nEstatísticas descritivas:")
print(df.describe())
```

## 3. ANÁLISE UNIVARIADA
Para cada variável numérica:
- Histograma com distribuição
- Box plot para identificar outliers
- Estatísticas de tendência central e dispersão

Para cada variável categórica:
- Gráfico de barras com frequências
- Análise de cardinalidade

## 4. ANÁLISE BIVARIADA
- Matriz de correlação para variáveis numéricas
- Scatter plots para relações interessantes
- Box plots para variáveis categóricas vs numéricas

## 5. INSIGHTS E RECOMENDAÇÕES
Com base na análise, forneça:
- 3 principais insights descobertos
- Problemas de qualidade identificados
- Recomendações para próximos passos
- Variáveis mais importantes para análise futura

Adapte o código para o seu dataset específico: [DESCREVER DATASET E OBJETIVO]'
WHERE tipo = 'prompt' AND title ILIKE '%análise%dados%';

UPDATE videos 
SET prompt_content = 'Você é um designer UX/UI experiente. Crie especificações completas para uma interface moderna seguindo esta estrutura:

## 1. DEFINIÇÃO DO PROJETO
- Tipo de interface: [Web App/Mobile App/Dashboard]
- Público-alvo: [Descrever persona]
- Objetivo principal: [Ação que o usuário deve realizar]

## 2. ARQUITETURA DA INFORMAÇÃO
### Navegação Principal:
- [Item 1] - Função e conteúdo
- [Item 2] - Função e conteúdo
- [Item 3] - Função e conteúdo

### Hierarquia de Conteúdo:
1. Nível 1: Elementos mais importantes
2. Nível 2: Informações de apoio
3. Nível 3: Detalhes e ações secundárias

## 3. SISTEMA DE DESIGN

### Tipografia:
- Heading 1: [Font] 32px, weight 700
- Heading 2: [Font] 24px, weight 600
- Body: [Font] 16px, weight 400
- Caption: [Font] 14px, weight 400

### Cores:
- Primary: #[HEX] - Para CTAs principais
- Secondary: #[HEX] - Para elementos de apoio
- Success: #[HEX] - Para confirmações
- Warning: #[HEX] - Para alertas
- Error: #[HEX] - Para erros
- Neutral: #[HEX] - Para textos e bordas

### Espaçamento:
- Base unit: 8px
- Pequeno: 8px
- Médio: 16px
- Grande: 24px
- Extra grande: 32px

## 4. COMPONENTES PRINCIPAIS

### Botões:
- Primary: Cor primária, texto branco, border-radius 8px
- Secondary: Fundo transparente, borda cor primária
- Tamanhos: Small (32px), Medium (40px), Large (48px)

### Cards:
- Background: Branco/Cinza claro
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Border-radius: 12px
- Padding: 24px

### Forms:
- Input height: 48px
- Border: 1px solid #E5E5E5
- Focus state: Border cor primária
- Error state: Border vermelha + mensagem

## 5. LAYOUT RESPONSIVO

### Desktop (1200px+):
- Grid: 12 colunas
- Container: 1200px max-width
- Sidebar: 280px (se aplicável)

### Tablet (768px - 1199px):
- Grid: 8 colunas
- Container: 100% width
- Navegação: Collapse menu

### Mobile (320px - 767px):
- Grid: 4 colunas
- Stack vertical
- Bottom navigation (se aplicável)

## 6. MICROINTERAÇÕES
- Hover states: Opacity 0.8 ou scale 1.05
- Loading states: Skeleton screens
- Transitions: 200ms ease-in-out
- Focus indicators: Outline 2px cor primária

Adapte todas as especificações para: [TIPO DE PROJETO E REQUISITOS ESPECÍFICOS]'
WHERE tipo = 'prompt' AND title ILIKE '%design%interface%';