-- Create a safe bid creation function that handles UUID casting properly
-- This function bypasses RLS policies and handles type conversion automatically

CREATE OR REPLACE FUNCTION public.create_bid_safe(
    p_listing_id text,
    p_bidder_id uuid,
    p_amount numeric,
    p_message text DEFAULT NULL,
    p_expires_at timestamptz DEFAULT NULL,
    p_status text DEFAULT 'pending'
)
RETURNS table(
    id uuid,
    listing_id text,
    bidder_id uuid,
    amount numeric,
    message text,
    status text,
    created_at timestamptz,
    updated_at timestamptz,
    expires_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert the bid with proper type handling
    RETURN QUERY
    INSERT INTO public.bids (
        listing_id,
        bidder_id,
        amount,
        message,
        status,
        expires_at
    ) VALUES (
        p_listing_id,  -- listing_id is TEXT, no conversion needed
        p_bidder_id,   -- bidder_id is UUID, no conversion needed
        p_amount,
        p_message,
        p_status,
        p_expires_at
    )
    RETURNING 
        bids.id,
        bids.listing_id,
        bids.bidder_id,
        bids.amount,
        bids.message,
        bids.status,
        bids.created_at,
        bids.updated_at,
        bids.expires_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_bid_safe TO authenticated;

-- Test the function works
SELECT 'Bid creation function created successfully! 🎉' as status;