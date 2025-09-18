-- URGENT: Fix missing INSERT policy for bids table
-- The issue is that there's no working INSERT policy allowing authenticated users to create bids

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can only bid on other's listings" ON public.bids;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.bids;

-- Create a simple, working INSERT policy for authenticated users
CREATE POLICY "Allow authenticated users to create bids" ON public.bids
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' AND
        bidder_id = auth.uid() AND
        amount >= 0
    );

-- Ensure the table has RLS enabled
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT INSERT ON public.bids TO authenticated;
GRANT SELECT ON public.bids TO authenticated;
GRANT UPDATE ON public.bids TO authenticated;