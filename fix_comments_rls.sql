-- Quick fix for comments RLS policy
-- Run this in your Supabase SQL Editor to allow anonymous comments

-- Update the table to allow null user_id
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;

-- Update the foreign key constraint to allow null
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies to allow anonymous comments
DROP POLICY IF EXISTS "authenticated users can create comments" ON comments;
CREATE POLICY "anyone can create comments"
ON comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "users can update their own comments" ON comments;
CREATE POLICY "users can update their own comments"
ON comments FOR UPDATE USING (
  auth.uid() = user_id OR user_id IS NULL
);
