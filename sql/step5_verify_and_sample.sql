-- Step 5: Verify setup and create sample data (run this last)

-- Verify tables exist
SELECT 
    'Tables created:' as info,
    STRING_AGG(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ratings', 'user_rating_stats');

-- Create sample ratings if you have users and listings
INSERT INTO public.ratings (
    reviewer_id,
    reviewed_user_id,
    listing_id,
    transaction_type,
    rating,
    review_text,
    communication_rating,
    item_condition_rating,
    delivery_rating,
    is_verified
) 
SELECT 
    u1.id as reviewer_id,
    u2.id as reviewed_user_id,
    l.id as listing_id,
    'seller' as transaction_type,
    (3 + (random() * 2)::INTEGER) as rating,
    CASE 
        WHEN random() < 0.3 THEN 'Harika bir satıcı, çok memnun kaldım!'
        WHEN random() < 0.6 THEN 'Güvenilir ve hızlı teslimat.'
        WHEN random() < 0.8 THEN 'İyi bir deneyim yaşadım.'
        ELSE 'Teşekkürler!'
    END as review_text,
    (3 + (random() * 2)::INTEGER) as communication_rating,
    (3 + (random() * 2)::INTEGER) as item_condition_rating,
    (3 + (random() * 2)::INTEGER) as delivery_rating,
    true as is_verified
FROM (
    SELECT id FROM auth.users ORDER BY created_at LIMIT 4
) u1
CROSS JOIN (
    SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 4  
) u2
CROSS JOIN (
    SELECT id FROM public.listings ORDER BY created_at LIMIT 2
) l
WHERE u1.id != u2.id
LIMIT 5;

-- Show results
SELECT 'Rating system setup completed!' as result;
SELECT COUNT(*) as total_ratings FROM public.ratings;
SELECT COUNT(*) as total_stats FROM public.user_rating_stats;
