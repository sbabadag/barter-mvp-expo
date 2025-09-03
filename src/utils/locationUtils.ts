import * as Location from 'expo-location';

// Mock location data for testing in simulator
const MOCK_LOCATIONS = {
  istanbul: { latitude: 41.0082, longitude: 28.9784, city: 'İstanbul' },
  ankara: { latitude: 39.9334, longitude: 32.8597, city: 'Ankara' },
  izmir: { latitude: 38.4237, longitude: 27.1428, city: 'İzmir' },
  bursa: { latitude: 40.1826, longitude: 29.0669, city: 'Bursa' },
  antalya: { latitude: 36.8969, longitude: 30.7133, city: 'Antalya' }
};

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      // Return mock location for Istanbul if permission denied
      return {
        ...MOCK_LOCATIONS.istanbul,
        address: 'İstanbul, Türkiye'
      };
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Try to get address
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        
        // Daha detaylı adres bilgisi oluştur
        const addressParts = [];
        
        if (address.street) addressParts.push(address.street);
        if (address.streetNumber) addressParts.push(`No: ${address.streetNumber}`);
        if (address.district || address.subregion) addressParts.push(address.district || address.subregion);
        if (address.city) addressParts.push(address.city);
        
        const fullAddress = addressParts.join(', ');
        
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: fullAddress || `${address.district || ''}, ${address.city || ''}`.trim().replace(/^,\s*/, ''),
          city: address.city || address.region || undefined
        };
      }
    } catch (reverseGeocodeError) {
      console.log('Reverse geocoding failed:', reverseGeocodeError);
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: 'Mevcut konum'
    };

  } catch (error) {
    console.log('Get current location error:', error);
    // Return mock location for Istanbul as fallback
    return {
      ...MOCK_LOCATIONS.istanbul,
      address: 'İstanbul, Türkiye (Varsayılan)'
    };
  }
};

export const getMockLocation = (city: keyof typeof MOCK_LOCATIONS): LocationData => {
  return {
    ...MOCK_LOCATIONS[city],
    address: `${MOCK_LOCATIONS[city].city}, Türkiye`
  };
};

export const TURKISH_CITIES = [
  { name: 'İstanbul', coordinates: MOCK_LOCATIONS.istanbul },
  { name: 'Ankara', coordinates: MOCK_LOCATIONS.ankara },
  { name: 'İzmir', coordinates: MOCK_LOCATIONS.izmir },
  { name: 'Bursa', coordinates: MOCK_LOCATIONS.bursa },
  { name: 'Antalya', coordinates: MOCK_LOCATIONS.antalya },
];
