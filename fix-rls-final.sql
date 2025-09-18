-- RLS Policy Fix for Bids Table
-- Run this in Supabase SQL Editor

-- First, check if INSERT policy already exists
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids' AND cmd = 'INSERT';

-- Drop existing INSERT policy if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own bids" ON bids;
DROP POLICY IF EXISTS "Allow authenticated users to insert bids" ON bids;
DROP POLICY IF EXISTS "authenticated_insert" ON bids;

-- Create new INSERT policy for authenticated users
CREATE POLICY "authenticated_users_can_insert_bids" 
ON bids FOR INSERT 
TO authenticated 
WITH CHECK (
  bidder_id = auth.uid() 
  AND amount >= 0
);

-- Check the policy was created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids' AND cmd = 'INSERT';

-- Test: Show current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bids';