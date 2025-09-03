# 📷 Kamera ve Fotoğraf Özelliği

## 🎯 Yeni Özellikler

### İlan Ver sayfasında fotoğraf ekleme seçenekleri:

#### 📸 Kamera ile Çekim:
- **Instant Photo**: Anında fotoğraf çek
- **Kamera İzni**: Otomatik izin talebi
- **Photo Editing**: Çekim sonrası düzenleme (4:3 crop)
- **Quality**: 0.8 kalite (boyut optimizasyonu)

#### 🖼️ Galeri Seçimi:
- **Multiple Selection**: Birden fazla fotoğraf seçimi (max 6)
- **Photo Library**: Telefon galerisinden seçim
- **Batch Upload**: Toplu fotoğraf ekleme

## 🔧 Teknik Detaylar

### Permissions:
- `expo-image-picker`: Kamera ve galeri erişimi
- Camera permissions: Çekim için otomatik izin
- Photo library: Galeri erişimi

### Settings:
```typescript
// Kamera Ayarları
{
  mediaTypes: Images,
  quality: 0.8,
  allowsEditing: true,
  aspect: [4, 3]
}

// Galeri Ayarları  
{
  allowsMultipleSelection: true,
  selectionLimit: 6,
  quality: 0.8
}
```

## 📱 Kullanım Akışı

### Kamera ile:
1. İlan Ver → **"📷 Fotoğraf Ekle"** 
2. **"Kamera ile Çek"** seç
3. Kamera izni ver
4. Fotoğraf çek → Düzenle → Kaydet
5. Fotoğraf listeye eklenir

### Galeri ile:
1. İlan Ver → **"📷 Fotoğraf Ekle"**
2. **"Galeriden Seç"** seç  
3. Birden fazla fotoğraf seç (max 6)
4. Seçilen fotoğraflar listeye eklenir

## 🎨 UI/UX İyileştirmeleri

### Modal Design:
- **Bottom Sheet**: Alt'tan çıkan seçim modal'ı
- **Icon Support**: Kamera ve galeri iconları
- **Cancel Option**: İptal butonu
- **Touch Friendly**: Büyük dokunma alanları

### Photo Counter:
- **Progress Display**: `📸 Daha Fazla Ekle (3/6)`
- **Limit Warning**: 6 fotoğraf limiti
- **Visual Feedback**: Seçilen fotoğraf sayısı

### Button States:
- **Empty State**: "📷 Fotoğraf Ekle (Kamera/Galeri)"
- **Has Photos**: "📸 Daha Fazla Ekle (2/6)"
- **Loading State**: Yükleme sırasında disabled

## 🔧 Error Handling

### Permission Denied:
- Kamera izni reddedilirse: User-friendly uyarı
- Otomatik galeri'ye yönlendirme

### File Limits:
- Max 6 fotoğraf limiti
- Otomatik array slice (güvenlik)

### Quality Control:
- Otomatik sıkıştırma (0.8 quality)
- Upload performansı optimizasyonu

## 🚀 Test Senaryoları

1. **Kamera Test**: Çek → Düzenle → Kaydet
2. **Galeri Test**: Çoklu seçim → Toplu ekleme  
3. **Mixed Test**: Kamera + Galeri kombinasyonu
4. **Limit Test**: 6+ fotoğraf seçmeye çalış
5. **Permission Test**: İzinleri reddet/kabul et
