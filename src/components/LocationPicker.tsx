import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { LocationData, getCurrentLocation, TURKISH_CITIES } from '../utils/locationUtils';

interface LocationPickerProps {
  onLocationSelect: (locationData: LocationData) => void;
  selectedLocation?: string;
  label?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  selectedLocation,
  label = "Konum"
}) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 39.9334, // Türkiye merkezi
    longitude: 32.8597,
    latitudeDelta: 8.0,
    longitudeDelta: 8.0,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni',
          'Mevcut konumunuzu almak için konum izni gerekli. Manuel olarak bir şehir seçebilirsiniz.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setCurrentLocation(coords);
      setRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Konum alırken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedCoords({ latitude, longitude });
    
    try {
      // Reverse geocoding ile adres bilgisi al
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const result = results[0];
        const locationName = `${result.district || result.subregion || ''}, ${result.city || result.region || ''}`.trim().replace(/^,\s*/, '');
        setSelectedCoords({ latitude, longitude });
      }
    } catch (error) {
      console.error('Reverse geocoding hatası:', error);
      setSelectedCoords({ latitude, longitude });
    }
  };

  const confirmLocation = async () => {
    if (selectedCoords) {
      try {
        const results = await Location.reverseGeocodeAsync(selectedCoords);
        if (results.length > 0) {
          const result = results[0];
          const locationName = `${result.district || result.subregion || ''}, ${result.city || result.region || ''}`.trim().replace(/^,\s*/, '');
          onLocationSelect({
            latitude: selectedCoords.latitude,
            longitude: selectedCoords.longitude,
            address: locationName || 'Seçilen Konum',
            city: result.city || result.region || undefined
          });
        } else {
          onLocationSelect({
            latitude: selectedCoords.latitude,
            longitude: selectedCoords.longitude,
            address: 'Seçilen Konum'
          });
        }
      } catch (error) {
        console.error('Adres çevirme hatası:', error);
        onLocationSelect({
          latitude: selectedCoords.latitude,
          longitude: selectedCoords.longitude,
          address: 'Seçilen Konum'
        });
      }
    }
    setIsMapVisible(false);
    setSelectedCoords(null);
  };

  const selectCity = (city: any) => {
    const coords = { latitude: city.coordinates.latitude, longitude: city.coordinates.longitude };
    setSelectedCoords(coords);
    setRegion({
      ...coords,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <Pressable 
        style={styles.locationButton}
        onPress={() => setIsMapVisible(true)}
      >
        <MaterialIcons name="location-on" size={20} color="#666" />
        <Text style={[styles.locationText, !selectedLocation && styles.placeholderText]}>
          {selectedLocation || 'Konum seçin...'}
        </Text>
        <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
      </Pressable>

      <Modal
        visible={isMapVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Pressable 
              onPress={() => {
                setIsMapVisible(false);
                setSelectedCoords(null);
              }}
              style={styles.headerButton}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </Pressable>
            <Text style={styles.modalTitle}>Konum Seç</Text>
            <Pressable 
              onPress={confirmLocation}
              style={[styles.headerButton, !selectedCoords && styles.disabledButton]}
              disabled={!selectedCoords}
            >
              <Text style={[styles.confirmText, !selectedCoords && styles.disabledText]}>
                Tamam
              </Text>
            </Pressable>
          </View>

          {/* Şehir seçenekleri */}
          <View style={styles.citiesContainer}>
            <Text style={styles.citiesTitle}>Hızlı Seçim:</Text>
            <View style={styles.citiesRow}>
              {TURKISH_CITIES.slice(0, 3).map((city, index) => (
                <Pressable
                  key={index}
                  style={styles.cityChip}
                  onPress={() => selectCity(city)}
                >
                  <Text style={styles.cityText}>{city.name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.citiesRow}>
              {TURKISH_CITIES.slice(3, 5).map((city, index) => (
                <Pressable
                  key={index + 5}
                  style={styles.cityChip}
                  onPress={() => selectCity(city)}
                >
                  <Text style={styles.cityText}>{city.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f0a500" />
                <Text>Konum alınıyor...</Text>
              </View>
            ) : (
              <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {selectedCoords && (
                  <Marker coordinate={selectedCoords}>
                    <View style={styles.customMarker}>
                      <MaterialIcons name="location-on" size={30} color="#f0a500" />
                    </View>
                  </Marker>
                )}
              </MapView>
            )}
          </View>

          {/* Alt bilgi */}
          <View style={styles.bottomInfo}>
            <MaterialIcons name="info" size={16} color="#666" />
            <Text style={styles.infoText}>
              Haritaya dokunarak konum seçin veya yukarıdaki şehirlerden birini seçin
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  placeholderText: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50, // Status bar için
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f0a500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  citiesContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  citiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  citiesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cityChip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cityText: {
    fontSize: 12,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default LocationPicker;
