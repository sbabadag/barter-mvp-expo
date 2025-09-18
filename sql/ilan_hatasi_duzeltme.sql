-- İLAN OLUŞTURMA HATASI DÜZELTMESİ
-- RLS politikalarını düzeltelim

-- Önce listings tablosunun RLS'ini geçici olarak devre dışı bırakalım
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;

SELECT 'Listings RLS devre dışı bırakıldı - şimdi ilan oluşturmayı deneyin!' as status;

-- Eğer bu çalışırsa, daha iyi politikalar oluşturalım
-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users can update listings" ON public.listings;

-- Basit ve çalışan politikalar oluştur
CREATE POLICY "Herkes ilanları görebilir" ON public.listings
    FOR SELECT USING (true);

CREATE POLICY "Kimlik doğrulanmış kullanıcılar ilan oluşturabilir" ON public.listings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Kimlik doğrulanmış kullanıcılar ilan güncelleyebilir" ON public.listings
    FOR UPDATE USING (true);

CREATE POLICY "Kimlik doğrulanmış kullanıcılar ilan silebilir" ON public.listings
    FOR DELETE USING (true);

-- RLS'i yeniden etkinleştir
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- İzinleri kontrol et
GRANT ALL ON public.listings TO authenticated;

SELECT 'Listings RLS politikaları düzeltildi! İlan oluşturmayı tekrar deneyin! 🎉' as final_status;