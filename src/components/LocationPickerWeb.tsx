import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Modal, Pressable, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getCurrentLocation } from '../utils/locationUtils';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

interface LocationPickerWebProps {
  onLocationSelect: (location: string, coords: { latitude: number; longitude: number }) => void;
  currentLocation?: string;
}

// Türkiye'nin önemli şehirleri
const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 
  'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa',
  'Adapazarı', 'Malatya', 'Erzurum', 'Van', 'Batman', 'Elâzığ', 'Iğdır', 'Trabzon',
  'Manisa', 'Kocaeli', 'Balıkesir', 'Kahramanmaraş', 'Sivas', 'Aydın', 'Tekirdağ'
];

export default function LocationPickerWeb({ onLocationSelect, currentLocation }: LocationPickerWebProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Web platformunda Google Maps API kullanarak geocoding
  const geocodeAddress = async (fullAddress: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (Platform.OS !== 'web') return null;
    
    try {
      // Basit bir geocoding simülasyonu - gerçek uygulamada Google Maps Geocoding API kullanılmalı
      // Şimdilik Türkiye'nin merkez koordinatlarını döndürüyoruz
      const turkeyCenter = { latitude: 39.9334, longitude: 32.8597 };
      return turkeyCenter;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleLocationSelect = async () => {
    if (!selectedCity.trim()) {
      Alert.alert('Hata', 'Lütfen bir şehir seçin');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Hata', 'Lütfen adres bilgisini girin');
      return;
    }

    const fullAddress = `${address}, ${selectedCity}`;
    
    // Koordinatları al
    const coords = await geocodeAddress(fullAddress);
    
    if (coords) {
      onLocationSelect(fullAddress, coords);
    } else {
      // Varsayılan koordinatlar
      onLocationSelect(fullAddress, { latitude: 39.9334, longitude: 32.8597 });
    }
    
    setIsVisible(false);
    setSelectedCity('');
    setAddress('');
  };

  const getCurrentLocationWeb = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const fullAddress = location.address || `${location.latitude}, ${location.longitude}`;
        onLocationSelect(fullAddress, {
          latitude: location.latitude,
          longitude: location.longitude
        });
        setIsVisible(false);
      } else {
        Alert.alert('Hata', 'Konum alınamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Konum servisi kullanılamıyor');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <View>
      <Pressable
        style={styles.locationButton}
        onPress={() => setIsVisible(true)}
      >
        <MaterialIcons name="location-on" size={20} color="#007AFF" />
        <Text style={styles.locationButtonText}>
          {currentLocation || 'Konum Seç'}
        </Text>
      </Pressable>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Konum Seçin</Text>
            <Pressable 
              onPress={() => setIsVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Mevcut Konum Butonu */}
            <Pressable
              style={[styles.currentLocationButton, isLoadingLocation && styles.disabledButton]}
              onPress={getCurrentLocationWeb}
              disabled={isLoadingLocation}
            >
              <MaterialIcons 
                name="my-location" 
                size={20} 
                color={isLoadingLocation ? "#999" : "#007AFF"} 
              />
              <Text style={[styles.currentLocationText, isLoadingLocation && styles.disabledText]}>
                {isLoadingLocation ? 'Konum Alınıyor...' : 'Mevcut Konumumu Kullan'}
              </Text>
            </Pressable>

            <View style={styles.divider} />

            {/* Şehir Seçimi */}
            <Text style={styles.sectionTitle}>Şehir</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.cityScrollContainer}
            >
              <View style={styles.cityContainer}>
                {TURKISH_CITIES.map((city) => (
                  <Pressable
                    key={city}
                    style={[
                      styles.cityButton,
                      selectedCity === city && styles.selectedCityButton
                    ]}
                    onPress={() => setSelectedCity(city)}
                  >
                    <Text style={[
                      styles.cityButtonText,
                      selectedCity === city && styles.selectedCityButtonText
                    ]}>
                      {city}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Adres Girişi */}
            <Text style={styles.sectionTitle}>Adres Detayı</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Mahalle, sokak, numara..."
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />

            {/* Seç Butonu */}
            <Pressable
              style={[
                styles.selectButton,
                (!selectedCity || !address) && styles.disabledButton
              ]}
              onPress={handleLocationSelect}
              disabled={!selectedCity || !address}
            >
              <Text style={[
                styles.selectButtonText,
                (!selectedCity || !address) && styles.disabledText
              ]}>
                Konumu Seç
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 8,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginVertical: 15,
  },
  currentLocationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  cityScrollContainer: {
    marginBottom: 10,
  },
  cityContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  cityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCityButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  cityButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCityButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    color: '#999',
  },
});
