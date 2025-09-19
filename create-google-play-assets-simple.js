const fs = require('fs');
const path = require('path');

function createGooglePlayAssets() {
  console.log('📱 Google Play Store varlıkları hazırlanıyor...');
  
  // Create google-play-assets directory
  const googlePlayDir = path.join(__dirname, 'google-play-assets');
  if (!fs.existsSync(googlePlayDir)) {
    fs.mkdirSync(googlePlayDir, { recursive: true });
  }
  
  // Copy current icon as reference
  if (fs.existsSync('assets/icon.png')) {
    fs.copyFileSync('assets/icon.png', path.join(googlePlayDir, 'original-icon.png'));
    console.log('✅ Mevcut icon kopyalandı: google-play-assets/original-icon.png');
  }
  
  // Create HTML tool for icon conversion
  const iconConverterHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Google Play Icon Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .tool { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
        canvas { border: 1px solid #ccc; margin: 10px 0; }
        .download-btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .download-btn:hover { background: #45a049; }
        input[type="file"] { margin: 10px 0; }
        .preview { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
    </style>
</head>
<body>
    <h1>🎨 Google Play Store Icon Converter</h1>
    
    <div class="tool">
        <h2>📱 App Icon Converter (512x512)</h2>
        <p>Google Play Store için 512x512 PNG icon oluştur (alpha channel olmadan)</p>
        <input type="file" id="iconInput" accept="image/*">
        <div class="preview">
            <div>
                <h4>Orijinal</h4>
                <canvas id="originalCanvas" width="256" height="256"></canvas>
            </div>
            <div>
                <h4>512x512 (Google Play)</h4>
                <canvas id="playStoreCanvas" width="256" height="256"></canvas>
                <br>
                <button class="download-btn" onclick="downloadPlayStoreIcon()">İndir (512x512)</button>
            </div>
        </div>
    </div>
    
    <div class="tool">
        <h2>🎯 Feature Graphic Creator (1024x500)</h2>
        <p>Google Play Store banner için feature graphic oluştur</p>
        <div>
            <label>App Adı: <input type="text" id="appName" value="ESKICI" style="padding: 5px; margin: 5px;"></label><br>
            <label>Alt Başlık: <input type="text" id="subtitle" value="Takas ve İkinci El Platformu" style="padding: 5px; margin: 5px; width: 300px;"></label><br>
            <label>Özellikler: <input type="text" id="features" value="• Güvenli Takas • AI Destekli • Kolay Kullanım" style="padding: 5px; margin: 5px; width: 400px;"></label><br>
            <button class="download-btn" onclick="createFeatureGraphic()">Feature Graphic Oluştur</button>
        </div>
        <div>
            <h4>Feature Graphic (1024x500)</h4>
            <canvas id="featureCanvas" width="512" height="250" style="max-width: 100%;"></canvas>
            <br>
            <button class="download-btn" onclick="downloadFeatureGraphic()">Feature Graphic İndir</button>
        </div>
    </div>
    
    <div class="tool">
        <h2>📋 Asset Checklist</h2>
        <ul>
            <li>✅ App Icon (512x512 PNG) - Bu araçla oluştur</li>
            <li>✅ Feature Graphic (1024x500) - Bu araçla oluştur</li>
            <li>⏳ Screenshots (2-8 adet telefon, 1-8 adet tablet)</li>
            <li>⏳ App Açıklaması (Türkçe, max 4000 karakter)</li>
            <li>⏳ Kısa Açıklama (max 80 karakter)</li>
            <li>⏳ Privacy Policy URL</li>
            <li>⏳ Terms of Service URL</li>
        </ul>
    </div>

    <script>
        let originalImage = null;
        
        document.getElementById('iconInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        originalImage = img;
                        drawOriginal();
                        createPlayStoreIcon();
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        function drawOriginal() {
            const canvas = document.getElementById('originalCanvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, 256, 256);
        }
        
        function createPlayStoreIcon() {
            if (!originalImage) return;
            
            const canvas = document.getElementById('playStoreCanvas');
            const ctx = canvas.getContext('2d');
            
            // Clear and fill with white background (remove alpha channel)
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the icon
            ctx.drawImage(originalImage, 0, 0, 256, 256);
        }
        
        function downloadPlayStoreIcon() {
            if (!originalImage) {
                alert('Önce bir icon yükleyin!');
                return;
            }
            
            // Create a 512x512 canvas for actual download
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // White background (no alpha channel)
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 512, 512);
            
            // Draw the icon
            ctx.drawImage(originalImage, 0, 0, 512, 512);
            
            // Download
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'app-icon-512.png';
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        
        function createFeatureGraphic() {
            const canvas = document.getElementById('featureCanvas');
            const ctx = canvas.getContext('2d');
            
            // Dimensions for display (will be scaled up for download)
            canvas.width = 512;
            canvas.height = 250;
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#439BEB');
            gradient.addColorStop(0.5, '#4FFFB0');
            gradient.addColorStop(1, '#FFD700');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add text
            const appName = document.getElementById('appName').value;
            const subtitle = document.getElementById('subtitle').value;
            const features = document.getElementById('features').value;
            
            // App name
            ctx.fillStyle = 'white';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.strokeText(appName, canvas.width/2, 75);
            ctx.fillText(appName, canvas.width/2, 75);
            
            // Subtitle
            ctx.font = '18px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(subtitle, canvas.width/2, 110);
            
            // Features
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(features, canvas.width/2, 140);
        }
        
        function downloadFeatureGraphic() {
            // Create full-size 1024x500 canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 500;
            const ctx = canvas.getContext('2d');
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#439BEB');
            gradient.addColorStop(0.5, '#4FFFB0');
            gradient.addColorStop(1, '#FFD700');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add text with proper scaling
            const appName = document.getElementById('appName').value;
            const subtitle = document.getElementById('subtitle').value;
            const features = document.getElementById('features').value;
            
            // App name
            ctx.fillStyle = 'white';
            ctx.font = 'bold 72px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 4;
            ctx.strokeText(appName, canvas.width/2, 150);
            ctx.fillText(appName, canvas.width/2, 150);
            
            // Subtitle
            ctx.font = '36px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillText(subtitle, canvas.width/2, 220);
            
            // Features
            ctx.font = '24px Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(features, canvas.width/2, 280);
            
            // Download
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'feature-graphic-1024x500.png';
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        
        // Initialize feature graphic
        createFeatureGraphic();
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(googlePlayDir, 'icon-converter.html'), iconConverterHTML);
  console.log('✅ Icon converter oluşturuldu: google-play-assets/icon-converter.html');
  
  // Create app descriptions in Turkish
  const appDescriptions = {
    app_title: "ESKICI - Takas ve İkinci El",
    short_description: "Güvenli takas platformu. AI destekli ürün tanıma, kolay kullanım, güvenilir alışveriş.",
    full_description: `🔄 ESKICI - Türkiye'nin En Güvenilir Takas Platformu

ESKİCİ ile eşyalarınızı güvenle takas edin, ikinci el alışverişin keyfini çıkarın!

✨ ÖNE ÇIKAN ÖZELLİKLER:
• 🤖 AI Destekli Ürün Tanıma - Fotoğraf çekin, ürün bilgileri otomatik dolsun
• 💬 Güvenli Mesajlaşma - Satıcılarla doğrudan iletişim kurun
• 📱 Kolay Kullanım - Sezgisel tasarım ile hızlı alışveriş
• 🔒 Güvenilir Sistem - Kullanıcı puanlama ve değerlendirme sistemi
• 📍 Konum Bazlı - Yakınınızdaki fırsatları keşfedin
• 💰 Teklif Sistemi - Pazarlık yapın, en iyi fiyatı yakalayın

🛍️ NASIL ÇALIŞIR:
1. Satmak istediğiniz ürünü fotoğraflayın
2. AI ile ürün bilgileri otomatik tamamlansın
3. Fiyat belirleyin ve yayınlayın
4. Teklifleri alın ve mesajlaşın
5. Güvenle takas edin!

🌱 SÜRDÜRÜLEBILIR YAŞAM:
• Çevre dostu alışveriş
• Atıkları azaltın, geri dönüşümü destekleyin
• Bütçe dostu seçenekler
• Yerel ekonomiye katkı

📊 KATEGORİLER:
• Elektronik • Giyim • Ev & Bahçe • Spor & Outdoor
• Kitap & Dergi • Oyuncak & Bebek • Aksesuar • Antika
• Müzik & Hobi • Kozmetik • Ve daha fazlası...

🎯 HEDEF KİTLE:
• Sürdürülebilir yaşam sevenler
• Ekonomik alışveriş yapanlar
• Teknoloji meraklıları
• Çevre bilinçli kullanıcılar

📞 DESTEK:
7/24 müşteri desteği ve kullanıcı dostu arayüz ile sorunsuz deneyim.

Hemen indirin ve ESKİCİ topluluğuna katılın! 🚀`,
    
    keywords: [
      "takas", "ikinci el", "alışveriş", "satış", "AI", "yapay zeka",
      "güvenli", "pazarlık", "teklif", "mesajlaşma", "sürdürülebilir",
      "çevre dostu", "geri dönüşüm", "ekonomik", "yerel", "topluluk"
    ],
    
    category: "Shopping",
    content_rating: "Everyone",
    target_audience: "13+",
    
    what_is_new: `🔄 Yeni Sürüm - v1.3.1

✨ Yenilikler:
• 🤖 Geliştirilmiş AI ürün tanıma sistemi
• 📱 Yeni kullanıcı arayüzü tasarımı
• 💬 Hızlandırılmış mesajlaşma sistemi
• 🔒 Artırılmış güvenlik önlemleri
• 📍 Otomatik konum tanıma özelliği
• 🎨 Yeni marka kimliği ve iconlar

🐛 Hata Düzeltmeleri:
• Mesajlaşma sorunları giderildi
• Performans iyileştirmeleri
• Uygulama kararlılığı artırıldı

Geribildirimleriniz için teşekkürler! 🙏`
  };
  
  fs.writeFileSync(
    path.join(googlePlayDir, 'app-descriptions.json'),
    JSON.stringify(appDescriptions, null, 2)
  );
  console.log('✅ App açıklamaları hazırlandı: google-play-assets/app-descriptions.json');
  
  // Create privacy policy content
  const privacyPolicy = `# ESKICI - Gizlilik Politikası

## 1. Toplanan Bilgiler
• Hesap bilgileri (email, isim, profil fotoğrafı)
• Ürün bilgileri ve fotoğrafları
• Mesajlaşma içerikleri
• Konum bilgileri (isteğe bağlı)
• Uygulama kullanım verileri

## 2. Bilgilerin Kullanımı
• Hizmet sağlamak ve iyileştirmek
• Kullanıcılar arası iletişimi sağlamak
• Güvenlik ve dolandırıcılık önleme
• Müşteri desteği sağlamak

## 3. Bilgi Paylaşımı
• Bilgileriniz üçüncü taraflarla satılmaz
• Sadece hizmet sağlamak için gerekli durumlarda paylaşılır
• Yasal zorunluluklar hariç

## 4. Veri Güvenliği
• SSL şifreleme ile güvenli veri transferi
• Düzenli güvenlik güncellemeleri
• Erişim kontrolü ve kimlik doğrulama

## 5. Kullanıcı Hakları
• Verilerinizi görüntüleme hakkı
• Verilerin düzeltilmesi talebi
• Hesap silme ve veri silinmesi hakkı

İletişim: privacy@eskici.com`;

  fs.writeFileSync(path.join(googlePlayDir, 'privacy-policy.md'), privacyPolicy);
  console.log('✅ Gizlilik politikası hazırlandı: google-play-assets/privacy-policy.md');
  
  // Create terms of service
  const termsOfService = `# ESKICI - Kullanım Şartları

## 1. Hizmet Tanımı
ESKICI, kullanıcılar arasında ikinci el eşya alım-satım ve takas platformudur.

## 2. Kullanıcı Sorumlulukları
• Doğru bilgi paylaşmak
• Yasalara uygun davranmak
• Diğer kullanıcılara saygılı olmak
• Sahte/yasal olmayan ürün satmamak

## 3. Yasaklı İçerikler
• Yasadışı ürünler
• Sahte markalar
• Zararlı maddeler
• Telif hakkı ihlal eden içerikler

## 4. Ödeme ve İadeler
• Ödemeler kullanıcılar arasında gerçekleşir
• Platform işlem komisyonu alabilir
• İade politikaları satıcı tarafından belirlenir

## 5. Hesap Askıya Alma
Platform, kural ihlali durumunda hesapları askıya alma hakkını saklı tutar.

## 6. Değişiklikler
Kullanım şartları önceden bildirimle değiştirilebilir.

İletişim: support@eskici.com`;

  fs.writeFileSync(path.join(googlePlayDir, 'terms-of-service.md'), termsOfService);
  console.log('✅ Kullanım şartları hazırlandı: google-play-assets/terms-of-service.md');
  
  // Create screenshot guide
  const screenshotGuide = `# 📸 Google Play Store Screenshots Rehberi

## 📱 TELEFON SCREENSHOTS (ZORUNLU)
**Gereksinimler:**
- Boyut: 1080x1920 (portrait) veya 1920x1080 (landscape)
- Format: PNG veya JPEG
- Adet: Minimum 2, maksimum 8
- Kalite: Yüksek çözünürlük, berrak

**Önerilen Ekranlar:**
1. **Ana Sayfa** - Ürün listesi grid görünümü
2. **Ürün Detay** - Fotoğraflar, açıklama, fiyat
3. **Teklif Verme** - Bidding modal açık
4. **Mesajlaşma** - Chat ekranı
5. **Profil** - Kullanıcı profil sayfası
6. **Ürün Ekleme** - Yeni ilan oluşturma
7. **AI Tanıma** - Kamera ile ürün tanıma
8. **Arama** - Kategori ve filtreler

## 📟 TABLET SCREENSHOTS (İSTEĞE BAĞLI)
**Gereksinimler:**
- Boyut: 1200+ piksel genişlik
- Format: PNG veya JPEG
- Adet: Minimum 1, maksimum 8

**Önerilen Ekranlar:**
1. **Ana Sayfa Grid** - Geniş ekran ürün listesi
2. **Split Screen** - Ürün listesi + detay
3. **Dashboard** - Kullanıcı paneli

## 🎨 SCREENSHOT HAZIRLIK İPUÇLARI

### Cihaz Hazırlığı
- Telefonun şarjını %100 yapın
- Bildirimları temizleyin
- Demo verileri hazırlayın
- Yatay/dikey yönlendirmeyi ayarlayın

### İçerik Hazırlığı
- Gerçekçi ürün fotoğrafları kullanın
- Türkçe içerik ekleyin
- Çeşitli kategorilerden örnekler
- Kullanıcı avatarları ve isimleri

### Görsel Kalite
- Parlak, berrak ekran
- Yüksek kontrast
- Doğal renkler
- Gölge/yansıma olmaması

### Yasal Gereksinimler
- Kişisel bilgileri gizleyin
- Telif hakkı olan içerikleri kullanmayın
- Gerçek kullanıcı verilerini maskeleyين

## 📋 KONTROL LİSTESİ

### Çekim Öncesi
- [ ] Demo veriler hazır
- [ ] Uygulama güncel sürümde
- [ ] Cihaz temiz durumda
- [ ] Batarya dolu
- [ ] Bildirimler kapalı

### Çekim Sırası
- [ ] Her ekran için 2-3 varyasyon
- [ ] Farklı içeriklerle test
- [ ] Hem açık hem koyu tema
- [ ] Loading durumları dahil

### Çekim Sonrası
- [ ] Boyutları kontrol et
- [ ] Dosya adlarını düzenle
- [ ] Kaliteyi değerlendir
- [ ] Google Play gereksinimlerini karşıla

## 🛠️ ÖNERİLEN ARAÇLAR
- **Android:** adb shell screencap
- **iOS:** Simulator screenshots
- **Düzenleme:** GIMP, Photoshop, Canva
- **Mockup:** Device frames, Figma templates`;

  fs.writeFileSync(path.join(googlePlayDir, 'screenshot-guide.md'), screenshotGuide);
  console.log('✅ Screenshot rehberi hazırlandı: google-play-assets/screenshot-guide.md');
  
  // Create final checklist
  const checklist = `# ✅ Google Play Store Yayınlama Kontrol Listesi

## 📱 UYGULAMA VARIKLARI
- [ ] App Icon (512x512 PNG) ← icon-converter.html ile oluştur
- [ ] Feature Graphic (1024x500) ← icon-converter.html ile oluştur
- [ ] Telefon Screenshots (2-8 adet)
- [ ] Tablet Screenshots (1-8 adet)

## 📝 İÇERİK
- [ ] App Başlığı (max 50 karakter): "${appDescriptions.app_title}"
- [ ] Kısa Açıklama (max 80 karakter)
- [ ] Tam Açıklama (max 4000 karakter)
- [ ] Yenilikler açıklaması

## 🔒 YASAL BELGELER
- [ ] Privacy Policy URL: privacy-policy.md dosyasını web'de yayınla
- [ ] Terms of Service URL: terms-of-service.md dosyasını web'de yayınla

## ⚙️ UYGULAMA AYARLARI
- [ ] Kategori: Shopping
- [ ] Hedef Kitle: Teen (13+)
- [ ] İçerik Derecelendirmesi: Everyone
- [ ] Ülke/Bölge: Türkiye

## 🔧 TEKNİK GEREKSINIMLER
- [ ] App Bundle (.aab) hazır
- [ ] İmzalı APK
- [ ] Minimum SDK version
- [ ] Target SDK version güncel
- [ ] Permissions listesi

## 🎯 MAĞAZA AYARLARI
- [ ] Pricing: Free/Paid
- [ ] In-app purchases (varsa)
- [ ] Distribution countries
- [ ] Device compatibility

## 📊 ANALİTİK
- [ ] Google Analytics entegrasyonu
- [ ] Crash reporting
- [ ] Performance monitoring

## 🚀 SON KONTROLLER
- [ ] Tüm linkler çalışıyor
- [ ] Görseller yüklendi
- [ ] Açıklamalar eksiksiz
- [ ] Yasal belgeler erişilebilir
- [ ] App bundle test edildi

## 📞 DESTEK HAZIRLIĞI
- [ ] Support email aktif
- [ ] Documentation hazır
- [ ] FAQ sayfası
- [ ] User feedback sistemi

Bu listeyi tamamladıktan sonra Google Play Console'da "Review" butonuna basabilirsiniz!`;

  fs.writeFileSync(path.join(googlePlayDir, 'CHECKLIST.md'), checklist);
  console.log('✅ Kontrol listesi hazırlandı: google-play-assets/CHECKLIST.md');
  
  console.log('\n🎉 Google Play Store varlıkları hazır!');
  console.log('\n📁 Oluşturulan dosyalar:');
  console.log('  📱 icon-converter.html - Icon ve feature graphic oluşturucu');
  console.log('  📝 app-descriptions.json - Türkçe açıklamalar');
  console.log('  🔒 privacy-policy.md - Gizlilik politikası');
  console.log('  📜 terms-of-service.md - Kullanım şartları');
  console.log('  📸 screenshot-guide.md - Screenshot çekme rehberi');
  console.log('  ✅ CHECKLIST.md - Yayınlama kontrol listesi');
  console.log('  🖼️ original-icon.png - Referans icon');
  
  console.log('\n🚀 Sonraki adımlar:');
  console.log('  1. icon-converter.html dosyasını tarayıcıda aç');
  console.log('  2. Icon ve feature graphic oluştur');
  console.log('  3. Screenshots çek (screenshot-guide.md rehberini kullan)');
  console.log('  4. Privacy policy ve terms\'i web\'de yayınla');
  console.log('  5. Google Play Console\'a yükle');
}

createGooglePlayAssets();