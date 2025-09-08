# İMECE MARKETPLACE KULLANICI OLUŞTURMA REHBERİ

Bu rehber, İmece Marketplace uygulamanız için test kullanıcıları oluşturmanıza yardımcı olacaktır.

## Adım 1: Supabase Service Role Key'i Alın

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard
2. **Projenizi seçin** (guvdkdyrmmoyadmapokx)
3. **Settings** > **API** sekmesine gidin
4. **Service Role Key**'i bulun ve **kopyalayın**
   - ⚠️ Bu key çok gizlidir! Kimseyle paylaşmayın
   - anon key değil, service_role key olmalı

## Adım 2: Kullanıcıları Oluşturun

PowerShell'de şu komutu çalıştırın (SERVICE_KEY_HERE yerine gerçek key'i yapıştırın):

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="SERVICE_KEY_HERE"; node create-test-users.js
```

**Örnek:**
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; node create-test-users.js
```

## Adım 3: User ID'leri Not Edin

Script çalıştıktan sonra, her kullanıcı için bir User ID verecek. Bu ID'leri not edin.

## Adım 4: SQL Dosyasını Güncelleyin

`populate_real_users_and_goods.sql` dosyasındaki UUID'leri gerçek User ID'lerle değiştirin:

- `'11111111-1111-1111-1111-111111111111'` → Ahmet'in gerçek User ID'si
- `'22222222-2222-2222-2222-222222222222'` → Ayşe'nin gerçek User ID'si
- vb...

## Adım 5: SQL Dosyasını Çalıştırın

Supabase SQL Editor'da `populate_real_users_and_goods.sql` dosyasını çalıştırın.

## Oluşturulacak Kullanıcılar

1. **Ahmet Yılmaz** - ahmet.yilmaz@email.com - AhmetImece123!
2. **Ayşe Demir** - ayse.demir@email.com - AyseImece123!
3. **Mehmet Kaya** - mehmet.kaya@email.com - MehmetImece123!
4. **Zeynep Özkan** - zeynep.ozkan@email.com - ZeynepImece123!
5. **Can Şahin** - can.sahin@email.com - CanImece123!
6. **Elif Arslan** - elif.arslan@email.com - ElifImece123!
7. **Emre Yıldız** - emre.yildiz@email.com - EmreImece123!
8. **Selin Doğan** - selin.dogan@email.com - SelinImece123!

## Sorun Giderme

**"Invalid login credentials" hatası alıyorsanız:**
- Service role key'in doğru olduğundan emin olun
- Anon key değil, service_role key kullandığınızdan emin olun

**"User already exists" hatası alıyorsanız:**
- Bu normal, kullanıcı zaten var demektir
- Script çalışmaya devam edecektir

**Başka hatalar için:**
- Supabase Dashboard > Authentication > Users bölümüne bakın
- Console'daki hata mesajlarını kontrol edin
