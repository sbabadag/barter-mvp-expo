-- Create public RLS policy for bids table
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Create a public policy that allows anyone to insert bids
CREATE POLICY "public_insert_bids" 
ON bids FOR INSERT 
TO public 
WITH CHECK (true);

-- Create a public policy that allows anyone to read bids
CREATE POLICY "public_select_bids" 
ON bids FOR SELECT 
TO public 
USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bids';