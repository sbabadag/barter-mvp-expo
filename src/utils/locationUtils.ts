
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

export interface CityData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const TURKISH_CITIES: CityData[] = [
  { name: 'İstanbul', coordinates: { latitude: 41.0082, longitude: 28.9784 } },
  { name: 'Ankara', coordinates: { latitude: 39.9334, longitude: 32.8597 } },
  { name: 'İzmir', coordinates: { latitude: 38.4192, longitude: 27.1287 } },
  { name: 'Bursa', coordinates: { latitude: 40.1885, longitude: 29.0610 } },
  { name: 'Antalya', coordinates: { latitude: 36.8969, longitude: 30.7133 } },
  { name: 'Adana', coordinates: { latitude: 37.0000, longitude: 35.3213 } },
  { name: 'Konya', coordinates: { latitude: 37.8667, longitude: 32.4833 } },
  { name: 'Gaziantep', coordinates: { latitude: 37.0662, longitude: 37.3833 } },
  { name: 'Mersin', coordinates: { latitude: 36.8000, longitude: 34.6333 } },
  { name: 'Kayseri', coordinates: { latitude: 38.7312, longitude: 35.4787 } },
  { name: 'Eskişehir', coordinates: { latitude: 39.7767, longitude: 30.5206 } },
  { name: 'Diyarbakır', coordinates: { latitude: 37.9144, longitude: 40.2306 } },
  { name: 'Samsun', coordinates: { latitude: 41.2928, longitude: 36.3313 } },
  { name: 'Denizli', coordinates: { latitude: 37.7765, longitude: 29.0864 } },
  { name: 'Şanlıurfa', coordinates: { latitude: 37.1591, longitude: 38.7969 } },
  { name: 'Adapazarı', coordinates: { latitude: 40.7814, longitude: 30.4031 } },
  { name: 'Malatya', coordinates: { latitude: 38.3552, longitude: 38.3095 } },
  { name: 'Erzurum', coordinates: { latitude: 39.9000, longitude: 41.2700 } },
  { name: 'Van', coordinates: { latitude: 38.4891, longitude: 43.4089 } },
  { name: 'Trabzon', coordinates: { latitude: 41.0015, longitude: 39.7178 } },
  { name: 'Balıkesir', coordinates: { latitude: 39.6484, longitude: 27.8826 } },
  { name: 'Manisa', coordinates: { latitude: 38.6191, longitude: 27.4289 } },
  { name: 'Kocaeli', coordinates: { latitude: 40.8533, longitude: 29.8815 } },
  { name: 'Tekirdağ', coordinates: { latitude: 40.9833, longitude: 27.5167 } },
  { name: 'Aydın', coordinates: { latitude: 37.8444, longitude: 27.8458 } }
];

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
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
    return null;
  }
};
