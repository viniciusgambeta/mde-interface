/*
  # Sistema de Comentários

  1. Nova Tabela
    - `comments`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key para videos)
      - `assinatura_id` (text, foreign key para assinaturas)
      - `content` (text, conteúdo do comentário)
      - `parent_comment_id` (uuid, para respostas aninhadas)
      - `reply_count` (integer, contador de respostas)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `comments`
    - Políticas para usuários autenticados poderem criar/ler/atualizar/deletar comentários
    - Usuários só podem deletar seus próprios comentários

  3. Performance
    - Índices para video_id, assinatura_id, parent_comment_id
    - Índice para consultas hierárquicas

  4. Triggers
    - Atualização automática de reply_count
    - Atualização automática de updated_at
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  assinatura_id text NOT NULL,
  content text NOT NULL,
  parent_comment_id uuid DEFAULT NULL,
  reply_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT fk_comments_video 
    FOREIGN KEY (video_id) 
    REFERENCES videos(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_comments_assinatura 
    FOREIGN KEY (assinatura_id) 
    REFERENCES assinaturas("ID da assinatura") 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_comments_parent 
    FOREIGN KEY (parent_comment_id) 
    REFERENCES comments(id) 
    ON DELETE CASCADE,
    
  -- Check constraints
  CONSTRAINT check_content_length 
    CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
    
  CONSTRAINT check_no_self_reply 
    CHECK (id != parent_comment_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_assinatura_id ON comments(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(video_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_hierarchy ON comments(video_id, parent_comment_id, created_at);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE "ID da assinatura" = assinatura_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE "ID da assinatura" = assinatura_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE "ID da assinatura" = assinatura_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE "ID da assinatura" = assinatura_id 
      AND user_id = auth.uid()
    )
  );

-- Function to update reply count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment reply count for parent comment
    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE comments 
      SET reply_count = reply_count + 1,
          updated_at = now()
      WHERE id = NEW.parent_comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement reply count for parent comment
    IF OLD.parent_comment_id IS NOT NULL THEN
      UPDATE comments 
      SET reply_count = GREATEST(reply_count - 1, 0),
          updated_at = now()
      WHERE id = OLD.parent_comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reply count updates
DROP TRIGGER IF EXISTS trigger_update_reply_count ON comments;
CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reply_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_comments_updated_at ON comments;
CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();