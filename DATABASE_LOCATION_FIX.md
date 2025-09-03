# Database Location Coordinates Fix

## Problem
Supabase veritabanında `location_coords` sütunu bulunamıyor.

## Solution
Koordinatları mevcut `location` sütununa JSON formatında embed ettik.

## Format
```
Original location: "Barbaros Bulvarı, Beşiktaş, İstanbul"
New format: "Barbaros Bulvarı, Beşiktaş, İstanbul|COORDS:{"latitude":41.0082,"longitude":28.9784}"
```

## Code Changes

### 1. Insert (createListing)
```typescript
// LocationCoords'u location string'ine JSON formatında dahil et
let locationWithCoords = input.location || null;
if (input.locationCoords && input.location) {
  locationWithCoords = `${input.location}|COORDS:${JSON.stringify(input.locationCoords)}`;
}
```

### 2. Parse (useListings, getListingById)
```typescript
const parseLocationWithCoords = (locationString) => {
  const coordsMarker = '|COORDS:';
  const coordsIndex = locationString.indexOf(coordsMarker);
  
  if (coordsIndex === -1) {
    return { address: locationString };
  }
  
  const address = locationString.substring(0, coordsIndex);
  const coordsJson = locationString.substring(coordsIndex + coordsMarker.length);
  
  try {
    const coords = JSON.parse(coordsJson);
    return { address, coords };
  } catch (error) {
    return { address };
  }
};
```

## Benefits
- ✅ Mevcut database schema ile uyumlu
- ✅ Backward compatibility
- ✅ Koordinat bilgisi korunuyor
- ✅ Clean address display
- ✅ No database migration needed

## Future Enhancement
Eğer database'e yeni sütun eklemek mümkünse:
```sql
ALTER TABLE listings ADD COLUMN location_coords JSONB;
```

## Test
1. İlan oluştur (coordinates ile)
2. Listing'lerde koordinatlar görünsün
3. Address temiz görünsün (coordinates olmadan)
