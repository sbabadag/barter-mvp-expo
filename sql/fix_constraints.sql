-- Fix Existing Constraint Conflicts
-- Run this if you're getting "constraint already exists" errors

-- Remove potentially conflicting constraints
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS fk_bids_bidder_profile;
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS fk_bids_listing;
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_bidder_id_fkey;
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_listing_id_fkey;

-- Re-add the foreign key constraints with proper names
ALTER TABLE public.bids 
ADD CONSTRAINT bids_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

ALTER TABLE public.bids 
ADD CONSTRAINT bids_bidder_id_fkey 
FOREIGN KEY (bidder_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Verify the constraints were added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'bids';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Foreign key constraints fixed for bids table';
    RAISE NOTICE 'The relationship between bids and listings should now work properly';
END $$;
