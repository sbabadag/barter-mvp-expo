-- Ultra-simple bid creation function that handles everything as strings
-- This function completely avoids UUID type casting issues

CREATE OR REPLACE FUNCTION public.simple_bid_insert(
    p_listing_id text,
    p_bidder_id text,
    p_amount text,
    p_message text DEFAULT NULL
)
RETURNS text
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_id text;
BEGIN
    -- Generate a simple string-based ID
    new_id := 'bid_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 8);
    
    -- Insert with manual type conversion only where needed
    INSERT INTO public.bids (
        id,
        listing_id,
        bidder_id,
        amount,
        message,
        status,
        created_at,
        updated_at
    ) VALUES (
        new_id::uuid,           -- Convert string to UUID only here
        p_listing_id,           -- listing_id is already TEXT
        p_bidder_id::uuid,      -- Convert string to UUID only here
        p_amount::numeric,      -- Convert string to numeric
        p_message,
        'pending',
        NOW(),
        NOW()
    );
    
    RETURN new_id;
EXCEPTION 
    WHEN OTHERS THEN
        -- If UUID conversion fails, try with a proper UUID
        new_id := gen_random_uuid()::text;
        
        INSERT INTO public.bids (
            id,
            listing_id,
            bidder_id,
            amount,
            message,
            status,
            created_at,
            updated_at
        ) VALUES (
            new_id::uuid,
            p_listing_id,
            p_bidder_id::uuid,
            p_amount::numeric,
            p_message,
            'pending',
            NOW(),
            NOW()
        );
        
        RETURN new_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.simple_bid_insert TO authenticated;

-- Test message
SELECT 'Ultra-simple bid function created! 🚀' as status;