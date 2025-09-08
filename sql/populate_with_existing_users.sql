-- POPULATE MARKETPLACE WITH EXISTING USERS
-- This script works with any existing auth users in your database
-- Run this after you have at least 8 users created through normal registration

-- =============================================================================
-- STEP 1: GET EXISTING USER IDS AND CREATE PROFILES
-- =============================================================================

-- First, let's see what users exist
SELECT 'Current users in database:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Create temporary table to store user assignments
CREATE TEMP TABLE user_assignments AS
WITH numbered_users AS (
  SELECT 
    id,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at) as user_num
  FROM auth.users 
  LIMIT 8
)
SELECT 
  id,
  email,
  CASE user_num
    WHEN 1 THEN 'Ahmet Yılmaz'
    WHEN 2 THEN 'Ayşe Demir'
    WHEN 3 THEN 'Mehmet Kaya'
    WHEN 4 THEN 'Zeynep Özkan'
    WHEN 5 THEN 'Can Şahin'
    WHEN 6 THEN 'Elif Arslan'
    WHEN 7 THEN 'Emre Yıldız'
    WHEN 8 THEN 'Selin Doğan'
  END as display_name,
  CASE user_num
    WHEN 1 THEN 'Ahmet'
    WHEN 2 THEN 'Ayşe'
    WHEN 3 THEN 'Mehmet'
    WHEN 4 THEN 'Zeynep'
    WHEN 5 THEN 'Can'
    WHEN 6 THEN 'Elif'
    WHEN 7 THEN 'Emre'
    WHEN 8 THEN 'Selin'
  END as first_name,
  CASE user_num
    WHEN 1 THEN 'Yılmaz'
    WHEN 2 THEN 'Demir'
    WHEN 3 THEN 'Kaya'
    WHEN 4 THEN 'Özkan'
    WHEN 5 THEN 'Şahin'
    WHEN 6 THEN 'Arslan'
    WHEN 7 THEN 'Yıldız'
    WHEN 8 THEN 'Doğan'
  END as last_name,
  CASE user_num
    WHEN 1 THEN 'İstanbul'
    WHEN 2 THEN 'Ankara'
    WHEN 3 THEN 'İzmir'
    WHEN 4 THEN 'Bursa'
    WHEN 5 THEN 'Antalya'
    WHEN 6 THEN 'Trabzon'
    WHEN 7 THEN 'Adana'
    WHEN 8 THEN 'Gaziantep'
  END as city,
  CASE user_num
    WHEN 1 THEN '+905321234567'
    WHEN 2 THEN '+905332345678'
    WHEN 3 THEN '+905343456789'
    WHEN 4 THEN '+905354567890'
    WHEN 5 THEN '+905365678901'
    WHEN 6 THEN '+905376789012'
    WHEN 7 THEN '+905387890123'
    WHEN 8 THEN '+905398901234'
  END as phone,
  CASE user_num
    WHEN 1 THEN 'male'
    WHEN 2 THEN 'female'
    WHEN 3 THEN 'male'
    WHEN 4 THEN 'female'
    WHEN 5 THEN 'male'
    WHEN 6 THEN 'female'
    WHEN 7 THEN 'male'
    WHEN 8 THEN 'female'
  END as gender,
  CASE user_num
    WHEN 1 THEN '1985-03-15'::date
    WHEN 2 THEN '1990-07-22'::date
    WHEN 3 THEN '1988-11-08'::date
    WHEN 4 THEN '1992-01-30'::date
    WHEN 5 THEN '1987-09-12'::date
    WHEN 6 THEN '1991-05-18'::date
    WHEN 7 THEN '1986-12-03'::date
    WHEN 8 THEN '1989-04-27'::date
  END as birth_date,
  user_num
FROM numbered_users;

-- Show the assignments
SELECT 'User assignments:' as info;
SELECT * FROM user_assignments;

-- Update or insert profiles for existing users
INSERT INTO public.profiles (
    id, 
    display_name, 
    first_name, 
    last_name, 
    email, 
    phone, 
    city, 
    birth_date, 
    gender,
    home_address,
    home_postal_code,
    created_at,
    updated_at
)
SELECT 
    ua.id,
    ua.display_name,
    ua.first_name,
    ua.last_name,
    ua.email,
    ua.phone,
    ua.city,
    ua.birth_date,
    ua.gender,
    CASE ua.user_num
        WHEN 1 THEN 'Kadıköy Mah. Bağdat Cad. No:45'
        WHEN 2 THEN 'Çankaya Mah. Tunalı Hilmi Cad. No:123'
        WHEN 3 THEN 'Karşıyaka Mah. Atatürk Bulvarı No:67'
        WHEN 4 THEN 'Osmangazi Mah. İnönü Cad. No:89'
        WHEN 5 THEN 'Muratpaşa Mah. Lara Cad. No:234'
        WHEN 6 THEN 'Ortahisar Mah. Atatürk Alanı No:12'
        WHEN 7 THEN 'Seyhan Mah. Ziyapaşa Bulvarı No:156'
        WHEN 8 THEN 'Şahinbey Mah. İstasyon Cad. No:78'
    END as home_address,
    CASE ua.user_num
        WHEN 1 THEN '34710'
        WHEN 2 THEN '06680'
        WHEN 3 THEN '35590'
        WHEN 4 THEN '16040'
        WHEN 5 THEN '07100'
        WHEN 6 THEN '61030'
        WHEN 7 THEN '01170'
        WHEN 8 THEN '27470'
    END as home_postal_code,
    NOW(),
    NOW()
FROM user_assignments ua
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    home_address = EXCLUDED.home_address,
    home_postal_code = EXCLUDED.home_postal_code,
    updated_at = NOW();

-- =============================================================================
-- STEP 2: CREATE DIVERSE MARKETPLACE LISTINGS
-- =============================================================================

-- Create listings using actual user IDs
INSERT INTO public.listings (
    id,
    title,
    description,
    price,
    category,
    condition,
    seller_id,
    images,
    location,
    status,
    created_at
)
SELECT 
    uuid_generate_v4() as id,
    listing_data.title,
    listing_data.description,
    listing_data.price,
    listing_data.category,
    listing_data.condition,
    ua.id as seller_id,
    listing_data.images::jsonb,
    listing_data.location,
    'active' as status,
    NOW() - listing_data.age_interval as created_at
FROM user_assignments ua
CROSS JOIN (
    VALUES 
    -- User 1 (Ahmet) listings
    (1, 'iPhone 13 Pro 128GB Uzay Grisi', 'Çok temiz kullanılmış iPhone 13 Pro. Kutusu ve aksesuarları mevcut. Hiç düşürülmemiş, ekran koruyucu ile kullanıldı.', 28500, 'Elektronik', 'good', '["iphone13pro1.jpg", "iphone13pro2.jpg"]', 'İstanbul, Kadıköy', INTERVAL '2 days'),
    (1, 'MacBook Air M1 2020 8GB/256GB', 'Az kullanılmış MacBook Air. Öğrenci olduğum için satıyorum. Performansı mükemmel, bataryası çok iyi.', 22000, 'Elektronik', 'like_new', '["macbook1.jpg", "macbook2.jpg"]', 'İstanbul, Kadıköy', INTERVAL '1 day'),
    
    -- User 2 (Ayşe) listings
    (2, 'Vintage Deri Ceket', 'Gerçek deri vintage ceket. 80ler tarzı, çok şık. M beden kadın. Sadece birkaç kez giyildi.', 850, 'Giyim', 'good', '["jacket1.jpg", "jacket2.jpg"]', 'Ankara, Çankaya', INTERVAL '3 days'),
    (2, 'Retro Kahve Makinesi', 'Sevimli retro tasarımlı kahve makinesi. Çalışır durumda, temiz. Mutfak dekorasyonumu değiştirdiğim için satıyorum.', 450, 'Ev & Yaşam', 'good', '["coffee1.jpg", "coffee2.jpg"]', 'Ankara, Çankaya', INTERVAL '4 days'),
    
    -- User 3 (Mehmet) listings
    (3, 'Trek Dağ Bisikleti 29 Jant', 'Profesyonel dağ bisikleti. Shimano vites sistemi, disk fren. Az kullanılmış, bakımlı.', 3200, 'Spor & Outdoor', 'like_new', '["bike1.jpg", "bike2.jpg"]', 'İzmir, Karşıyaka', INTERVAL '5 days'),
    (3, 'Araba Lastikleri 205/55 R16', 'Michelin marka lastikler. %70 diş var, 1 sezon kullanıldı. 4 adet birlikte satılıyor.', 1800, 'Otomotiv', 'good', '["tires1.jpg", "tires2.jpg"]', 'İzmir, Karşıyaka', INTERVAL '6 days'),
    
    -- User 4 (Zeynep) listings
    (4, 'Klasik Edebiyat Seti (20 Kitap)', 'Dünya klasikleri seti. Dostoyevski, Tolstoy, Hugo, Dickens ve daha fazlası. Çok temiz durumda.', 320, 'Kitap & Dergi', 'like_new', '["books1.jpg", "books2.jpg"]', 'Bursa, Osmangazi', INTERVAL '7 days'),
    (4, 'El Yapımı Seramik Vazo', 'Kendi yaptığım seramik vazo. Unique tasarım, evde dekorasyon için mükemmel. Orta boy.', 180, 'Sanat & Koleksiyon', 'new', '["vase1.jpg", "vase2.jpg"]', 'Bursa, Osmangazi', INTERVAL '1 day'),
    
    -- User 5 (Can) listings
    (5, 'PlayStation 5 + 3 Oyun', 'PS5 konsol + Spider-Man, FIFA 23, God of War. Az kullanıldı, garantisi var. Tüm aksesuarları mevcut.', 14500, 'Elektronik', 'like_new', '["ps5_1.jpg", "ps5_2.jpg"]', 'Antalya, Muratpaşa', INTERVAL '3 days'),
    (5, 'Akustik Gitar Yamaha F310', 'Başlangıç seviyesi için mükemmel gitar. Çanta ve pena hediye. Öğrenirken kullandım, artık gerek yok.', 980, 'Müzik', 'good', '["guitar1.jpg", "guitar2.jpg"]', 'Antalya, Muratpaşa', INTERVAL '8 days'),
    
    -- User 6 (Elif) listings
    (6, 'Bebek Arabası Chicco 3in1', 'Chicco marka bebek arabası. 3 in 1 sistem: puset, portbebe, araba koltuğu. Çok az kullanıldı.', 2800, 'Bebek & Çocuk', 'like_new', '["stroller1.jpg", "stroller2.jpg"]', 'Trabzon, Ortahisar', INTERVAL '4 days'),
    (6, 'Çocuk Bisikleti 16 Jant', 'Renkli çocuk bisikleti, yan tekerlekli. 4-7 yaş arası için uygun. Çok az kullanıldı, tertemiz.', 420, 'Bebek & Çocuk', 'good', '["kidbike1.jpg", "kidbike2.jpg"]', 'Trabzon, Ortahisar', INTERVAL '2 days'),
    
    -- User 7 (Emre) listings
    (7, 'Bosch Matkap Seti', 'Bosch profesyonel matkap + 50 parça uç seti. Ev tadilatında kullandım, artık gerek yok. Çok güçlü.', 750, 'Ev & Yaşam', 'good', '["drill1.jpg", "drill2.jpg"]', 'Adana, Seyhan', INTERVAL '9 days'),
    (7, 'Bahçe Mobilyası Seti (4 Kişilik)', 'Plastik bahçe masası + 4 sandalye. Hava şartlarına dayanıklı, temiz. Taşınacağım için satıyorum.', 650, 'Ev & Yaşam', 'good', '["garden1.jpg", "garden2.jpg"]', 'Adana, Seyhan', INTERVAL '5 days'),
    
    -- User 8 (Selin) listings
    (8, 'Dyson Saç Kurutma Makinesi', 'Dyson Supersonic saç kurutma makinesi. Çok az kullanıldı, kutusu mevcut. Pahalı olduğu için satıyorum.', 2200, 'Kozmetik & Bakım', 'like_new', '["dyson1.jpg", "dyson2.jpg"]', 'Gaziantep, Şahinbey', INTERVAL '6 days'),
    (8, 'Yoga Matı + Blok Seti', 'Kaliteli yoga matı + 2 yoga bloğu + askı. Pilates ve yoga için mükemmel. Hijyenik, temiz.', 280, 'Spor & Outdoor', 'good', '["yoga1.jpg", "yoga2.jpg"]', 'Gaziantep, Şahinbey', INTERVAL '10 days')
) AS listing_data(user_num, title, description, price, category, condition, images, location, age_interval)
WHERE ua.user_num = listing_data.user_num;

-- =============================================================================
-- STEP 3: CREATE SAMPLE BIDS AND MESSAGES
-- =============================================================================

-- Create some sample bids using actual listing and user IDs
WITH listing_ids AS (
  SELECT 
    l.id as listing_id,
    l.title,
    l.seller_id,
    ROW_NUMBER() OVER (ORDER BY l.created_at DESC) as listing_num
  FROM listings l
  WHERE l.created_at > NOW() - INTERVAL '1 hour' -- Only recent listings from this script
),
user_ids AS (
  SELECT id as user_id, user_num FROM user_assignments
)
INSERT INTO public.bids (
    id,
    listing_id,
    bidder_id,
    amount,
    message,
    status,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4() as id,
    li.listing_id,
    ui.user_id as bidder_id,
    bid_data.amount,
    bid_data.message,
    'pending' as status,
    NOW() - bid_data.age_interval as created_at,
    NOW() - bid_data.age_interval as updated_at
FROM listing_ids li
CROSS JOIN user_ids ui
CROSS JOIN (
    VALUES 
    (1, 3, 26000, 'Merhaba, telefonun garantisi var mı? 26.000 TL veriyorum.', INTERVAL '1 day'),
    (1, 4, 27000, 'Kutusu tam mı? Şarj aleti var mı? 27K son teklifim.', INTERVAL '6 hours'),
    (1, 3, 0, 'Telefonun kamerası nasıl? Test çekmişsiniz mi?', INTERVAL '23 hours'),
    (2, 5, 20000, 'MacBook hala garantide mi? 20.000 TL teklif ediyorum.', INTERVAL '2 hours'),
    (2, 8, 21000, 'Bataryası kaç saat gidiyor? 21K veriyorum.', INTERVAL '1 hour'),
    (9, 7, 13500, 'PS5 için 13.500 TL teklif ediyorum. Oyunlar da dahil mi?', INTERVAL '3 hours'),
    (9, 2, 14000, 'Konsol kaç saat kullanıldı? 14K son teklifim.', INTERVAL '30 minutes')
) AS bid_data(listing_num, bidder_num, amount, message, age_interval)
WHERE li.listing_num = bid_data.listing_num 
AND ui.user_num = bid_data.bidder_num
AND li.seller_id != ui.user_id; -- Don't let users bid on their own items

-- Display success message
SELECT '🎉 İmece Marketplace veritabanı başarıyla gerçek kullanıcılar ve ürünlerle dolduruldu!' as result;
SELECT 'Oluşturulan kayıtlar:' as info;
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE updated_at > NOW() - INTERVAL '1 hour') as profiles_created,
    (SELECT COUNT(*) FROM listings WHERE created_at > NOW() - INTERVAL '1 hour') as listings_created,
    (SELECT COUNT(*) FROM bids WHERE created_at > NOW() - INTERVAL '1 hour') as bids_created;
