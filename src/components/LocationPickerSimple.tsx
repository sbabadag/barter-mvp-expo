import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LocationData, TURKISH_CITIES, getCurrentLocation, CityData } from '../utils/locationUtils';

interface LocationPickerProps {
  onLocationSelect: (locationData: LocationData) => void;
  selectedLocation?: string;
  label?: string;
  onFocus?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  selectedLocation,
  label = "Konum",
  onFocus
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    mahalle: '',
    sokak: '',
    binaNo: '',
    kat: '',
    daire: '',
    tarif: ''
  });

  const selectCity = (city: CityData) => {
    setSelectedCity(city.name);
    // Şehir seçildiğinde adres detaylarını sıfırla
    setAddressDetails({
      mahalle: '',
      sokak: '',
      binaNo: '',
      kat: '',
      daire: '',
      tarif: ''
    });
  };

  const getCurrentLocationHandler = async () => {
    setIsLoadingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData) {
        // GPS konumundan şehir ve adres bilgisini çıkar
        const cityName = locationData.city || 'İstanbul';
        setSelectedCity(cityName);
        
        // Eğer tam adres varsa parse et
        if (locationData.address) {
          const addressParts = locationData.address.split(',').map(part => part.trim());
          
          // Basit adres parsing (geliştirilebilir)
          setAddressDetails({
            mahalle: addressParts[1] || '',
            sokak: addressParts[0] || '',
            binaNo: '',
            kat: '',
            daire: '',
            tarif: `GPS konumundan alındı: ${locationData.address}`
          });
        }
        
        Alert.alert(
          '📍 Konum Bulundu!', 
          `Şehir: ${cityName}\nAdres: ${locationData.address || 'Detaylı adres bulunamadı'}\n\nLütfen eksik bilgileri tamamlayın.`,
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.error('Konum alma hatası:', error);
      Alert.alert(
        'Konum Hatası', 
        'Konumunuz alınamadı. Lütfen manuel olarak seçin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const confirmAddress = () => {
    if (!selectedCity) {
      Alert.alert('Uyarı', 'Lütfen önce bir şehir seçin.');
      return;
    }

    if (!addressDetails.mahalle || !addressDetails.sokak) {
      Alert.alert('Uyarı', 'Lütfen en az mahalle ve sokak bilgilerini girin.');
      return;
    }

    const cityData = TURKISH_CITIES.find(city => city.name === selectedCity);
    const fullAddress = [
      addressDetails.sokak,
      addressDetails.binaNo && `No: ${addressDetails.binaNo}`,
      addressDetails.kat && `Kat: ${addressDetails.kat}`,
      addressDetails.daire && `Daire: ${addressDetails.daire}`,
      addressDetails.mahalle,
      selectedCity
    ].filter(Boolean).join(', ');

    onLocationSelect({
      latitude: cityData?.coordinates.latitude || 41.0082,
      longitude: cityData?.coordinates.longitude || 28.9784,
      address: fullAddress,
      city: selectedCity
    });
    
    setIsModalVisible(false);
  };

  const resetSelection = () => {
    setSelectedCity('');
    setIsLoadingLocation(false);
    setAddressDetails({
      mahalle: '',
      sokak: '',
      binaNo: '',
      kat: '',
      daire: '',
      tarif: ''
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable 
        style={styles.button}
        onPress={() => {
          onFocus?.();
          setIsModalVisible(true);
        }}
      >
        <View style={styles.buttonContent}>
          <MaterialIcons name="location-on" size={20} color="#007AFF" />
          <Text style={styles.buttonText}>
            {selectedLocation || "Konum Seç"}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#007AFF" />
        </View>
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Konum Seç</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#007AFF" />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView}>
            {!selectedCity ? (
              // Şehir Seçimi
              <View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📍 Mevcut Konumum</Text>
                  <Pressable
                    style={[styles.cityButton, styles.currentLocationButton]}
                    onPress={getCurrentLocationHandler}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <MaterialIcons name="my-location" size={20} color="#007AFF" />
                    )}
                    <Text style={[styles.cityName, isLoadingLocation && styles.disabledText]}>
                      {isLoadingLocation ? 'Konum alınıyor...' : 'Mevcut Konumumu Kullan'}
                    </Text>
                    <MaterialIcons name="gps-fixed" size={16} color="#007AFF" />
                  </Pressable>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🏙️ Şehir Seçin</Text>
                  {TURKISH_CITIES && TURKISH_CITIES.length > 0 ? (
                    TURKISH_CITIES.map((city, index) => (
                      <Pressable
                        key={index}
                        style={styles.cityButton}
                        onPress={() => selectCity(city)}
                      >
                        <MaterialIcons name="location-city" size={20} color="#007AFF" />
                        <Text style={styles.cityName}>{city.name}</Text>
                        <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.errorText}>Şehir listesi yüklenemiyor</Text>
                  )}
                </View>
              </View>
            ) : (
              // Adres Detayları
              <View style={styles.section}>
                <View style={styles.selectedCityHeader}>
                  <Text style={styles.sectionTitle}>� {selectedCity}</Text>
                  <Pressable onPress={resetSelection} style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>Değiştir</Text>
                  </Pressable>
                </View>
                
                <View style={styles.addressForm}>
                  <Text style={styles.formTitle}>Tam Adres Bilgileri</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mahalle/Semt *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Örn: Beşiktaş, Kadıköy, Çankaya"
                      value={addressDetails.mahalle}
                      onChangeText={(text) => setAddressDetails(prev => ({...prev, mahalle: text}))}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Sokak/Cadde *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Örn: Atatürk Caddesi, Barış Sokak"
                      value={addressDetails.sokak}
                      onChangeText={(text) => setAddressDetails(prev => ({...prev, sokak: text}))}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                      <Text style={styles.inputLabel}>Bina No</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="123"
                        value={addressDetails.binaNo}
                        onChangeText={(text) => setAddressDetails(prev => ({...prev, binaNo: text}))}
                      />
                    </View>

                    <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                      <Text style={styles.inputLabel}>Kat</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="3"
                        value={addressDetails.kat}
                        onChangeText={(text) => setAddressDetails(prev => ({...prev, kat: text}))}
                      />
                    </View>

                    <View style={[styles.inputGroup, {flex: 1}]}>
                      <Text style={styles.inputLabel}>Daire</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="12"
                        value={addressDetails.daire}
                        onChangeText={(text) => setAddressDetails(prev => ({...prev, daire: text}))}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tarif (Opsiyonel)</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Ek açıklama: Apartman girişi, kat bilgisi vs."
                      value={addressDetails.tarif}
                      onChangeText={(text) => setAddressDetails(prev => ({...prev, tarif: text}))}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <Pressable style={styles.confirmButton} onPress={confirmAddress}>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Adresi Kaydet</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  button: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  buttonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  currentLocationButton: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  disabledText: {
    color: '#999',
  },
  selectedCityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  addressForm: {
    marginTop: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});

export default LocationPicker;
