
import * as Location from 'expo-location';

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




// TURKISH_CITIES can be redefined with only real data if needed.
