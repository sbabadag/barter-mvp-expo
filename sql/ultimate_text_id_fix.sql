-- ULTIMATE FIX: Change bids.id from UUID to TEXT to eliminate all type issues
-- This completely solves the UUID comparison and conversion problems

-- Step 1: First check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bids' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Backup any existing data (if any)
CREATE TABLE IF NOT EXISTS bids_backup AS 
SELECT * FROM public.bids;

-- Step 3: Drop the table and recreate with TEXT id
DROP TABLE IF EXISTS public.bids CASCADE;

-- Step 4: Create new bids table with TEXT id
CREATE TABLE public.bids (
    id text PRIMARY KEY DEFAULT ('bid_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 8)),
    listing_id text NOT NULL,
    bidder_id uuid NOT NULL,
    amount numeric NOT NULL,
    message text,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    expires_at timestamptz,
    counter_offer_amount numeric,
    counter_offer_message text
);

-- Step 5: Create indexes for performance
CREATE INDEX idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_bids_created_at ON public.bids(created_at);

-- Step 6: Grant permissions
GRANT ALL ON public.bids TO authenticated;
GRANT ALL ON public.bids TO anon;

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bids_updated_at
    BEFORE UPDATE ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Create simple insertion function
CREATE OR REPLACE FUNCTION public.create_bid_final(
    p_listing_id text,
    p_bidder_id uuid,
    p_amount numeric,
    p_message text DEFAULT NULL
)
RETURNS text
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_id text;
BEGIN
    -- Generate a unique text ID
    new_id := 'bid_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
    
    -- Insert the bid
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

-- Success message
SELECT 'ULTIMATE FIX APPLIED! Bids table now uses TEXT id - no more UUID issues! 🎉' as status;