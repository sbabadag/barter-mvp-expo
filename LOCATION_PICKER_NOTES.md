# Location Picker Implementation Notes

## Current Implementation

Due to Expo Go limitations with native modules like `react-native-maps`, we've implemented two versions:

### 1. LocationPickerSimple.tsx (Currently Active)
- **Purpose**: Works with Expo Go
- **Features**: 
  - City selection dropdown
  - Turkish major cities pre-defined
  - **TAM ADRES GIRIŞI**: Mahalle, sokak, bina no, kat, daire
  - Simple interface without maps
  - Full TypeScript support

### 2. LocationPicker.tsx (For Development Builds)
- **Purpose**: Full Google Maps integration
- **Features**:
  - Interactive Google Maps
  - GPS location detection
  - Reverse geocoding
  - Marker placement
  - City shortcuts

## ✨ NEW: Tam Adres Özellikleri

### Adres Girişi Süreci:
1. **GPS Konumu** *(YENİ)*: "Mevcut Konumumu Kullan" butonu
   - Otomatik konum izni ister
   - GPS koordinatlarını alır
   - Reverse geocoding ile adres bilgisine çevirir
   - Şehir ve mevcut adres bilgilerini otomatik doldurur
   - Kullanıcı eksik bilgileri tamamlayabilir

2. **Manuel Şehir Seçimi**: İstanbul, Ankara, İzmir, Bursa, Antalya

3. **Detay Girişi**:
   - Mahalle/Semt *(zorunlu)*
   - Sokak/Cadde *(zorunlu)*
   - Bina No *(opsiyonel)*
   - Kat *(opsiyonel)*
   - Daire *(opsiyonel)*
   - Tarif *(opsiyonel - GPS'ten alınan açıklama da dahil)*

### Kayıt Yapısı:
```json
{
  "location": "Barış Sokak, No: 123, Kat: 3, Daire: 12, Beşiktaş, İstanbul",
  "locationCoords": {
    "latitude": 41.0082,
    "longitude": 28.9784
  },
  "city": "İstanbul"
}
```

## Test Rehberi

### 🎯 GPS Testi (YENİ):
1. **İlan Ver** sayfasına git
2. **Konum Seç** butonuna dokun  
3. **"Mevcut Konumumu Kullan"** butonuna bas
4. Konum izni ver (ilk seferinde)
5. GPS konumunun otomatik bulunmasını bekle
6. Şehir ve adres bilgilerinin otomatik doldurulduğunu gör
7. Eksik bilgileri (bina no, kat, daire) tamamla
8. **Adresi Kaydet**

### 📱 Manuel Test:
1. **İlan Ver** sayfasına git
2. **Konum Seç** butonuna dokun
3. Bir şehir seç (örn: İstanbul)
4. Tam adres bilgilerini gir:
   - Mahalle: "Beşiktaş"
   - Sokak: "Barış Sokak"
   - Bina No: "123"
   - Kat: "3"
   - Daire: "12"
5. **Adresi Kaydet** butonuna bas
6. İlan oluştur ve adres bilgisinin tam olarak kaydedildiğini gör

## How to Switch

### For Expo Go (Current):
```tsx
import LocationPicker from "../../src/components/LocationPickerSimple";
```

### For Development Build:
```tsx
import LocationPicker from "../../src/components/LocationPicker";
```

## Production Deployment

For production app:
1. Use `expo build` or EAS Build
2. Switch to the full LocationPicker component
3. Add Google Maps API key to app.json
4. Test all location features

## API Configuration

The app.json already includes:
- Location permissions
- Google Maps API key placeholder
- iOS location usage description

## Database Schema

The listings table now supports:
- `location` (TEXT): Full address string
- `location_coords` (JSON): GPS coordinates object
- Backward compatibility maintained
