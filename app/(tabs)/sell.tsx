import { useState } from "react";
import { View, TextInput, Text, Pressable, Alert, ScrollView, Image, StyleSheet, Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createListing } from "../../src/services/listings";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

const { width } = Dimensions.get('window');

export default function SellScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 6,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!res.canceled) setImages(res.assets.map(a => a.uri));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    try {
      console.log("Attempting to create listing:", { title, description, price, imageCount: images.length });
      
      const listingId = await createListing({ 
        title, 
        description, 
        price: price ? Number(price) : null, 
        imageUris: images 
      });
      
      console.log("Listing created successfully with ID:", listingId);
      
      // Invalidate and refetch listings to show the new listing
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      Alert.alert("Başarılı", "İlan kaydedildi");
      setTitle(""); 
      setDescription(""); 
      setPrice(""); 
      setImages([]);
      
      // Ana sayfaya (home tab) yönlendir
      router.push("/(tabs)/");
    } catch (e: any) {
      console.error("Error creating listing:", e);
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
            {images.length === 0 ? "Fotoğraf Ekle" : "Daha Fazla Fotoğraf Ekle"}
          </Text>
        </Pressable>
      </View>

      <Pressable 
        onPress={onSubmit} 
        style={[styles.submitButton, (!title || !description) && styles.submitButtonDisabled]}
        disabled={!title || !description}
      >
        <Text style={styles.submitButtonText}>İlanı Yayınla</Text>
      </Pressable>
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
});
