-- Fix for offers/bids RLS policy issue
-- The problem is that the RPC function create_bid_final uses SECURITY DEFINER
-- which bypasses RLS during insert, but then the inserted records can't be read
-- because the RLS SELECT policies require bidder_id = auth.uid()

-- Solution: Recreate the function with SECURITY INVOKER instead of SECURITY DEFINER
-- This will ensure the function runs with the calling user's permissions

DROP FUNCTION IF EXISTS public.create_bid_final(text, uuid, numeric, text);

CREATE OR REPLACE FUNCTION public.create_bid_final(
    p_listing_id text,
    p_bidder_id uuid,
    p_amount numeric,
    p_message text DEFAULT NULL
)
RETURNS text
SECURITY INVOKER  -- Changed from SECURITY DEFINER to SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    new_id text;
BEGIN
    -- Verify the bidder_id matches the authenticated user
    IF p_bidder_id != auth.uid() THEN
        RAISE EXCEPTION 'bidder_id must match authenticated user';
    END IF;
    
    -- Generate a unique text ID
    new_id := 'bid_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
    
    -- Insert the bid (this will now use the authenticated user's context)
    INSERT INTO public.bids (
        id,
        listing_id,
        bidder_id,
        amount,
        message,
        status
    ) VALUES (
        new_id,
        p_listing_id,
        p_bidder_id,
        p_amount,
        p_message,
        'pending'
    );
    
    RETURN new_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_bid_final TO authenticated;

-- Test message
SELECT 'Fixed RLS policy issue for bids! Function now uses SECURITY INVOKER.' as status;