/*
  # Add user fields to assinaturas table

  1. New Columns
    - `user_id` (uuid, nullable) - Links to auth.users.id
    - `cadastro_mde` (boolean, default false) - Tracks if user has registered

  2. Foreign Key
    - Add foreign key constraint linking user_id to auth.users.id

  3. Index
    - Add index on user_id for better query performance
*/

-- Add user_id column to link subscriptions to users
ALTER TABLE assinaturas 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add cadastro_mde column to track registration status
ALTER TABLE assinaturas 
ADD COLUMN IF NOT EXISTS cadastro_mde boolean DEFAULT false;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_user_id ON assinaturas(user_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_cadastro_mde ON assinaturas(cadastro_mde);

-- Add index for email lookups (commonly used in registration)
CREATE INDEX IF NOT EXISTS idx_assinaturas_email ON assinaturas("Email do cliente");
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas("Status da assinatura");