import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Alert,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/state/AuthProvider';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  const { user, signOut, isLoading, updateProfile } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  // Debug logging
  console.log('ProfileTab render - user:', user ? 'User loaded' : 'User is null');
  console.log('ProfileTab render - isLoading:', isLoading);
  if (user) {
    console.log('User data details:', {
      id: user.id,
      display_name: user.display_name,
      first_name: user.first_name,
      email: user.email
    });
  }
  
  // Form state for all editable fields
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    birth_date: user?.birth_date || '',
    gender: user?.gender || '',
    home_address: user?.home_address || '',
    home_postal_code: user?.home_postal_code || '',
    work_address: user?.work_address || '',
    work_postal_code: user?.work_postal_code || '',
    avatar_url: user?.avatar_url || ''
  });

  // Update formData when user data loads/changes
  useEffect(() => {
    console.log('useEffect triggered - user changed:', user ? 'User exists' : 'User is null');
    if (user) {
      console.log('User data loaded, updating formData with:', {
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        city: user.city
      });
      
      const newFormData = {
        display_name: user.display_name || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        home_address: user.home_address || '',
        home_postal_code: user.home_postal_code || '',
        work_address: user.work_address || '',
        work_postal_code: user.work_postal_code || '',
        avatar_url: user.avatar_url || ''
      };
      
      console.log('Setting formData to:', newFormData);
      setFormData(newFormData);
      console.log('FormData updated successfully');
    } else {
      console.log('User is null/undefined, user data not loaded yet');
    }
  }, [user]);

  // Show loading screen while user data is being fetched
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, color: '#666' }}>Profil bilgileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#666', fontSize: 16 }}>Kullanıcı bilgileri bulunamadı</Text>
          <TouchableOpacity 
            style={[styles.saveButton, { marginTop: 16 }]}
            onPress={() => {
              console.log('Refresh button pressed');
              // You could add a refresh function here if needed
            }}
          >
            <Text style={styles.saveButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut(true); // Clear saved credentials too
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert(
        'Hata',
        'Çıkış yaparken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Reset form data to current user data
    setFormData({
      display_name: user?.display_name || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      birth_date: user?.birth_date || '',
      gender: user?.gender || '',
      home_address: user?.home_address || '',
      home_postal_code: user?.home_postal_code || '',
      work_address: user?.work_address || '',
      work_postal_code: user?.work_postal_code || '',
      avatar_url: user?.avatar_url || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      display_name: user?.display_name || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      birth_date: user?.birth_date || '',
      gender: user?.gender || '',
      home_address: user?.home_address || '',
      home_postal_code: user?.home_postal_code || '',
      work_address: user?.work_address || '',
      work_postal_code: user?.work_postal_code || '',
      avatar_url: user?.avatar_url || ''
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('=== SAVING PROFILE ===');
      console.log('Form data being saved:', formData);
      
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Working implementation copied exactly from sell.tsx
  const pickImageWorking = async () => {
    console.log('Using exact working picker from sell page...');
    setIsUploadingPhoto(true);
    setShowImagePicker(false);
    
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false, // Single selection for profile
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Keep exactly as sell.tsx
      quality: 0.8 // Keep exactly as sell.tsx
    });
    
    console.log('Working picker result:', res);
    
    if (!res.canceled && res.assets && res.assets[0]) {
      const imageUri = res.assets[0].uri;
      console.log('Working picker - Image selected:', imageUri);
      
      setFormData(prev => ({ ...prev, avatar_url: imageUri }));
      
      if (!isEditing) {
        await updateProfile({ avatar_url: imageUri });
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
      }
    }
    
    setIsUploadingPhoto(false);
  };

  // Ultra minimal image picker for maximum compatibility
  const pickImageMinimal = async () => {
    console.log('Using ultra minimal image picker...');
    
    try {
      setIsUploadingPhoto(true);
      setShowImagePicker(false);
      
      console.log('Launching ultra minimal picker...');
      
      // No timeout, no special configuration - just the basics
      const result: any = await ImagePicker.launchImageLibraryAsync({
        quality: 0.1,
      });
      
      console.log('Minimal picker result:', result);
      
      if (result && !result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Minimal picker - Image selected:', imageUri);
        
        setFormData(prev => ({ ...prev, avatar_url: imageUri }));
        
        if (!isEditing) {
          try {
            await updateProfile({ avatar_url: imageUri });
            Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
          } catch (updateError) {
            console.error('Error updating profile:', updateError);
            Alert.alert('Hata', 'Fotoğraf kaydedilirken bir hata oluştu.');
            setFormData(prev => ({ ...prev, avatar_url: user?.avatar_url || '' }));
          }
        }
      }
    } catch (error: any) {
      console.error('Minimal picker error:', error);
      Alert.alert('Hata', 'En basit galeri erişimi de başarısız. Cihazınızı yeniden başlatın.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Check permission status without requesting
  const checkPermissions = async () => {
    try {
      console.log('Checking current permission status...');
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Current permission status:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  // Super simple image picker that bypasses permission issues
  const pickImageDirect = async () => {
    console.log('Using direct image picker (no permission check)...');
    
    try {
      setIsUploadingPhoto(true);
      setShowImagePicker(false);
      
      // Longer timeout for direct picker
      const directTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Direct picker timeout')), 10000); // 10 seconds
      });
      
      console.log('Launching direct image picker...');
      const result: any = await Promise.race([
        ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images', // Use lowercase string format
          quality: 0.1,
          allowsEditing: false,
          base64: false,
          exif: false,
        }),
        directTimeout
      ]);
      
      console.log('Direct picker result:', result);
      
      if (result && !result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Direct picker - Image selected:', imageUri);
        
        setFormData(prev => ({ ...prev, avatar_url: imageUri }));
        
        if (!isEditing) {
          try {
            await updateProfile({ avatar_url: imageUri });
            Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
          } catch (updateError) {
            console.error('Error updating profile:', updateError);
            Alert.alert('Hata', 'Fotoğraf kaydedilirken bir hata oluştu.');
            setFormData(prev => ({ ...prev, avatar_url: user?.avatar_url || '' }));
          }
        }
      }
    } catch (error: any) {
      console.error('Direct picker error:', error);
      if (error?.message === 'Direct picker timeout') {
        Alert.alert('Zaman Aşımı', 'Galeri açılması uzun sürdü. Cihazınızı yeniden başlatmayı deneyin.');
      } else {
        Alert.alert('Hata', 'Direkt galeri erişimi başarısız. İzinleri kontrol edin.');
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Alternative simplified image picker with timeout protection for permissions
  const pickImageSimple = async () => {
    console.log('Using simplified image picker...');
    
    try {
      setIsUploadingPhoto(true);
      setShowImagePicker(false);
      
      // Timeout for permission request - increased timeout
      const permissionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Permission timeout')), 15000); // 15 seconds for permission
      });
      
      console.log('Requesting library permissions with timeout...');
      let permission: any;
      try {
        permission = await Promise.race([
          ImagePicker.requestMediaLibraryPermissionsAsync(),
          permissionTimeout
        ]);
        console.log('Permission result:', permission);
      } catch (permError) {
        console.error('Permission request timed out or failed:', permError);
        Alert.alert('İzin Hatası', 'İzin istemi zaman aşımına uğradı. Telefon ayarlarından manuel olarak izin verin.');
        setIsUploadingPhoto(false);
        return;
      }
      
      if (!permission.granted) {
        console.log('Permission not granted:', permission);
        
        // Show detailed permission instructions
        Alert.alert(
          'İzin Gerekli', 
          'Galeri erişimi için izin gereklidir.\n\n1. Telefon Ayarları > Uygulamalar\n2. Expo Go/Uygulamanızı bulun\n3. İzinler > Depolama/Medya izni verin\n4. Uygulamayı yeniden başlatın',
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'Direkt Dene', 
              onPress: () => {
                console.log('Trying direct picker without permission check');
                pickImageDirect();
                return;
              } 
            }
          ]
        );
        setIsUploadingPhoto(false);
        return;
      }
      
      // Quick timeout for image picker
      const pickerTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Picker timeout')), 8000); // 8 seconds for picker
      });
      
      console.log('Launching minimal image picker...');
      const result: any = await Promise.race([
        ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images', // Fixed deprecated MediaTypeOptions
          quality: 0.1, // Extremely low quality to prevent memory issues
          allowsEditing: false,
          aspect: undefined,
          base64: false,
          exif: false,
        }),
        pickerTimeout
      ]);
      
      console.log('Simple picker result:', result);
      
      if (result && !result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Simple picker - Image selected:', imageUri);
        
        setFormData(prev => ({ ...prev, avatar_url: imageUri }));
        
        if (!isEditing) {
          try {
            await updateProfile({ avatar_url: imageUri });
            Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
          } catch (updateError) {
            console.error('Error updating profile:', updateError);
            Alert.alert('Hata', 'Fotoğraf kaydedilirken bir hata oluştu.');
            setFormData(prev => ({ ...prev, avatar_url: user?.avatar_url || '' }));
          }
        }
      }
    } catch (error: any) {
      console.error('Simple picker error:', error);
      if (error?.message === 'Permission timeout') {
        Alert.alert('İzin Zaman Aşımı', 'İzin istemi dondu. Telefonu yeniden başlatın veya ayarlardan manuel izin verin.');
      } else if (error?.message === 'Picker timeout') {
        Alert.alert('Galeri Zaman Aşımı', 'Galeri açılması çok uzun sürdü. Tekrar deneyin.');
      } else {
        Alert.alert('Hata', 'Fotoğraf seçilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const pickImage = async (source: 'camera' | 'library') => {
    console.log(`Starting image picker for ${source}`);
    
    try {
      setIsUploadingPhoto(true);
      setShowImagePicker(false);
      
      // Shorter timeout for faster recovery
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Image picker timeout')), 15000); // 15 second timeout
      });
      
      let result: any;
      
      if (source === 'camera') {
        console.log('Requesting camera permissions...');
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        console.log('Camera permission result:', cameraPermission);
        
        if (!cameraPermission.granted) {
          Alert.alert('İzin Gerekli', 'Kamera kullanımı için izin gereklidir.');
          setIsUploadingPhoto(false);
          return;
        }
        
        console.log('Launching camera...');
        result = await Promise.race([
          ImagePicker.launchCameraAsync({
            mediaTypes: 'images', // Fixed deprecated MediaTypeOptions
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3, // Even lower quality to prevent freezing
            base64: false,
          }),
          timeoutPromise
        ]);
      } else {
        console.log('Requesting media library permissions...');
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Library permission result:', libraryPermission);
        
        if (!libraryPermission.granted) {
          Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gereklidir.');
          setIsUploadingPhoto(false);
          return;
        }
        
        console.log('Launching image library...');
        result = await Promise.race([
          ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images', // Fixed deprecated MediaTypeOptions
            allowsEditing: false, // Disable editing to reduce complexity
            quality: 0.3, // Very low quality to prevent memory issues
            base64: false,
            exif: false,
            // Add these optimizations
            selectionLimit: 1,
            presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER,
          }),
          timeoutPromise
        ]);
      }

      console.log('Image picker result:', result);

      if (result && !result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Image selected successfully:', imageUri);
        
        // Update form data immediately
        setFormData(prev => ({ ...prev, avatar_url: imageUri }));
        
        if (!isEditing) {
          // If not in edit mode, save immediately
          try {
            console.log('Updating profile with new image...');
            await updateProfile({ avatar_url: imageUri });
            Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
          } catch (updateError) {
            console.error('Error updating profile with image:', updateError);
            Alert.alert('Hata', 'Fotoğraf kaydedilirken bir hata oluştu.');
            // Revert the form data if save failed
            setFormData(prev => ({ ...prev, avatar_url: user?.avatar_url || '' }));
          }
        }
      } else {
        console.log('Image selection canceled or no image selected');
      }
    } catch (error: any) {
      console.error('Error in pickImage:', error);
      if (error?.message === 'Image picker timeout') {
        Alert.alert('Zaman Aşımı', 'Fotoğraf seçimi çok uzun sürdü. Uygulamayı yeniden başlatmayı deneyin.');
      } else {
        Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      // Always ensure loading state is cleared
      console.log('Cleaning up loading state...');
      setIsUploadingPhoto(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as (0xxx) xxx xx xx
    if (cleaned.length >= 11 && cleaned.startsWith('90')) {
      const withoutCountry = cleaned.substring(2);
      return `(0${withoutCountry.substring(0, 3)}) ${withoutCountry.substring(3, 6)} ${withoutCountry.substring(6, 8)} ${withoutCountry.substring(8, 10)}`;
    }
    return phone;
  };

  const renderField = (label: string, value: string, field: keyof typeof formData, placeholder?: string, multiline?: boolean) => {
    console.log(`Rendering field ${label}:`, { value, formData_value: formData[field] });
    
    if (isEditing) {
      return (
        <View style={styles.userInfo}>
          <Text style={styles.label}>{label}:</Text>
          <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            value={formData[field]}
            onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
            placeholder={placeholder || `${label} girin`}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.userInfo}>
          <Text style={styles.label}>{label}:</Text>
          <Text style={styles.value}>{formData[field] || 'Belirtilmemiş'}</Text>
        </View>
      );
    }
  };

  const renderGenderField = () => {
    if (isEditing) {
      return (
        <View style={styles.userInfo}>
          <Text style={styles.label}>Cinsiyet:</Text>
          <View style={styles.genderContainer}>
            {['male', 'female', 'other'].map((genderOption) => (
              <TouchableOpacity
                key={genderOption}
                style={[
                  styles.genderOption,
                  formData.gender === genderOption && styles.genderOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, gender: genderOption }))}
              >
                <Text style={[
                  styles.genderText,
                  formData.gender === genderOption && styles.genderTextSelected
                ]}>
                  {genderOption === 'male' ? 'Erkek' : 
                   genderOption === 'female' ? 'Kadın' : 'Diğer'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.userInfo}>
          <Text style={styles.label}>Cinsiyet:</Text>
          <Text style={styles.value}>
            {user?.gender === 'male' ? 'Erkek' : 
             user?.gender === 'female' ? 'Kadın' : 
             user?.gender === 'other' ? 'Diğer' : 'Belirtilmemiş'}
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Profil</Text>
            {user && !isEditing && (
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <Ionicons name="pencil" size={20} color="#007AFF" />
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>
            )}
          </View>
        
        {user ? (
          <View style={styles.profileSection}>
            {/* Profile Photo */}
            <View style={styles.photoSection}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Photo container pressed, uploading:', isUploadingPhoto);
                  if (!isUploadingPhoto) {
                    // Use direct approach like sell page - no modal
                    console.log('Calling pickImageWorking directly...');
                    pickImageWorking();
                  }
                }}
                style={styles.photoContainer}
                disabled={isUploadingPhoto}
                activeOpacity={isUploadingPhoto ? 1 : 0.7}
              >
                {isUploadingPhoto ? (
                  <View style={styles.photoPlaceholder}>
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                ) : formData.avatar_url ? (
                  <Image source={{ uri: formData.avatar_url }} style={styles.profilePhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={40} color="#666" />
                    <Text style={styles.photoPlaceholderText}>Fotoğraf Ekle</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Alternative photo options */}
            <TouchableOpacity
              style={styles.alternativePhotoButton}
              onPress={() => setShowImagePicker(true)}
              disabled={isUploadingPhoto}
            >
              <Text style={styles.alternativePhotoText}>Diğer Fotoğraf Seçenekleri</Text>
            </TouchableOpacity>

            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
            {renderField('Görünen Ad', formData.display_name || '', 'display_name')}
            {renderField('Ad', formData.first_name || '', 'first_name')}
            {renderField('Soyad', formData.last_name || '', 'last_name')}
            
            {/* Email field - read-only */}
            <View style={styles.userInfo}>
              <Text style={styles.label}>E-posta:</Text>
              <Text style={styles.value}>{user?.email || 'Belirtilmemiş'}</Text>
              {isEditing && (
                <Text style={styles.note}>E-posta adresi değiştirilemez</Text>
              )}
            </View>
            
            {renderField('Telefon', formatPhoneNumber(formData.phone || ''), 'phone', '+90 (5xx) xxx xx xx')}
            {renderField('Şehir', formData.city || '', 'city')}
            {renderField('Doğum Tarihi', formData.birth_date || '', 'birth_date', 'YYYY-MM-DD')}
            {renderGenderField()}

            {/* Address Information */}
            <Text style={styles.sectionTitle}>Adres Bilgileri</Text>
            {renderField('Ev Adresi', formData.home_address || '', 'home_address', 'Ev adresinizi girin', true)}
            {renderField('Ev Posta Kodu', formData.home_postal_code || '', 'home_postal_code')}
            {renderField('İş Adresi', formData.work_address || '', 'work_address', 'İş adresinizi girin', true)}
            {renderField('İş Posta Kodu', formData.work_postal_code || '', 'work_postal_code')}
            
            {/* System Information */}
            <Text style={styles.sectionTitle}>Sistem Bilgileri</Text>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Üyelik Tarihi:</Text>
              <Text style={styles.value}>
                {new Date(user.created_at).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            
            {user.updated_at && (
              <View style={styles.userInfo}>
                <Text style={styles.label}>Son Güncelleme:</Text>
                <Text style={styles.value}>
                  {new Date(user.updated_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSave} 
                  style={styles.saveButton}
                  disabled={isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Pressable 
                onPress={handleSignOut} 
                style={styles.signOutButton}
                disabled={isLoading || isSigningOut}
              >
                <Text style={styles.signOutText}>
                  {isSigningOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.notAuthenticatedSection}>
            <Text style={styles.notAuthenticatedText}>
              Profil bilgilerinizi görmek için giriş yapmanız gerekmektedir.
            </Text>
          </View>
        )}
        </View>

        {/* Image Picker Modal */}
        <Modal
          visible={showImagePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            if (!isUploadingPhoto) {
              setShowImagePicker(false);
            }
          }}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil Fotoğrafı Seç</Text>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: isUploadingPhoto ? "#f0f0f0" : "#2196F3" }]}
              onPress={() => {
                console.log('Working gallery button pressed (from sell page)');
                pickImageWorking();
              }}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="checkmark-circle" size={24} color={isUploadingPhoto ? "#999" : "white"} />
              <Text style={[styles.modalButtonText, { color: isUploadingPhoto ? "#999" : "white" }]}>
                {isUploadingPhoto ? 'Yükleniyor...' : 'Çalışan Galeri (Sell Sayfası Gibi)'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                console.log('Camera button pressed');
                pickImage('camera');
              }}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="camera" size={24} color={isUploadingPhoto ? "#999" : "#007AFF"} />
              <Text style={[styles.modalButtonText, { color: isUploadingPhoto ? "#999" : "#007AFF" }]}>
                {isUploadingPhoto ? 'Yükleniyor...' : 'Kamera'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                console.log('Gallery button pressed');
                pickImage('library');
              }}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="images" size={24} color={isUploadingPhoto ? "#999" : "#007AFF"} />
              <Text style={[styles.modalButtonText, { color: isUploadingPhoto ? "#999" : "#007AFF" }]}>
                {isUploadingPhoto ? 'Yükleniyor...' : 'Galeri'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: isUploadingPhoto ? "#f0f0f0" : "#4CAF50" }]}
              onPress={() => {
                console.log('Simple gallery button pressed');
                pickImageSimple();
              }}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="image" size={24} color={isUploadingPhoto ? "#999" : "white"} />
              <Text style={[styles.modalButtonText, { color: isUploadingPhoto ? "#999" : "white" }]}>
                {isUploadingPhoto ? 'Yükleniyor...' : 'Basit Galeri'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: isUploadingPhoto ? "#f0f0f0" : "#FF9800" }]}
              onPress={() => {
                console.log('Direct gallery button pressed');
                pickImageDirect();
              }}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="folder" size={24} color={isUploadingPhoto ? "#999" : "white"} />
              <Text style={[styles.modalButtonText, { color: isUploadingPhoto ? "#999" : "white" }]}>
                {isUploadingPhoto ? 'Yükleniyor...' : 'Direkt Galeri'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: isUploadingPhoto ? "#f0f0f0" : "#9C27B0" }]}
              onPress={() => {
                console.log('Minimal gallery button pressed');
                pickImageMinimal();
              }}
              disabled={isUploadingPhoto}
            >
              <Ionicons name="document" size={24} color={isUploadingPhoto ? "#999" : "white"} />
              <Text style={[styles.modalButtonText, { color: isUploadingPhoto ? "#999" : "white" }]}>
                {isUploadingPhoto ? 'Yükleniyor...' : 'Ultra Basit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                if (!isUploadingPhoto) {
                  setShowImagePicker(false);
                }
              }}
              disabled={isUploadingPhoto}
            >
              <Text style={[styles.modalCancelText, { color: isUploadingPhoto ? "#999" : "#666" }]}>
                {isUploadingPhoto ? 'Yükleniyor...' : 'İptal'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Web responsive tasarımı
    ...(Platform.OS === 'web' && {
      maxWidth: 480,
      alignSelf: 'center',
      width: '100%',
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#e1e1e1',
    }),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Increased padding to avoid tab bar overlap on all devices
  },
  content: {
    padding: 16,
    paddingTop: 8, // Reduced top padding since SafeAreaView handles it
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8, // Add gap from top to avoid island area
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileSection: {
    gap: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#e9ecef',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderText: {
    fontSize: 14,
    color: '#333',
  },
  genderTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  signOutText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  notAuthenticatedSection: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 50, // Extra padding for home indicator area
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  alternativePhotoButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  alternativePhotoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
