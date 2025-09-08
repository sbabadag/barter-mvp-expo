-- Enable rating system by adding seller_id to listings table

-- Step 1: Add seller_id column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS seller_id UUID;

-- Step 2: Create foreign key relationship (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'listings_seller_id_fkey' 
        AND table_name = 'listings'
    ) THEN
        ALTER TABLE public.listings 
        ADD CONSTRAINT listings_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Update existing listings with seller_id
-- Get the current user's ID and assign it to all listings
UPDATE public.listings 
SET seller_id = (
  SELECT id FROM auth.users WHERE email = 'sbabadag@gmail.com' LIMIT 1
) 
WHERE seller_id IS NULL;

-- Step 4: Make seller_id required for new listings (optional)
-- ALTER TABLE public.listings ALTER COLUMN seller_id SET NOT NULL;

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);

-- Verify the changes
SELECT 
  'seller_id column added' as status,
  COUNT(*) as listings_with_seller_id
FROM public.listings 
WHERE seller_id IS NOT NULL;

-- Show sample listing with seller info
SELECT 
  l.id,
  l.title,
  l.seller_name,
  l.seller_id,
  p.display_name as seller_display_name,
  p.city as seller_city
FROM public.listings l
LEFT JOIN public.profiles p ON l.seller_id = p.id
LIMIT 3;
