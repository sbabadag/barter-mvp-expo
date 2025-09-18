-- Test RLS policies with direct SQL
-- Run this in Supabase SQL Editor

-- Test 1: Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids' AND cmd = 'INSERT';

-- Test 2: Temporarily disable RLS to test if that's the issue
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;

-- Test 3: Show RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bids';

-- After testing, you can re-enable with:
-- ALTER TABLE bids ENABLE ROW LEVEL SECURITY;