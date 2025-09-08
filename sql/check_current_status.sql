-- Check current status of rating system setup

-- 1. Check if seller_id column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name = 'seller_id';

-- 2. Check existing constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'listings' 
AND constraint_name = 'listings_seller_id_fkey';

-- 3. Check current data status
SELECT 
    'Current listings status' as info,
    COUNT(*) as total_listings,
    COUNT(seller_id) as listings_with_seller_id,
    COUNT(*) - COUNT(seller_id) as listings_without_seller_id
FROM public.listings;

-- 4. Check if ratings tables exist
SELECT 
    table_name,
    'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ratings', 'user_rating_stats')
ORDER BY table_name;

-- 5. Sample of current data
SELECT 
    id,
    title,
    seller_name,
    seller_id,
    created_at
FROM public.listings 
LIMIT 3;
