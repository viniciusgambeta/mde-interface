/*
  # Sistema de Comentários

  1. Nova Tabela
    - `comments`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key para videos)
      - `assinatura_id` (text, foreign key para assinaturas)
      - `content` (text, conteúdo do comentário)
      - `parent_comment_id` (uuid, para respostas)
      - `reply_count` (integer, contador de respostas)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `comments`
    - Políticas para CRUD baseadas em assinatura ativa
    - Usuários podem criar/ler comentários se têm assinatura
    - Usuários podem deletar apenas próprios comentários

  3. Triggers
    - Atualização automática de reply_count
    - Atualização de updated_at
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  assinatura_id text NOT NULL,
  content text NOT NULL,
  parent_comment_id uuid,
  reply_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE comments 
ADD CONSTRAINT comments_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_assinatura_id_fkey 
FOREIGN KEY (assinatura_id) REFERENCES assinaturas("ID da assinatura") ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_parent_comment_id_fkey 
FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_assinatura_id ON comments(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read all comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments if they have active subscription"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE "ID da assinatura" = assinatura_id 
      AND user_id = auth.uid()
      AND "Status da assinatura" = 'active'
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
      SET reply_count = reply_count - 1,
          updated_at = now()
      WHERE id = OLD.parent_comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_comment_reply_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reply_count();

CREATE TRIGGER update_comments_updated_at_trigger
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();