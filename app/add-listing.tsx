import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  Pressable, 
  Alert, 
  ScrollView, 
  Image, 
  StyleSheet, 
  Dimensions, 
  Modal, 
  ActivityIndicator, 
  Platform
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { createListing } from "../src/services/listings";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "../src/components/Dropdown";
import { LISTING_CATEGORIES } from "../src/constants/categories";
import LocationPicker from "../src/components/LocationPickerSimple";
import LocationPickerWeb from "../src/components/LocationPickerWeb";
import { HapticService } from "../src/services/haptics";
import { aiRecognitionService, AIRecognitionResult, isAIServiceAvailable } from "../src/services/aiRecognition";
import AISuggestions from "../src/components/AISuggestions";

// Konum tipi tanımı
interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

const { width } = Dimensions.get('window');

export default function AddListingScreen() {
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
  
  // AI Recognition state
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiResult, setAiResult] = useState<AIRecognitionResult | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();

  // Resim optimize etme fonksiyonu
  const optimizeImage = async (uri: string) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.warn('Image optimization failed:', error);
      return uri;
    }
  };

  // AI analiz fonksiyonu
  const analyzeImageWithAI = async (imageUri: string) => {
    if (!isAIServiceAvailable()) {
      console.log('AI service not available, skipping analysis');
      return;
    }

    try {
      setIsAnalyzingImage(true);
      console.log('🤖 Starting AI analysis for image:', imageUri);
      
      const result = await aiRecognitionService.recognizeItem(imageUri, {
        language: 'tr',
        includeCondition: true,
        includePricing: true
      });
      
      setAiResult(result);
      setShowAISuggestions(true);
      HapticService.success();
      
      console.log('✅ AI analysis completed:', result.category, result.suggestedTitle);
    } catch (error) {
      console.warn('AI analysis failed:', error);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Handle AI suggestion acceptance
  const handleAISuggestionAccept = (field: 'title' | 'description' | 'category' | 'condition', value: string) => {
    HapticService.light();
    
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'category':
        setCategory(value);
        break;
      case 'condition':
        setCondition(value as any);
        break;
    }
    
    Alert.alert('✅ Uygulandı', `${field === 'title' ? 'Başlık' : 
                                field === 'description' ? 'Açıklama' : 
                                field === 'category' ? 'Kategori' : 'Durum'} güncellendi`);
  };

  // Accept all AI suggestions at once
  const handleAcceptAllAISuggestions = () => {
    if (!aiResult) return;
    
    HapticService.success();
    
    // Apply all available suggestions
    if (aiResult.suggestedTitle) setTitle(aiResult.suggestedTitle);
    if (aiResult.suggestedDescription) setDescription(aiResult.suggestedDescription);
    if (aiResult.category) setCategory(aiResult.category);
    if (aiResult.condition) setCondition(aiResult.condition);
    
    Alert.alert(
      '🎉 Tüm Öneriler Uygulandı', 
      'AI önerileri başarıyla form alanlarına aktarıldı. İstediğiniz değişiklikleri yapabilirsiniz.',
      [{ text: 'Tamam' }]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleLocationSelect = (locationData: LocationData) => {
    setLocation(locationData.address || '');
    setLocationCoords({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
  };

  const pickImages = async () => {
    console.log('📷 pickImages button pressed, current images:', images.length);
    if (images.length >= 6) {
      Alert.alert("Limit", "En fazla 6 fotoğraf ekleyebilirsiniz");
      return;
    }
    setShowImageOptions(true);
  };

  const takePhotoWithCamera = async () => {
    console.log('� Camera photo request started');
    setShowImageOptions(false);
    
    // iOS'ta direkt deneyelim, çalışmazsa alternatif sunalım
    await tryLaunchCamera();
  };
  
  const tryLaunchCamera = async (retryCount = 0) => {
    const isDevBuild = __DEV__ || process.env.NODE_ENV === 'development';
    const maxRetries = isDevBuild 
      ? (Platform.OS === 'ios' ? 5 : 3) // More retries for dev builds
      : (Platform.OS === 'ios' ? 3 : 1); // Original retry logic for production
    
    try {
      // Step 1: Check permission
      console.log(`Step 1 (Attempt ${retryCount + 1}): Requesting camera permission...`);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission:', permission);
      
      if (!permission.granted) {
        console.log('❌ Permission denied!');
        Alert.alert("İzin", "Kamera izni gerekli");
        return;
      }
      
      // Step 2: Platform-specific camera launch
      console.log(`Step 2 (Attempt ${retryCount + 1}): Launching camera...`);
      
      // Development build optimized camera options
      
      // iOS specific options
      const iOSCameraOptions = {
        mediaTypes: ['images'] as any,
        quality: isDevBuild ? 0.3 : 0.5, // Lower quality for dev builds to reduce load
        allowsEditing: false,
        base64: false,
        exif: false,
      };
      
      // Android specific options  
      const androidCameraOptions = {
        mediaTypes: ['images'] as any,
        quality: isDevBuild ? 0.6 : 0.8, // Slightly lower quality for dev builds
        allowsEditing: false,
        base64: false,
        exif: false,
        // Additional Android options for development builds
        ...(isDevBuild && {
          aspect: [4, 3] as [number, number], // Standard aspect ratio for faster processing
          videoMaxDuration: 1, // Minimal video duration to speed up camera init
        })
      };
      
      // Web fallback
      if (Platform.OS === 'web') {
        Alert.alert('Web Desteği', 'Web platformunda galeri kullanılır.');
        return pickImagesFromGallery();
      }
      
      const cameraOptions = Platform.OS === 'ios' ? iOSCameraOptions : androidCameraOptions;
      const cameraPromise = ImagePicker.launchCameraAsync(cameraOptions);
      
      // Platform-specific timeout - longer for development builds
      const baseTimeout = Platform.OS === 'ios' ? 12000 : 25000; // Increased base timeouts
      const timeoutDuration = isDevBuild ? baseTimeout * 2 : baseTimeout; // Double timeout for dev builds
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Camera timeout after ${timeoutDuration/1000} seconds`)), timeoutDuration)
      );
      
      console.log(`Step 2.1: Starting ${Platform.OS} camera with ${timeoutDuration/1000}s timeout ${isDevBuild ? '(dev build)' : '(production)'}...`);
      const result = await Promise.race([cameraPromise, timeoutPromise]) as any;
      
      console.log('Camera result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('✅ SUCCESS! Image URI:', result.assets[0].uri);
        const optimizedUri = await optimizeImage(result.assets[0].uri);
        setImages(prev => [...prev, optimizedUri]);
        
        // AI analizi başlat
        analyzeImageWithAI(optimizedUri);
        
        Alert.alert("Başarılı", "Fotoğraf eklendi!");
      } else {
        console.log('ℹ️ User canceled camera');
      }
      
    } catch (error) {
      console.error('❌ CAMERA ERROR:', error);
      
      // Platform-specific retry logic
      if (error instanceof Error && error.message.includes('timeout') && retryCount < maxRetries) {
        console.log(`🔄 Auto-retry ${retryCount + 1}/${maxRetries} for ${Platform.OS}`);
        await new Promise(resolve => setTimeout(resolve, Platform.OS === 'ios' ? 500 : 1000));
        return tryLaunchCamera(retryCount + 1);
      }
      
      // Max retry'a ulaştıysak veya başka hata varsa
      if (retryCount >= maxRetries) {
        const platformMessage = Platform.OS === 'ios' 
          ? 'iOS kamera problemi yaşanıyor.' 
          : 'Android kamera açılmadı.';
        
        const devMessage = isDevBuild 
          ? '\n\n🔧 Geliştirme modu: Kamera zaman aşımı normal bir durumdur. Galeri kullanmayı deneyin.' 
          : '';
          
        Alert.alert(
          "Kamera Problemi", 
          `${platformMessage} ${maxRetries} deneme yapıldı.${devMessage}\n\nGaleri kullanmak ister misiniz?`,
          [
            { text: "İptal", style: "cancel" },
            { text: "Tekrar Dene", onPress: () => tryLaunchCamera(0) },
            { text: "Galeri Kullan", onPress: () => pickImagesFromGallery() }
          ]
        );
      } else {
        Alert.alert(
          "Kamera Hatası", 
          "Kamera sorunu: " + error + "\n\nTekrar denemek ister misiniz?",
          [
            { text: "İptal", style: "cancel" },
            { text: "Tekrar Dene", onPress: () => tryLaunchCamera(0) },
            { text: "Galeri Kullan", onPress: () => pickImagesFromGallery() }
          ]
        );
      }
    }
  };

  const pickImagesFromGallery = async () => {
    console.log('� SIMPLE GALLERY TEST STARTED');
    setShowImageOptions(false);

    try {
      console.log('📱 Requesting media library permissions...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📱 Media library permission result:', permissionResult);
      
      if (!permissionResult.granted) {
        console.log('❌ Media library permission denied');
        Alert.alert("İzin", "Fotoğraf erişimi için izin gerekli");
        return;
      }

      console.log('📱 Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any, // Type assertion for new format
        quality: 0.5, // Düşük kalite
        allowsEditing: false,
        base64: false,
        exif: false,
      });

      console.log('📱 Gallery result received:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('✅ GALLERY SUCCESS! Image URI:', result.assets[0].uri);
        const optimizedUri = await optimizeImage(result.assets[0].uri);
        setImages(prev => [...prev, optimizedUri]);
        
        // AI analizi başlat
        analyzeImageWithAI(optimizedUri);
        
        Alert.alert("Başarılı", "Galeri fotoğrafı eklendi!");
      } else {
        console.log('ℹ️ User canceled gallery');
      }
    } catch (error) {
      console.error('❌ GALLERY ERROR:', error);
      Alert.alert("Hata", "Galeri hatası: " + error);
    }
  };

  const removeImage = (index: number) => {
    HapticService.light();
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const retryAIAnalysis = async () => {
    if (images.length > 0) {
      await analyzeImageWithAI(images[0]);
    }
  };

  const onSubmit = async () => {
    if (!title.trim()) {
      HapticService.error();
      Alert.alert("Hata", "Lütfen bir başlık girin");
      return;
    }
    
    if (images.length === 0) {
      HapticService.error();
      Alert.alert("Hata", "En az bir fotoğraf eklemelisiniz");
      return;
    }

    if (!location.trim()) {
      HapticService.error();
      Alert.alert("Hata", "Lütfen bir konum seçin");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadMessage("İlan hazırlanıyor...");

      const listingData = {
        title: title.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : null,
        category,
        condition,
        location,
        locationCoords: locationCoords || undefined,
        imageUris: images,
      };

      console.log('Attempting to create listing:', {
        ...listingData,
        imageCount: images.length,
      });

      setUploadMessage("İlan veritabanına kaydediliyor...");
      setUploadProgress(50);

      const result = await createListing(listingData);

      setUploadProgress(100);
      setUploadMessage("İlan başarıyla oluşturuldu!");

      Alert.alert(
        "Başarılı! 🎉", 
        "İlanınız başarıyla oluşturuldu!",
        [
          {
            text: "Tamam",
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ['listings'] });
              router.back();
            }
          }
        ]
      );

    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      HapticService.error();
      Alert.alert("Hata", "İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadMessage("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Yeni Ürün Ekle</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.formHeader}>Yeni İlan</Text>
        
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

        {Platform.OS === 'web' ? (
          <LocationPickerWeb
            onLocationSelect={(location, coords) => {
              setLocation(location);
              setLocationCoords(coords);
            }}
            currentLocation={location}
          />
        ) : (
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            selectedLocation={location}
            label="Konum"
          />
        )}

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

        {/* AI Suggestions Component */}
        {(isAnalyzingImage || aiResult) && (
          <AISuggestions
            isAnalyzing={isAnalyzingImage}
            aiResult={aiResult}
            onAcceptSuggestion={handleAISuggestionAccept}
            onAcceptAllSuggestions={handleAcceptAllAISuggestions}
            onRetryAnalysis={retryAIAnalysis}
            style={styles.aiSuggestionsContainer}
          />
        )}

        <Pressable 
          onPress={onSubmit} 
          style={[styles.submitButton, (!title || !description || isUploading) && styles.submitButtonDisabled]}
          disabled={!title || !description || isUploading}
        >
          <Text style={styles.submitButtonText}>
            {isUploading ? "Yükleniyor..." : "İlanı Yayınla"}
          </Text>
        </Pressable>
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginLeft: -32,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  formHeader: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
    marginTop: 16,
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
  aiSuggestionsContainer: {
    marginVertical: 8,
  },
});
