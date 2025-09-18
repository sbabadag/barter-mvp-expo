-- Completely disable RLS for debugging
-- Run this in Supabase SQL Editor

-- Disable RLS completely
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_authenticated_insert_bids" ON bids;
DROP POLICY IF EXISTS "Allow authenticated users to create bids" ON bids;
DROP POLICY IF EXISTS "authenticated_users_can_insert_bids" ON bids;

-- Check RLS status (should be false)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bids';

-- Check that no policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids';