# Enhanced User Registration System

Bu belge, yeni kullanıcı kayıt sistemindeki geliştirmeleri açıklar.

## 🆕 Yenilikler

### Kapsamlı Kullanıcı Bilgileri
Artık yeni üye kaydında aşağıdaki bilgiler toplanıyor:

**Zorunlu Alanlar:**
- ✅ **Ad** - Kullanıcının adı
- ✅ **Soyad** - Kullanıcının soyadı  
- ✅ **Email** - Email adresi (format kontrolü ile)
- ✅ **Şifre** - Minimum 6 karakter (tekrar kontrolü ile)

**İsteğe Bağlı Alanlar:**
- 📱 **Telefon** - Türkiye telefon numarası formatında
- 🏙️ **Şehir** - Kullanıcının şehri
- 📅 **Doğum Tarihi** - GG/AA/YYYY formatında
- 👤 **Cinsiyet** - Erkek / Kadın / Diğer seçenekleri
- 🏠 **Ev Adresi** - Tam ev adresi (maks. 200 karakter)
- 📮 **Ev Posta Kodu** - 5 haneli posta kodu
- 🏢 **İş Adresi** - İş/ofis adresi (maks. 200 karakter)
- 📮 **İş Posta Kodu** - 5 haneli posta kodu

### Gelişmiş Form Validasyonu

**Email Kontrolü:**
- Geçerli email formatı kontrolü
- Örnek: user@example.com

**Telefon Kontrolü:**
- Türkiye telefon numarası formatı
- Örnekler: 0555 123 45 67, +90 555 123 45 67

**Posta Kodu Kontrolü:**
- 5 haneli rakam formatı
- Türkiye posta kodları için uygun
- Örnekler: 34567, 06100, 35000

**Şifre Kontrolü:**
- Minimum 6 karakter
- Şifre tekrarı eşleşme kontrolü

## 📱 Kullanıcı Arayüzü

### Modern Kayıt Formu
- **Bölümlü Tasarım:** Kişisel Bilgiler, Adres Bilgileri ve Güvenlik bölümleri
- **Cinsiyet Seçimi:** Görsel butonlar ile kolay seçim
- **Adres Alanları:** Ev ve iş adresi için ayrı bölümler
- **Otomatik Formatlama:** Posta kodları otomatik formatlanır
- **Kullanıcı Dostu:** Zorunlu alanlar işaretli (*)
- **Responsive:** Mobil ve tablet uyumlu

### Profil Görünümü
- **Tüm Bilgilerin Görüntülenmesi:** Kayıt olan bilgiler profil sayfasında görünür
- **Dinamik Görünüm:** Sadece dolu alanlar gösterilir
- **Türkçe Etiketler:** Tüm alanlar Türkçe etiketlerle
- **Üyelik Tarihi:** Hesap oluşturma tarihi gösterilir

## 🗄️ Veritabanı Şeması

### Profiles Tablosu Güncellemeleri

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  home_address TEXT,
  home_postal_code TEXT CHECK (home_postal_code ~ '^\d{5}$'),
  work_address TEXT,
  work_postal_code TEXT CHECK (work_postal_code ~ '^\d{5}$'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### Yeni Constraints
- **first_name_length:** 1-50 karakter
- **last_name_length:** 1-50 karakter  
- **email_format:** Geçerli email formatı
- **phone_format:** Uluslararası telefon formatı
- **gender:** Sadece 'male', 'female', 'other' değerleri
- **home_postal_code_format:** 5 haneli rakam formatı
- **work_postal_code_format:** 5 haneli rakam formatı
- **home_address_length:** Maksimum 200 karakter
- **work_address_length:** Maksimum 200 karakter

### Performans İyileştirmeleri
- **Yeni İndeksler:** first_name, last_name, email, city, home_postal_code, work_postal_code alanları için
- **Optimizasyon:** Sık kullanılan alanlar için hızlı arama

## 🔧 Teknik Detaylar

### TypeScript Type Güncellemeleri

```typescript
export type User = {
  id: string;
  email?: string;
  phone?: string;
  display_name?: string;
  first_name?: string;      // YENİ
  last_name?: string;       // YENİ
  city?: string;
  birth_date?: string;      // YENİ
  gender?: string;          // YENİ
  home_address?: string;    // YENİ
  home_postal_code?: string; // YENİ
  work_address?: string;    // YENİ
  work_postal_code?: string; // YENİ
  avatar_url?: string;
  created_at: string;
  updated_at?: string;      // YENİ
};
```

### Mock Mod Desteği
- **Geliştirme:** Supabase olmadan test edilebilir
- **Fallback:** Gerçek veritabanı hatalarında mock moda geçer
- **Veri Persistance:** AsyncStorage ile yerel kayıt

## 🚀 Kurulum ve Kullanım

### 1. Veritabanı Güncelleme

**Eğer PGRST204 hatası alıyorsanız:**

```bash
# Hata çözüm scriptini çalıştır
npm run fix-registration
```

Bu script size gerekli SQL'i gösterecek. SQL'i kopyalayıp Supabase SQL Editor'de çalıştırın.

**Alternatif yöntemler:**

```bash
# Otomatik güncelleme scripti (bazı durumlarda çalışmayabilir)
npm run update-profiles

# Manuel SQL dosyası
# sql/migrate_profiles_enhanced.sql dosyasını Supabase SQL Editor'de çalıştır
```

### 2. Mevcut Uygulamayı Başlat

```bash
npm start
```

### 3. Yeni Kayıt Testi

1. Uygulamayı açın
2. "Hesap Oluştur" butonuna tıklayın
3. Formu doldurun ve "Hesap Oluştur"a basın
4. Profil sayfasında bilgilerinizi kontrol edin

## 🛠️ Geliştirici Notları

### Form State Yönetimi
- **useState:** React hook ile form durumu yönetimi
- **Validation:** Frontend'de anlık kontrol
- **Error Handling:** Kullanıcı dostu hata mesajları

### Authentication Service
- **Backward Compatibility:** Eski kullanıcılar etkilenmez
- **Graceful Degradation:** Eksik alanlar için varsayılan değerler
- **Error Recovery:** Hata durumunda mock mod aktif

### Styling
- **Modern Design:** Material Design ilkelerini takip eder
- **Accessibility:** Görsel engeliler için uygun kontrastlar
- **Consistency:** Uygulama genelinde tutarlı tasarım

## 📋 Test Senaryoları

### ✅ Başarılı Kayıt
1. Tüm zorunlu alanları doldur
2. Geçerli email ve telefon formatı kullan
3. Şifre tekrarını doğru gir
4. "Hesap Oluştur" butonuna bas
5. Başarı mesajı görmeli
6. Profil sayfasında bilgileri kontrol et

### ❌ Hata Durumları
1. **Eksik Zorunlu Alanlar:** "Lütfen zorunlu alanları doldurun" mesajı
2. **Geçersiz Email:** "Geçerli bir email adresi girin" mesajı
3. **Şifre Uyumsuzluğu:** "Şifreler eşleşmiyor" mesajı
4. **Kısa Şifre:** "Şifre en az 6 karakter olmalıdır" mesajı
5. **Geçersiz Telefon:** "Geçerli bir Türkiye telefon numarası girin" mesajı
6. **Geçersiz Doğum Tarihi:** "Doğum tarihi formatı: GG/AA/YYYY" mesajı
7. **Gelecek Tarih:** "Doğum tarihi gelecekte olamaz" mesajı
8. **Geçersiz Ev Posta Kodu:** "Ev posta kodu 5 haneli rakam olmalıdır" mesajı
9. **Geçersiz İş Posta Kodu:** "İş posta kodu 5 haneli rakam olmalıdır" mesajı
10. **PGRST204 Hatası:** "Could not find column in schema cache" 
    - **Çözüm:** `npm run fix-registration` çalıştır ve çıkan SQL'i Supabase'de çalıştır
11. **22008 Hatası:** "date/time field value out of range"
    - **Çözüm:** Doğum tarihi formatını kontrol et (GG/AA/YYYY)
12. **42501 Hatası:** "new row violates row-level security policy"
    - **Çözüm:** `npm run fix-rls-error` çalıştır ve çıkan SQL'i Supabase'de çalıştır

## 🔮 Gelecek Geliştirmeler

### Planlanmış Özellikler
- **Avatar Upload:** Profil fotoğrafı yükleme
- **Email Verification:** Email doğrulama sistemi
- **Social Login:** Google/Facebook ile giriş
- **Profile Edit:** Profil bilgilerini düzenleme
- **Privacy Settings:** Gizlilik ayarları

### Performans İyileştirmeleri
- **Image Optimization:** Avatar resimleri için
- **Caching:** Profil bilgileri için cache
- **Lazy Loading:** Form bileşenleri için

---

**Son Güncelleme:** 30 Ağustos 2025  
**Versiyon:** 2.0.0  
**Geliştirici:** Barter MVP Team
