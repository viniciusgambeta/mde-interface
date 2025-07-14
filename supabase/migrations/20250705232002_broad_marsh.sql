/*
  # Remove public.users table and use only auth.users

  1. Changes
    - Drop public.users table and all related triggers/functions
    - Use auth.users with user_metadata for custom fields
    - Simplify authentication flow

  2. Benefits
    - Eliminates data duplication
    - Reduces complexity
    - Uses Supabase's built-in user management
    - No more sync issues between tables
*/

-- Remove all triggers and functions related to public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop the public.users table completely
DROP TABLE IF EXISTS users CASCADE;

-- We'll now use auth.users exclusively with user_metadata for custom fields
-- No additional setup needed - auth.users handles everything