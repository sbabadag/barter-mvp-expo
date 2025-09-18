-- Fix RLS Policy - Allow all authenticated users to insert bids
-- Run this in Supabase SQL Editor

-- Step 1: Re-enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing complex policies
DROP POLICY IF EXISTS "Allow authenticated users to create bids" ON bids;
DROP POLICY IF EXISTS "authenticated_users_can_insert_bids" ON bids;

-- Step 3: Create a simple policy that allows any authenticated user to insert
CREATE POLICY "allow_authenticated_insert_bids" 
ON bids FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Step 4: Verify the policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids' AND cmd = 'INSERT';

-- Step 5: Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bids';