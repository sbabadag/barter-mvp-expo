import { useState } from "react";
import { View, TextInput, Text, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createListing } from "../../src/services/listings";

export default function SellScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 6,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!res.canceled) setImages(res.assets.map(a => a.uri));
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
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Yeni İlan</Text>
      <TextInput placeholder="Başlık" value={title} onChangeText={setTitle} style={{ borderWidth:1, borderColor:"#ddd", borderRadius:12, padding:12 }} />
      <TextInput placeholder="Açıklama" value={description} onChangeText={setDescription} multiline style={{ borderWidth:1, borderColor:"#ddd", borderRadius:12, padding:12, minHeight:100 }} />
      <TextInput placeholder="Fiyat (opsiyonel, yalnızca satış)" keyboardType="numeric" value={price} onChangeText={setPrice} style={{ borderWidth:1, borderColor:"#ddd", borderRadius:12, padding:12 }} />
      <Pressable onPress={pickImages} style={{ padding: 12, backgroundColor: "#111", borderRadius: 12 }}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Fotoğraf Seç</Text>
      </Pressable>
      <Pressable onPress={onSubmit} style={{ padding: 14, backgroundColor: "#16a34a", borderRadius: 12 }}>
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>Yayınla</Text>
      </Pressable>
    </View>
  );
}
