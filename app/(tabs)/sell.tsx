import React, { useState } from "react";
import { View, TextInput, Text, Pressable, Alert, ScrollView, Image, StyleSheet, Dimensions, Modal, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { createListing } from "../../src/services/listings";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "../../src/components/Dropdown";
import { LISTING_CATEGORIES } from "../../src/constants/categories";
import LocationPicker from "../../src/components/LocationPickerSimple";

// Konum tipi tanımı
interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

const { width } = Dimensions.get('window');

export default function SellScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [condition, setCondition] = useState<'new' | 'like_new' | 'good' | 'fair' | 'poor'>('good');
  const [images, setImages] = useState<string[]>([]);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Resim optimize etme fonksiyonu - hızlı yükleme için
  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 800 } }, // Maksimum genişlik 800px
        ],
        {
          compress: 0.7, // %70 kalite - hızlı yükleme için optimize
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.log('Resim optimize edilemedi, orijinal kullanılıyor:', error);
      return uri; // Hata durumunda orijinal resmi döndür
    }
  };

  const pickImagesFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 6,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5, // Daha hızlı yükleme için kaliteyi düşürdük
      allowsEditing: false,
      aspect: [4, 3],
      base64: false
    });
    if (!res.canceled) {
      // Resimleri optimize et
      const optimizedImages = await Promise.all(
        res.assets.map(async (asset) => await optimizeImage(asset.uri))
      );
      setImages(prev => [...prev, ...optimizedImages].slice(0, 6));
    }
    setShowImageOptions(false);
  };

  const takePhotoWithCamera = async () => {
    // Kamera iznini kontrol et
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert('Kamera İzni', 'Fotoğraf çekmek için kamera iznine ihtiyacımız var.');
      setShowImageOptions(false);
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5, // Daha hızlı yükleme için kaliteyi düşürdük
      allowsEditing: false, // Editing'i kapattık, hızlı olması için
      aspect: [4, 3],
      base64: false // Base64'ü kapattık, memory usage için
    });
    
    if (!res.canceled) {
      // Çekilen fotoğrafı optimize et
      const optimizedImage = await optimizeImage(res.assets[0].uri);
      setImages(prev => [...prev, optimizedImage].slice(0, 6));
    }
    setShowImageOptions(false);
  };

  const pickImages = async () => {
    setShowImageOptions(true);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (locationData: LocationData) => {
    setLocation(locationData.address || `${locationData.city || 'Seçilen konum'}`);
    setLocationCoords({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
  };

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Hata", "Lütfen bir başlık girin");
      return;
    }
    
    if (images.length === 0) {
      Alert.alert("Hata", "Lütfen en az bir fotoğraf ekleyin");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadMessage("Başlıyor...");
      
      console.log("Attempting to create listing:", { 
        title, 
        description, 
        price, 
        category, 
        location, 
        condition, 
        imageCount: images.length 
      });
      
      const listingId = await createListing({ 
        title, 
        description, 
        price: price ? Number(price) : null, 
        imageUris: images,
        category: category || undefined,
        location: location || undefined,
        locationCoords: locationCoords || undefined,
        condition
      }, (progress, message) => {
        setUploadProgress(progress);
        setUploadMessage(message);
      });
      
      console.log("Listing created successfully with ID:", listingId);
      
      // Invalidate and refetch listings to show the new listing
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      // Hide progress modal
      setIsUploading(false);
      
      // Show success alert with more details
      Alert.alert(
        "✅ Başarılı!", 
        `İlanınız başarıyla kaydedildi!\n\n📱 ${images.length} fotoğraf yüklendi\n🏷️ Kategori: ${category || 'Genel'}\n📍 Konum: ${location || 'Belirtilmedi'}`,
        [
          {
            text: "Tamam",
            onPress: () => {
              // Reset form
              setTitle(""); 
              setDescription(""); 
              setPrice(""); 
              setCategory("");
              setLocation("");
              setLocationCoords(null);
              setCondition('good');
              setImages([]);
              setShowImageOptions(false);
              
              // Navigate to home tab
              router.push("/(tabs)/");
            }
          }
        ]
      );
      
    } catch (e: any) {
      console.error("Error creating listing:", e);
      setIsUploading(false);
      Alert.alert("Hata", e.message || "Bilinmeyen bir hata oluştu");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Yeni İlan</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Başlık *</Text>
        <TextInput 
          placeholder="Ürün başlığını girin" 
          value={title} 
          onChangeText={setTitle} 
          style={styles.input} 
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Açıklama *</Text>
        <TextInput 
          placeholder="Ürün açıklamasını girin" 
          value={description} 
          onChangeText={setDescription} 
          multiline 
          numberOfLines={4}
          style={[styles.input, styles.textArea]} 
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fiyat (opsiyonel)</Text>
        <TextInput 
          placeholder="0" 
          keyboardType="numeric" 
          value={price} 
          onChangeText={setPrice} 
          style={styles.input} 
        />
        <Text style={styles.helpText}>Boş bırakın takas için</Text>
      </View>

      <View style={styles.formGroup}>
        <Dropdown
          label="Kategori"
          options={LISTING_CATEGORIES}
          selectedValue={category}
          onValueChange={setCategory}
          placeholder="Kategori seçin..."
        />
      </View>

      <LocationPicker
        onLocationSelect={handleLocationSelect}
        selectedLocation={location}
        label="Konum"
      />

      <View style={styles.formGroup}>
        <Text style={styles.label}>Durum</Text>
        <View style={styles.conditionContainer}>
          {[
            { key: 'new', label: 'Sıfır' },
            { key: 'like_new', label: 'Sıfır Gibi' },
            { key: 'good', label: 'İyi' },
            { key: 'fair', label: 'Orta' },
            { key: 'poor', label: 'Kötü' }
          ].map((item) => (
            <Pressable
              key={item.key}
              style={[
                styles.conditionButton,
                condition === item.key && styles.conditionButtonActive
              ]}
              onPress={() => setCondition(item.key as any)}
            >
              <Text style={[
                styles.conditionButtonText,
                condition === item.key && styles.conditionButtonTextActive
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fotoğraflar ({images.length}/6)</Text>
        
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.selectedImage} />
                <Pressable style={styles.removeButton} onPress={() => removeImage(index)}>
                  <MaterialIcons name="close" size={16} color="white" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
        
        <Pressable onPress={pickImages} style={styles.imagePickerButton}>
          <MaterialIcons name="add-a-photo" size={24} color="#666" />
          <Text style={styles.imagePickerText}>
            {images.length === 0 ? "📷 Fotoğraf Ekle (Kamera/Galeri)" : `📸 Daha Fazla Ekle (${images.length}/6)`}
          </Text>
        </Pressable>
      </View>

      <Pressable 
        onPress={onSubmit} 
        style={[styles.submitButton, (!title || !description || isUploading) && styles.submitButtonDisabled]}
        disabled={!title || !description || isUploading}
      >
        <Text style={styles.submitButtonText}>
          {isUploading ? "Yükleniyor..." : "İlanı Yayınla"}
        </Text>
      </Pressable>
      
      {/* Progress Modal */}
      <Modal
        visible={isUploading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>İlan Yükleniyor</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
            </View>
            
            <Text style={styles.progressMessage}>{uploadMessage}</Text>
            
            <ActivityIndicator 
              size="large" 
              color="#f0a500" 
              style={styles.activityIndicator}
            />
          </View>
        </View>
      </Modal>

      {/* Fotoğraf Seçim Modal'ı */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContainer}>
            <Text style={styles.imageModalTitle}>Fotoğraf Ekle</Text>
            
            <Pressable
              style={styles.imageOptionButton}
              onPress={takePhotoWithCamera}
            >
              <MaterialIcons name="camera-alt" size={24} color="#007AFF" />
              <Text style={styles.imageOptionText}>Kamera ile Çek</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
            </Pressable>

            <Pressable
              style={styles.imageOptionButton}
              onPress={pickImagesFromGallery}
            >
              <MaterialIcons name="photo-library" size={24} color="#007AFF" />
              <Text style={styles.imageOptionText}>Galeriden Seç</Text>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#ccc" />
            </Pressable>

            <Pressable
              style={styles.imageModalCancelButton}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.imageModalCancelText}>İptal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  imageScrollView: {
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#f0a500',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  conditionButtonActive: {
    backgroundColor: '#f0a500',
    borderColor: '#f0a500',
  },
  conditionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  conditionButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f0a500',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  activityIndicator: {
    marginTop: 10,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  imageModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  imageOptionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  imageModalCancelButton: {
    paddingVertical: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginTop: 10,
  },
  imageModalCancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
