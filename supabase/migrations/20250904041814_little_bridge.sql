/*
  # Add index for assinaturas.user_id

  1. Performance Optimization
    - Add unique index on user_id column to prevent full table scans
    - Ensures fast lookups when fetching user data
    - Prevents duplicate user_id entries

  2. Data Integrity
    - Enforces uniqueness constraint on user_id
    - One assinatura record per user
*/

-- Add unique index on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'assinaturas' 
    AND indexname = 'assinaturas_user_id_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX assinaturas_user_id_unique_idx ON assinaturas(user_id);
    RAISE NOTICE 'Created unique index on assinaturas.user_id';
  ELSE
    RAISE NOTICE 'Index assinaturas_user_id_unique_idx already exists';
  END IF;
END $$;