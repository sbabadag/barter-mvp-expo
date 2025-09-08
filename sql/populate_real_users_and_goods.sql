-- REAL USERS AND GOODS DISTRIBUTION SCRIPT FOR İMECE MARKETPLACE
-- This script creates realistic users with passwords and distributes various goods to them

-- =============================================================================
-- STEP 1: CREATE REALISTIC USER PROFILES
-- =============================================================================

-- Note: Users need to be created through Supabase Auth first, then profiles are linked
-- This script assumes you'll create auth users and then run the profile inserts

-- Real user profiles with Turkish names and cities
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
) VALUES 
-- User 1: Ahmet from Istanbul
('11111111-1111-1111-1111-111111111111', 'Ahmet Yılmaz', 'Ahmet', 'Yılmaz', 'ahmet.yilmaz@email.com', '+905321234567', 'İstanbul', '1985-03-15', 'male', 'Kadıköy Mah. Bağdat Cad. No:45', '34710', NOW(), NOW()),

-- User 2: Ayşe from Ankara
('22222222-2222-2222-2222-222222222222', 'Ayşe Demir', 'Ayşe', 'Demir', 'ayse.demir@email.com', '+905332345678', 'Ankara', '1990-07-22', 'female', 'Çankaya Mah. Tunalı Hilmi Cad. No:123', '06680', NOW(), NOW()),

-- User 3: Mehmet from İzmir
('33333333-3333-3333-3333-333333333333', 'Mehmet Kaya', 'Mehmet', 'Kaya', 'mehmet.kaya@email.com', '+905343456789', 'İzmir', '1988-11-08', 'male', 'Karşıyaka Mah. Atatürk Bulvarı No:67', '35590', NOW(), NOW()),

-- User 4: Zeynep from Bursa
('44444444-4444-4444-4444-444444444444', 'Zeynep Özkan', 'Zeynep', 'Özkan', 'zeynep.ozkan@email.com', '+905354567890', 'Bursa', '1992-01-30', 'female', 'Osmangazi Mah. İnönü Cad. No:89', '16040', NOW(), NOW()),

-- User 5: Can from Antalya
('55555555-5555-5555-5555-555555555555', 'Can Şahin', 'Can', 'Şahin', 'can.sahin@email.com', '+905365678901', 'Antalya', '1987-09-12', 'male', 'Muratpaşa Mah. Lara Cad. No:234', '07100', NOW(), NOW()),

-- User 6: Elif from Trabzon
('66666666-6666-6666-6666-666666666666', 'Elif Arslan', 'Elif', 'Arslan', 'elif.arslan@email.com', '+905376789012', 'Trabzon', '1991-05-18', 'female', 'Ortahisar Mah. Atatürk Alanı No:12', '61030', NOW(), NOW()),

-- User 7: Emre from Adana
('77777777-7777-7777-7777-777777777777', 'Emre Yıldız', 'Emre', 'Yıldız', 'emre.yildiz@email.com', '+905387890123', 'Adana', '1986-12-03', 'male', 'Seyhan Mah. Ziyapaşa Bulvarı No:156', '01170', NOW(), NOW()),

-- User 8: Selin from Gaziantep
('88888888-8888-8888-8888-888888888888', 'Selin Doğan', 'Selin', 'Doğan', 'selin.dogan@email.com', '+905398901234', 'Gaziantep', '1989-04-27', 'female', 'Şahinbey Mah. İstasyon Cad. No:78', '27470', NOW(), NOW());

-- =============================================================================
-- STEP 2: CREATE DIVERSE MARKETPLACE LISTINGS
-- =============================================================================

-- Electronics & Technology
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
) VALUES 
-- Ahmet's listings (Electronics)
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'iPhone 13 Pro 128GB Uzay Grisi', 'Çok temiz kullanılmış iPhone 13 Pro. Kutusu ve aksesuarları mevcut. Hiç düşürülmemiş, ekran koruyucu ile kullanıldı.', 28500, 'Elektronik', 'good', '11111111-1111-1111-1111-111111111111', '["iphone13pro1.jpg", "iphone13pro2.jpg"]', 'İstanbul, Kadıköy', 'active', NOW() - INTERVAL '2 days'),

('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'MacBook Air M1 2020 8GB/256GB', 'Az kullanılmış MacBook Air. Öğrenci olduğum için satıyorum. Performansı mükemmel, bataryası çok iyi.', 22000, 'Elektronik', 'like_new', '11111111-1111-1111-1111-111111111111', '["macbook1.jpg", "macbook2.jpg"]', 'İstanbul, Kadıköy', 'active', NOW() - INTERVAL '1 day'),

-- Ayşe's listings (Fashion & Home)
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Vintage Deri Ceket', 'Gerçek deri vintage ceket. 80ler tarzı, çok şık. M beden kadın. Sadece birkaç kez giyildi.', 850, 'Giyim', 'good', '22222222-2222-2222-2222-222222222222', '["jacket1.jpg", "jacket2.jpg"]', 'Ankara, Çankaya', 'active', NOW() - INTERVAL '3 days'),

('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'Retro Kahve Makinesi', 'Sevimli retro tasarımlı kahve makinesi. Çalışır durumda, temiz. Mutfak dekorasyonumu değiştirdiğim için satıyorum.', 450, 'Ev & Yaşam', 'good', '22222222-2222-2222-2222-222222222222', '["coffee1.jpg", "coffee2.jpg"]', 'Ankara, Çankaya', 'active', NOW() - INTERVAL '4 days'),

-- Mehmet's listings (Sports & Automotive)
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'Trek Dağ Bisikleti 29 Jant', 'Profesyonel dağ bisikleti. Shimano vites sistemi, disk fren. Az kullanılmış, bakımlı.', 3200, 'Spor & Outdoor', 'like_new', '33333333-3333-3333-3333-333333333333', '["bike1.jpg", "bike2.jpg"]', 'İzmir, Karşıyaka', 'active', NOW() - INTERVAL '5 days'),

('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'Araba Lastikleri 205/55 R16', 'Michelin marka lastikler. %70 diş var, 1 sezon kullanıldı. 4 adet birlikte satılıyor.', 1800, 'Otomotiv', 'good', '33333333-3333-3333-3333-333333333333', '["tires1.jpg", "tires2.jpg"]', 'İzmir, Karşıyaka', 'active', NOW() - INTERVAL '6 days'),

-- Zeynep's listings (Books & Hobbies)
('a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7', 'Klasik Edebiyat Seti (20 Kitap)', 'Dünya klasikleri seti. Dostoyevski, Tolstoy, Hugo, Dickens ve daha fazlası. Çok temiz durumda.', 320, 'Kitap & Dergi', 'like_new', '44444444-4444-4444-4444-444444444444', '["books1.jpg", "books2.jpg"]', 'Bursa, Osmangazi', 'active', NOW() - INTERVAL '7 days'),

('b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8', 'El Yapımı Seramik Vazo', 'Kendi yaptığım seramik vazo. Unique tasarım, evde dekorasyon için mükemmel. Orta boy.', 180, 'Sanat & Koleksiyon', 'new', '44444444-4444-4444-4444-444444444444', '["vase1.jpg", "vase2.jpg"]', 'Bursa, Osmangazi', 'active', NOW() - INTERVAL '1 day'),

-- Can's listings (Music & Games)
('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'PlayStation 5 + 3 Oyun', 'PS5 konsol + Spider-Man, FIFA 23, God of War. Az kullanıldı, garantisi var. Tüm aksesuarları mevcut.', 14500, 'Elektronik', 'like_new', '55555555-5555-5555-5555-555555555555', '["ps5_1.jpg", "ps5_2.jpg"]', 'Antalya, Muratpaşa', 'active', NOW() - INTERVAL '3 days'),

('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Akustik Gitar Yamaha F310', 'Başlangıç seviyesi için mükemmel gitar. Çanta ve pena hediye. Öğrenirken kullandım, artık gerek yok.', 980, 'Müzik', 'good', '55555555-5555-5555-5555-555555555555', '["guitar1.jpg", "guitar2.jpg"]', 'Antalya, Muratpaşa', 'active', NOW() - INTERVAL '8 days'),

-- Elif's listings (Baby & Kids)
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'Bebek Arabası Chicco 3in1', 'Chicco marka bebek arabası. 3 in 1 sistem: puset, portbebe, araba koltuğu. Çok az kullanıldı.', 2800, 'Bebek & Çocuk', 'like_new', '66666666-6666-6666-6666-666666666666', '["stroller1.jpg", "stroller2.jpg"]', 'Trabzon, Ortahisar', 'active', NOW() - INTERVAL '4 days'),

('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Çocuk Bisikleti 16 Jant', 'Renkli çocuk bisikleti, yan tekerlekli. 4-7 yaş arası için uygun. Çok az kullanıldı, tertemiz.', 420, 'Bebek & Çocuk', 'good', '66666666-6666-6666-6666-666666666666', '["kidbike1.jpg", "kidbike2.jpg"]', 'Trabzon, Ortahisar', 'active', NOW() - INTERVAL '2 days'),

-- Emre's listings (Tools & Garden)
('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', 'Bosch Matkap Seti', 'Bosch profesyonel matkap + 50 parça uç seti. Ev tadilatında kullandım, artık gerek yok. Çok güçlü.', 750, 'Ev & Yaşam', 'good', '77777777-7777-7777-7777-777777777777', '["drill1.jpg", "drill2.jpg"]', 'Adana, Seyhan', 'active', NOW() - INTERVAL '9 days'),

('b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4', 'Bahçe Mobilyası Seti (4 Kişilik)', 'Plastik bahçe masası + 4 sandalye. Hava şartlarına dayanıklı, temiz. Taşınacağım için satıyorum.', 650, 'Ev & Yaşam', 'good', '77777777-7777-7777-7777-777777777777', '["garden1.jpg", "garden2.jpg"]', 'Adana, Seyhan', 'active', NOW() - INTERVAL '5 days'),

-- Selin's listings (Beauty & Health)
('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'Dyson Saç Kurutma Makinesi', 'Dyson Supersonic saç kurutma makinesi. Çok az kullanıldı, kutusu mevcut. Pahalı olduğu için satıyorum.', 2200, 'Kozmetik & Bakım', 'like_new', '88888888-8888-8888-8888-888888888888', '["dyson1.jpg", "dyson2.jpg"]', 'Gaziantep, Şahinbey', 'active', NOW() - INTERVAL '6 days'),

('d6d6d6d6-d6d6-d6d6-d6d6-d6d6d6d6d6d6', 'Yoga Matı + Blok Seti', 'Kaliteli yoga matı + 2 yoga bloğu + askı. Pilates ve yoga için mükemmel. Hijyenik, temiz.', 280, 'Spor & Outdoor', 'good', '88888888-8888-8888-8888-888888888888', '["yoga1.jpg", "yoga2.jpg"]', 'Gaziantep, Şahinbey', 'active', NOW() - INTERVAL '10 days');

-- =============================================================================
-- STEP 3: CREATE SAMPLE BIDS AND MESSAGES
-- =============================================================================

-- Some realistic bids on various items
INSERT INTO public.bids (
    id,
    listing_id,
    bidder_id,
    amount,
    message,
    status,
    created_at,
    updated_at
) VALUES 
-- Bids on iPhone (by Mehmet and Zeynep)
('bid00001-0001-0001-0001-000000000001', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '33333333-3333-3333-3333-333333333333', 26000, 'Merhaba, telefonun garantisi var mı? 26.000 TL veriyorum.', 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('bid00002-0002-0002-0002-000000000002', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '44444444-4444-4444-4444-444444444444', 27000, 'Kutusu tam mı? Şarj aleti var mı? 27K son teklifim.', 'pending', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Messages between users (0 amount bids for chat)
('msg00001-0001-0001-0001-000000000001', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '33333333-3333-3333-3333-333333333333', 0, 'Telefonun kamerası nasıl? Test çekmişsiniz mi?', 'pending', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '23 hours'),
('msg00002-0002-0002-0002-000000000002', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '11111111-1111-1111-1111-111111111111', 0, 'Kamera çok iyi, hiç problem yok. Gece çekimleri bile net.', 'pending', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '22 hours'),

-- Bids on MacBook (by Can and Selin)
('bid00003-0003-0003-0003-000000000003', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '55555555-5555-5555-5555-555555555555', 20000, 'MacBook hala garantide mi? 20.000 TL teklif ediyorum.', 'pending', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('bid00004-0004-0004-0004-000000000004', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '88888888-8888-8888-8888-888888888888', 21000, 'Bataryası kaç saat gidiyor? 21K veriyorum.', 'pending', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

-- Bids on PS5 (by Emre and Ayşe)
('bid00005-0005-0005-0005-000000000005', 'c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', '77777777-7777-7777-7777-777777777777', 13500, 'PS5 için 13.500 TL teklif ediyorum. Oyunlar da dahil mi?', 'pending', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('bid00006-0006-0006-0006-000000000006', 'c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', '22222222-2222-2222-2222-222222222222', 14000, 'Konsol kaç saat kullanıldı? 14K son teklifim.', 'pending', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');

-- Display success message
SELECT 'İmece Marketplace veritabanı başarıyla gerçek kullanıcılar ve ürünlerle dolduruldu!' as result;
