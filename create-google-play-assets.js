const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createGooglePlayAssets() {
  console.log('🎨 Google Play Store varlıkları oluşturuluyor...');
  
  // Create google-play-assets directory
  const googlePlayDir = path.join(__dirname, 'google-play-assets');
  if (!fs.existsSync(googlePlayDir)) {
    fs.mkdirSync(googlePlayDir, { recursive: true });
  }
  
  try {
    // 1. App Icon for Google Play Store (512x512)
    console.log('📱 App Icon oluşturuluyor (512x512)...');
    
    await sharp('assets/icon.png')
      .resize(512, 512, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
        position: 'center'
      })
      .png({
        quality: 100,
        compressionLevel: 6,
        alpha: false // Google Play Store doesn't support alpha channel
      })
      .toFile(path.join(googlePlayDir, 'app-icon-512.png'));
    
    console.log('✅ App Icon hazır: google-play-assets/app-icon-512.png');
    
    // 2. Feature Graphic (1024x500) - Create a branded banner
    console.log('🎯 Feature Graphic oluşturuluyor (1024x500)...');
    
    // Create a gradient background with app icon
    const featureGraphic = sharp({
      create: {
        width: 1024,
        height: 500,
        channels: 3,
        background: { r: 67, g: 155, b: 235 } // Blue gradient start
      }
    });
    
    // Create gradient overlay
    const gradientSvg = `
      <svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#439BEB;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#4FFFB0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1024" height="500" fill="url(#grad)" />
        <!-- App Title -->
        <text x="512" y="150" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white" stroke="rgba(0,0,0,0.3)" stroke-width="2">ESKICI</text>
        <text x="512" y="220" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="white" opacity="0.9">Takas ve İkinci El Platformu</text>
        <text x="512" y="280" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white" opacity="0.8">• Güvenli Takas • AI Destekli • Kolay Kullanım</text>
      </svg>
    `;
    
    await sharp(Buffer.from(gradientSvg))
      .png()
      .toFile(path.join(googlePlayDir, 'feature-graphic-1024x500.png'));
    
    console.log('✅ Feature Graphic hazır: google-play-assets/feature-graphic-1024x500.png');
    
    // 3. Create promo/marketing materials
    console.log('📸 Marketing materyalleri oluşturuluyor...');
    
    // High-res icon for marketing (1024x1024)
    await sharp('assets/icon.png')
      .resize(1024, 1024, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 100 })
      .toFile(path.join(googlePlayDir, 'app-icon-1024.png'));
    
    console.log('✅ High-res icon hazır: google-play-assets/app-icon-1024.png');
    
    // 4. Create icon variations for different contexts
    const iconSizes = [72, 96, 144, 192, 256];
    
    for (const size of iconSizes) {
      await sharp('assets/icon.png')
        .resize(size, size)
        .png()
        .toFile(path.join(googlePlayDir, `app-icon-${size}.png`));
    }
    
    console.log('✅ Icon varyasyonları hazır');
    
    // 5. Create assets info file
    const assetsInfo = {
      created: new Date().toISOString(),
      app_name: "ESKICI",
      package_name: "com.eskici.barterapp",
      assets: {
        app_icon_512: "app-icon-512.png",
        app_icon_1024: "app-icon-1024.png", 
        feature_graphic: "feature-graphic-1024x500.png",
        icon_variations: iconSizes.map(size => `app-icon-${size}.png`)
      },
      requirements: {
        google_play: {
          app_icon: "512x512 PNG, no alpha channel, max 1MB",
          feature_graphic: "1024x500 JPEG/PNG, no alpha channel",
          screenshots_phone: "Min 2, max 8, 320-3840px width",
          screenshots_tablet: "Min 1, max 8, 1200-3840px width"
        }
      },
      next_steps: [
        "Screenshots oluştur (telefon ve tablet)",
        "App description yaz (Türkçe)",
        "Privacy Policy ve Terms hazırla",
        "Google Play Console'a yükle"
      ]
    };
    
    fs.writeFileSync(
      path.join(googlePlayDir, 'assets-info.json'),
      JSON.stringify(assetsInfo, null, 2)
    );
    
    console.log('✅ Asset bilgileri kayıtlı: google-play-assets/assets-info.json');
    
    console.log('\n🎉 Google Play Store varlıkları hazır!');
    console.log('📁 Klasör: google-play-assets/');
    console.log('\n📋 Hazırlanan dosyalar:');
    console.log('  • app-icon-512.png (Google Play Store için)');
    console.log('  • feature-graphic-1024x500.png (Store banner)');
    console.log('  • app-icon-1024.png (Yüksek çözünürlük)');
    console.log('  • Icon varyasyonları (72-256px)');
    console.log('  • assets-info.json (Detay bilgiler)');
    
    console.log('\n⚠️  Sonraki adımlar:');
    console.log('  1. Screenshots çek (telefon + tablet)');
    console.log('  2. App description yaz');
    console.log('  3. Privacy Policy hazırla');
    console.log('  4. Google Play Console\'a yükle');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('\n🔧 Manuel oluşturma rehberi:');
    console.log('1. assets/icon.png dosyasını 512x512 boyutunda PNG olarak kaydet');
    console.log('2. Feature graphic için 1024x500 boyutunda marka bannerı oluştur');
    console.log('3. Uygulama ekran görüntülerini çek');
  }
}

// Sharp modülü yoksa basit dosya kopyalama
function fallbackAssetCreation() {
  console.log('📋 Sharp modülü bulunamadı, manuel asset rehberi oluşturuluyor...');
  
  const googlePlayDir = path.join(__dirname, 'google-play-assets');
  if (!fs.existsSync(googlePlayDir)) {
    fs.mkdirSync(googlePlayDir, { recursive: true });
  }
  
  // Copy current icon as reference
  if (fs.existsSync('assets/icon.png')) {
    fs.copyFileSync('assets/icon.png', path.join(googlePlayDir, 'original-icon.png'));
    console.log('✅ Mevcut icon kopyalandı: google-play-assets/original-icon.png');
  }
  
  // Create manual instructions
  const instructions = `
# Google Play Store Assets - Manuel Hazırlama

## 1. APP ICON (ZORUNLU)
- Dosya: original-icon.png'yi kullan
- Boyut: 512x512 piksel olarak yeniden boyutlandır
- Format: PNG (alpha channel kaldır)
- Dosya adı: app-icon-512.png

## 2. FEATURE GRAPHIC (ZORUNLU)
- Boyut: 1024x500 piksel
- İçerik: ESKICI logo + "Takas ve İkinci El Platformu" yazısı
- Format: PNG veya JPEG (alpha channel yok)
- Renk: Gradient mavi-yeşil tema

## 3. SCREENSHOTS (ZORUNLU)
### Telefon (Minimum 2 adet)
- Boyut: 1080x1920 (portrait) veya 1920x1080 (landscape)
- Ekranlar: Ana sayfa, ürün detay, mesajlaşma, profil

### Tablet (İsteğe bağlı)
- Boyut: 1200+ piksel genişlik
- Grid görünüm, geniş ekran düzeni

## 4. ONLINE ARAÇLAR
- Canva: Feature graphic oluşturmak için
- GIMP/Photoshop: Icon ve screenshot düzenleme
- Figma: UI mockup oluşturma

## 5. TEMPLATEler
- Google Play Store asset templateları kullan
- Material Design rehberini takip et
- Türk kullanıcılar için lokalizasyon

Hazırlandıktan sonra tüm dosyaları google-play-assets/ klasörüne koy.
`;
  
  fs.writeFileSync(path.join(googlePlayDir, 'MANUAL_INSTRUCTIONS.md'), instructions);
  console.log('✅ Manuel rehber oluşturuldu: google-play-assets/MANUAL_INSTRUCTIONS.md');
}

// Check if sharp is available
try {
  require.resolve('sharp');
  createGooglePlayAssets();
} catch (error) {
  fallbackAssetCreation();
}