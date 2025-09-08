-- Temporary fix: Disable the problematic trigger
DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;

-- Add seller_id column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS seller_id UUID;

-- Create foreign key relationship (only if not exists)
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

-- Update existing listings with seller_id
UPDATE public.listings 
SET seller_id = (
  SELECT id FROM auth.users WHERE email = 'sbabadag@gmail.com' LIMIT 1
) 
WHERE seller_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);

-- Verify the changes
SELECT 
  'seller_id setup complete' as status,
  COUNT(*) as total_listings,
  COUNT(seller_id) as listings_with_seller_id
FROM public.listings;

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
