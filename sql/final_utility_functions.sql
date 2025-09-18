-- Final SQL utility function for executing raw SQL with parameters
-- This bypasses ALL Supabase client-side type checking

CREATE OR REPLACE FUNCTION public.exec_sql(
    query text,
    params text[] DEFAULT NULL
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
    executed_query text;
    i integer;
BEGIN
    -- Replace parameter placeholders with actual values
    executed_query := query;
    
    IF params IS NOT NULL THEN
        FOR i IN 1..array_length(params, 1) LOOP
            executed_query := replace(executed_query, '$' || i, quote_literal(params[i]));
        END LOOP;
    END IF;
    
    -- Execute the query and return result as JSON
    EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || executed_query || ') t' INTO result;
    
    RETURN COALESCE(result, '[]'::json);
EXCEPTION 
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'error', SQLERRM,
            'sqlstate', SQLSTATE,
            'query', executed_query
        );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;

-- Also create a super simple direct bid insert that avoids all type issues
CREATE OR REPLACE FUNCTION public.insert_bid_direct(
    p_listing_id text,
    p_bidder_id text,  -- Accept as text and cast internally
    p_amount text,     -- Accept as text and cast internally
    p_message text DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_id uuid;
BEGIN
    -- Generate a new UUID
    new_id := gen_random_uuid();
    
    -- Insert with explicit casting
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
        new_id,
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
GRANT EXECUTE ON FUNCTION public.insert_bid_direct TO authenticated;

SELECT 'Final utility functions created! 🎯' as status;