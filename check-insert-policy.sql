-- Check INSERT policies for bids table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids' AND cmd = 'INSERT';