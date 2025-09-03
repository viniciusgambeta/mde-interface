```sql
-- Start Transaction
BEGIN;

-- Step 0: Add user_id column to comments table and populate it
-- This is crucial if comments.assinatura_id was previously referencing assinaturas."ID da assinatura"
-- and we want comments to directly reference auth.users.id via assinaturas.user_id.
-- First, add the new user_id column to comments
ALTER TABLE public.comments
ADD COLUMN user_id UUID;

-- Populate the new user_id column by joining with assinaturas
-- This assumes that comments.assinatura_id correctly links to assinaturas."ID da assinatura"
UPDATE public.comments AS c
SET user_id = a.user_id
FROM public.assinaturas AS a
WHERE c.assinatura_id = a."ID da assinatura";

-- Make user_id NOT NULL if all existing comments have a user_id
-- You might need to adjust this based on your data. If there are comments without a linked user,
-- this step will fail. Consider setting a default or handling nulls.
-- For now, I'll assume all comments should have a user.
ALTER TABLE public.comments
ALTER COLUMN user_id SET NOT NULL;

-- Drop the old foreign key constraint on comments.assinatura_id
ALTER TABLE public.comments
DROP CONSTRAINT comments_assinatura_id_fkey;

-- Drop the old index on comments.assinatura_id
DROP INDEX IF EXISTS idx_comments_assinatura_id;

-- Drop the old assinatura_id column from comments
ALTER TABLE public.comments
DROP COLUMN assinatura_id;

-- Add new foreign key constraint from comments.user_id to public.assinaturas.user_id
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.assinaturas(user_id) ON DELETE CASCADE;

-- Add an index on the new user_id column in comments
CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


-- Step 1: Add new columns to public.assinaturas
ALTER TABLE public.assinaturas
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Step 2: Update existing public.assinaturas records with data from public.profiles
-- This handles cases where a user already has an entry in both tables.
UPDATE public.assinaturas AS a
SET
    "Nome do cliente" = p.name,
    avatar_usuario = p.avatar_url,
    "Status da assinatura" = CASE WHEN p.is_premium THEN 'active' ELSE 'free' END,
    "Telefone do cliente" = p.phone_number,
    bio = p.bio,
    score = p.score,
    onboarding_completed = p.onboarding_completed,
    onboarding_data = p.onboarding_data
FROM public.profiles AS p
WHERE a.user_id = p.id;

-- Step 3: Insert new public.assinaturas records for profiles entries without a matching assinaturas record
-- This handles users who only have a profiles entry but no assinaturas entry.
INSERT INTO public.assinaturas (
    user_id,
    "Nome do cliente",
    "Email do cliente",
    avatar_usuario,
    "Telefone do cliente",
    bio,
    score,
    onboarding_completed,
    onboarding_data,
    "ID da assinatura",
    "Status da assinatura",
    "Plano",
    "Data de criação"
)
SELECT
    p.id,
    p.name,
    au.email, -- Fetch email from auth.users
    p.avatar_url,
    p.phone_number,
    p.bio,
    p.score,
    p.onboarding_completed,
    p.onboarding_data,
    gen_random_uuid()::text, -- Generate a new unique ID for the subscription
    CASE WHEN p.is_premium THEN 'active' ELSE 'free' END, -- Map is_premium to Status da assinatura
    'Free Plan', -- Default plan for newly inserted profiles
    now()::date -- Default creation date
FROM public.profiles AS p
JOIN auth.users AS au ON p.id = au.id -- Join to get email
LEFT JOIN public.assinaturas AS a ON p.id = a.user_id
WHERE a.user_id IS NULL;

-- Step 4: Clean up duplicate assinaturas records before adding unique constraint
-- This keeps the most recently created subscription for each user_id.
DELETE FROM public.assinaturas
WHERE "ID da assinatura" IN (
    SELECT "ID da assinatura"
    FROM (
        SELECT
            "ID da assinatura",
            user_id,
            ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY "Data de criação" DESC, "ID da assinatura" DESC) as rn
        FROM public.assinaturas
        WHERE user_id IS NOT NULL
    ) t
    WHERE t.rn > 1
);

-- Step 5: Add UNIQUE constraint on user_id in public.assinaturas
ALTER TABLE public.assinaturas
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Step 6: Drop foreign key constraint from public.profiles to auth.users
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_id_fkey;

-- Step 7: Drop the public.profiles table
DROP TABLE public.profiles;

-- Step 8: Update RLS policies for public.assinaturas
-- Revoke existing broad policy
DROP POLICY IF EXISTS policies_assinaturas ON public.assinaturas;

-- Add new RLS policies for public.assinaturas
CREATE POLICY "Enable read access for authenticated users on their own record"
ON public.assinaturas
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users on their own record"
ON public.assinaturas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users on their own record"
ON public.assinaturas
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users on their own record"
ON public.assinaturas
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 9: Update RLS policies for public.comments
-- Drop existing policies on comments
DROP POLICY IF EXISTS "Users can create comments if they have active subscription" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can read all comments" ON public.comments;
DROP POLICY IF EXISTS "policycerta" ON public.comments; -- Assuming this is the broad public policy

-- Re-create policies for comments table
-- Enable read access for all users (public)
CREATE POLICY "Public can read comments"
ON public.comments
FOR SELECT
TO public
USING (true);

-- Enable insert for authenticated users if they have an active subscription
CREATE POLICY "Authenticated users can insert comments with active subscription"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.assinaturas
        WHERE
            assinaturas.user_id = auth.uid() AND
            assinaturas."Status da assinatura" = 'active'
    ) AND comments.user_id = auth.uid() -- Ensure they are inserting for themselves
);

-- Enable update for authenticated users on their own comments
CREATE POLICY "Authenticated users can update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable delete for authenticated users on their own comments
CREATE POLICY "Authenticated users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- End Transaction
COMMIT;
```