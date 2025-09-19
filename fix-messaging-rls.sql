-- Fix RLS policies for bids table to resolve messaging issues
-- This addresses the "mesaj gönderilemedi" error

-- Step 1: Drop any existing problematic policies
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can only bid on other's listings" ON public.bids;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.bids;
DROP POLICY IF EXISTS "Allow authenticated users to create bids" ON public.bids;
DROP POLICY IF EXISTS "authenticated_users_can_insert_bids" ON public.bids;
DROP POLICY IF EXISTS "users_can_view_related_bids" ON public.bids;

-- Step 2: Enable RLS on bids table
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Step 3: Create INSERT policy for authenticated users
CREATE POLICY "authenticated_users_can_insert_bids" ON public.bids
FOR INSERT 
TO authenticated 
WITH CHECK (
  bidder_id = auth.uid() 
  AND amount >= 0
);

-- Step 4: Create SELECT policy for users to see bids they made or received
CREATE POLICY "users_can_view_related_bids" ON public.bids
FOR SELECT 
TO authenticated 
USING (
  bidder_id = auth.uid() 
  OR 
  listing_id IN (
    SELECT id FROM listings WHERE seller_id = auth.uid()
  )
);

-- Step 5: Create UPDATE policy for bid status changes
CREATE POLICY "users_can_update_related_bids" ON public.bids
FOR UPDATE 
TO authenticated 
USING (
  bidder_id = auth.uid() 
  OR 
  listing_id IN (
    SELECT id FROM listings WHERE seller_id = auth.uid()
  )
)
WITH CHECK (
  bidder_id = auth.uid() 
  OR 
  listing_id IN (
    SELECT id FROM listings WHERE seller_id = auth.uid()
  )
);

-- Step 6: Grant necessary permissions
GRANT INSERT ON public.bids TO authenticated;
GRANT SELECT ON public.bids TO authenticated;
GRANT UPDATE ON public.bids TO authenticated;

-- Verify policies were created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bids';