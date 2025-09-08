-- Test script to verify rating system is ready

-- 1. Check if seller_id column exists and has data
SELECT 
    'Listings with seller_id:' as check_type,
    COUNT(*) as total_listings,
    COUNT(seller_id) as listings_with_seller_id,
    ROUND((COUNT(seller_id)::decimal / COUNT(*)) * 100, 2) as percentage_complete
FROM public.listings;

-- 2. Check seller profiles availability
SELECT 
    'Seller profiles available:' as check_type,
    COUNT(DISTINCT l.seller_id) as unique_sellers,
    COUNT(DISTINCT p.id) as profiles_found
FROM public.listings l
LEFT JOIN public.profiles p ON l.seller_id = p.id
WHERE l.seller_id IS NOT NULL;

-- 3. Check if rating tables exist
SELECT 
    'Rating system tables:' as check_type,
    STRING_AGG(table_name, ', ') as available_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ratings', 'user_rating_stats');

-- 4. Sample listing with full seller info
SELECT 
    l.id,
    l.title,
    l.seller_id,
    p.display_name,
    p.first_name,
    p.last_name,
    p.city
FROM public.listings l
LEFT JOIN public.profiles p ON l.seller_id = p.id
WHERE l.seller_id IS NOT NULL
LIMIT 3;

-- 5. Check if there are any existing ratings
SELECT 
    'Existing ratings:' as check_type,
    COUNT(*) as total_ratings,
    COUNT(DISTINCT reviewed_user_id) as rated_users
FROM public.ratings;
