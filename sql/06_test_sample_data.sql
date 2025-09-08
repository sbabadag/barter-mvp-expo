-- TEST: Add sample ratings
-- Run this after the rating system is set up

-- Get some user IDs to work with
WITH sample_users AS (
  SELECT id, display_name, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM profiles 
  LIMIT 4
),
sample_listings AS (
  SELECT id, title, seller_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM listings 
  LIMIT 3
)
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
FROM sample_users u1
CROSS JOIN sample_users u2
CROSS JOIN sample_listings l
WHERE u1.rn <= 2 
  AND u2.rn > 2 
  AND u1.id != u2.id
  AND u2.id = l.seller_id
LIMIT 5;

-- Display results
SELECT 'Rating system test data created!' as result;
SELECT COUNT(*) as total_ratings FROM public.ratings;
