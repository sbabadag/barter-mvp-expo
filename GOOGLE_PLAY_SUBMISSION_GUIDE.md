# 🚀 Google Play Store Yayınlama Rehberi - ESKICI

## 📋 Mevcut Durum
✅ **AAB Dosyası Hazır:** https://expo.dev/artifacts/eas/4XXBnZgUjtEYKJHB3tFVJ6.aab
✅ **Version:** 1.3.0 (Version Code: 10)
✅ **SDK:** Expo 54.0.0
✅ **Build Profile:** Production (Store Distribution)

## 🎯 Google Play Console Adımları

### 1. Google Play Console'a Giriş
- https://play.google.com/console adresine gidin
- Google hesabınızla giriş yapın
- "Create app" veya "Uygulama oluştur" butonuna tıklayın

### 2. Uygulama Bilgileri
```
App name: ESKICI
Default language: Turkish (Turkey)
App or game: App
Free or paid: Free
```

### 3. Declarations (Beyanlar)
- ✅ Content rating questionnaire
- ✅ Target audience and content
- ✅ News apps (if applicable)
- ✅ COVID-19 contact tracing and status apps (No)
- ✅ Data safety

### 4. App Content Requirements

#### Privacy Policy (Gizlilik Politikası)
✅ **Dosya mevcut:** `PRIVACY_POLICY.md`
- Bu dosyayı web sitenizde yayınlayın veya GitHub Pages kullanın

#### App Category
```
Category: Lifestyle > Social
Tags: takas, komşu, al-sat, second-hand, marketplace
```

#### Content Rating
- PEGI: 3+ (Everyone)
- ESRB: Everyone
- İçerik: Ticaret ve sosyal etkileşim

#### Target Audience
```
Primary: 18-65 yaş arası
Secondary: Çevre bilinçli bireyler
Geography: Turkey (primarily)
```

## 🎨 Store Listing Assets (Gerekli Görseller)

### App Icon
✅ **Mevcut:** `assets/icon.png` (1024x1024, 273KB)
- AI mandala tasarımı, mavi-altın tonlar

### Feature Graphic
✅ **Oluşturucu hazır:** `feature-graphic-generator.html`
- **Boyut:** 1024x500 piksel
- **Format:** PNG veya JPEG
- **Önerilen:** Mandala temalı tasarım

### Screenshots
📱 **Gerekli:** En az 2, en fazla 8 screenshot
- **Phone:** 16:9 veya 9:16 aspect ratio
- **Tablet:** 16:10 veya 10:16 aspect ratio
- **Boyut:** Minimum 320px, maksimum 3840px

📋 **Screenshot Konuları:**
1. Ana sayfa (ürün listesi)
2. Ürün detay sayfası
3. Mesajlaşma ekranı
4. Profil sayfası
5. Takas süreci

### Promotional Video (Opsiyonel)
- YouTube link
- 30 saniye - 2 dakika arası
- Uygulamanın temel özelliklerini göster

## 📝 Store Listing Metinleri

### Short Description (Kısa Açıklama)
```
Komşularınızla güvenli takas! Kullanmadığınız eşyaları değerlendirin, ihtiyacınız olanları bulun. 🤝♻️
```

### Full Description (Tam Açıklama)
```
🏠 **ESKICI - Komşular Arası Güvenli Takas Platformu**

Artık kullanmadığınız eşyaları çöpe atmak yerine, komşularınızla takas edebilirsiniz! ESKICI ile çevrenizde yaşayan insanlarla güvenli bir şekilde ürün alışverişi yapın.

**✨ ÖZELLIKLER:**
🤝 Güvenli komşuluk ağı
📍 Yakın mesafe odaklı eşleşme  
💬 Anlık mesajlaşma sistemi
⭐ Güvenilir puanlama sistemi
📱 Kolay kullanımlı arayüz
♻️ Sürdürülebilir yaşam katkısı

**🛍️ NE TAKAS EDEBİLİRSİNİZ:**
• Ev eşyaları ve dekorasyon
• Giyim ve aksesuar
• Kitap ve dergi
• Elektronik cihazlar
• Oyuncak ve oyun
• Bahçe araçları
• Ve daha fazlası...

**🔒 GÜVENLİK:**
• Kimlik doğrulama sistemi
• Güvenilir kullanıcı puanları
• Şikâyet ve raporlama sistemi
• Güvenli mesajlaşma

**🌱 ÇEVRE DOSTU:**
Gereksiz tüketimi azaltarak çevreye katkıda bulunun. Bir kişinin atığı, başka birinin ihtiyacı olabilir!

İndirin, komşularınızla tanışın ve sürdürülebilir bir yaşam tarzına geçin! 🌍
```

## 🛠️ Technical Requirements

### App Bundle (AAB)
✅ **Hazır:** Build ID 201b981d-8634-4723-ab8e-7abf40aa3b45
- **Download URL:** https://expo.dev/artifacts/eas/4XXBnZgUjtEYKJHB3tFVJ6.aab
- **Version:** 1.3.0 (Version Code: 10)
- **Size:** ~50MB (estimated)

### App Signing
✅ **Expo App Signing:** Otomatik olarak yapılandırılmış
- Expo'nun managed workflow'u kullanıyor
- Google Play App Signing önerilir

### Permissions
📋 **Gerekli İzinler:**
- INTERNET (ağ erişimi)
- CAMERA (ürün fotoğrafı)
- READ_EXTERNAL_STORAGE (galeri erişimi)
- ACCESS_FINE_LOCATION (konum servisleri)
- NOTIFICATIONS (bildirimler)

## 🚀 Yayınlama Adımları

### 1. Internal Testing (Önerilen İlk Adım)
1. Google Play Console → Testing → Internal testing
2. AAB dosyasını yükle
3. Test cihazları ve kullanıcıları ekle
4. Test et ve feedback al

### 2. Production Release
1. Internal testing başarılı olduktan sonra
2. Production → Releases → Create new release
3. AAB dosyasını yükle
4. Release notes yaz
5. Review and rollout

### 3. Release Notes (Sürüm Notları)
```
🎉 ESKICI'nin ilk sürümü!

✨ Ana Özellikler:
• Komşularla güvenli takas
• Kolay ürün listeleme
• Anlık mesajlaşma
• Puanlama sistemi
• Çevre dostu yaklaşım

🔧 Teknik:
• Hızlı ve güvenilir
• Kullanıcı dostu arayüz
• Modern tasarım

Feedback'lerinizi bekliyoruz! 📧
```

## 📧 Support & Contact
```
Email: support@eskici.app (veya mevcut email)
Website: https://eskici.app (veya GitHub Pages)
Privacy Policy: https://eskici.app/privacy (gerekli)
```

## ⚠️ Önemli Notlar

1. **App Review Süresi:** 1-3 gün (bazen daha uzun)
2. **Content Policy:** Google Play politikalarına uygun olduğundan emin olun
3. **Regional Restrictions:** Türkiye odaklı ama global kullanılabilir
4. **Updates:** Düzenli güncellemeler için CI/CD pipeline'ı kurun
5. **Analytics:** Google Play Console analytics'i takip edin

## 🎯 Sonraki Adımlar

1. ✅ AAB dosyasını indir
2. 🎨 Feature graphic oluştur
3. 📱 Screenshot'lar hazırla
4. 📝 Store listing'i tamamla
5. 🚀 Internal testing'e yükle
6. 🧪 Test et ve iyileştir
7. 🌟 Production'a yayınla

---
**🎊 Başarılar! ESKICI çok yakında Google Play Store'da!**