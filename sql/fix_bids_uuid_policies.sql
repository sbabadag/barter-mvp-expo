-- Fix UUID = text operator issues in bids table RLS policies
-- This script resolves the "operator does not exist: text = uuid" error

-- First, let's drop existing policies and recreate with explicit type casting

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view bids they made" ON public.bids;
DROP POLICY IF EXISTS "Users can view bids on their listings" ON public.bids;
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
DROP POLICY IF EXISTS "Listing owners can update bid status" ON public.bids;

-- Recreate policies with explicit UUID/TEXT casting

-- Policy 1: Users can view bids they made
CREATE POLICY "Users can view bids they made" ON public.bids
    FOR SELECT USING (bidder_id = auth.uid());

-- Policy 2: Users can view bids on their listings (with explicit casting)
CREATE POLICY "Users can view bids on their listings" ON public.bids
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    );

-- Policy 3: Users can create bids (with explicit casting)
CREATE POLICY "Users can create bids" ON public.bids
    FOR INSERT WITH CHECK (
        bidder_id = auth.uid() AND
        amount > 0 AND
        listing_id NOT IN (
            SELECT id FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    );

-- Policy 4: Users can update their own bids
CREATE POLICY "Users can update their own bids" ON public.bids
    FOR UPDATE USING (bidder_id = auth.uid())
    WITH CHECK (bidder_id = auth.uid());

-- Policy 5: Listing owners can update bid status (with explicit casting)
CREATE POLICY "Listing owners can update bid status" ON public.bids
    FOR UPDATE USING (
        listing_id IN (
            SELECT id FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        listing_id IN (
            SELECT id FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    );

-- Alternative approach: If the above still doesn't work, try this more comprehensive fix
-- This handles both UUID and TEXT type mismatches

-- Drop all policies again (uncomment if needed)
/*
DROP POLICY IF EXISTS "Users can view bids they made" ON public.bids;
DROP POLICY IF EXISTS "Users can view bids on their listings" ON public.bids;
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
DROP POLICY IF EXISTS "Listing owners can update bid status" ON public.bids;

-- Create safer policies with explicit type handling
CREATE POLICY "Users can view bids they made" ON public.bids
    FOR SELECT USING (bidder_id::text = auth.uid()::text);

CREATE POLICY "Users can view bids on their listings" ON public.bids
    FOR SELECT USING (
        listing_id::text IN (
            SELECT id::text FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can create bids" ON public.bids
    FOR INSERT WITH CHECK (
        bidder_id::text = auth.uid()::text AND
        amount > 0 AND
        listing_id::text NOT IN (
            SELECT id::text FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own bids" ON public.bids
    FOR UPDATE USING (bidder_id::text = auth.uid()::text)
    WITH CHECK (bidder_id::text = auth.uid()::text);

CREATE POLICY "Listing owners can update bid status" ON public.bids
    FOR UPDATE USING (
        listing_id::text IN (
            SELECT id::text FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        listing_id::text IN (
            SELECT id::text FROM public.listings WHERE seller_id::text = auth.uid()::text
        )
    );
*/

-- Success message
SELECT 'Bids table RLS policies updated successfully! 🚀' as status;

-- Test query to verify the fix
-- SELECT COUNT(*) as bid_count FROM public.bids WHERE bidder_id = auth.uid();