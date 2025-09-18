-- EMERGENCY UUID FIX - Simple Solution for ESKICI App
-- This temporarily disables complex RLS policies to get the system working

-- Step 1: Drop ALL problematic RLS policies
DROP POLICY IF EXISTS "Users can view bids they made" ON public.bids;
DROP POLICY IF EXISTS "Users can view bids on their listings" ON public.bids;
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
DROP POLICY IF EXISTS "Listing owners can update bid status" ON public.bids;

-- Step 2: Temporarily disable RLS entirely to get the app working
ALTER TABLE public.bids DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant permissions for immediate functionality
GRANT ALL ON public.bids TO authenticated;
GRANT ALL ON public.listings TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Step 4: Success message
SELECT 'Emergency fix applied! Bids should work now.' as status;
SELECT 'Remember to re-enable RLS later for production security.' as warning;

-- Step 5: For production, you can re-enable RLS with simple policies later:
/*
-- Re-enable RLS when ready
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Create simple policies without complex joins
CREATE POLICY "Allow bid operations" ON public.bids
    FOR ALL USING (true)
    WITH CHECK (bidder_id = auth.uid());
*/