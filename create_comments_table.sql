-- Run this SQL in your Supabase SQL Editor to create the comments table

-- Comments for listings (public social feature)
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_avatar text,
  comment_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "anyone can read comments"
ON comments FOR SELECT USING (true);

CREATE POLICY "authenticated users can create comments"
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own comments"
ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_comments_listing_id ON comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
