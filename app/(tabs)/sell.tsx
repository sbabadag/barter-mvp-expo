import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SellScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="add-circle-outline" size={80} color="#007bff" />
        <Text style={styles.title}>Yeni Ürün Ekle</Text>
        <Text style={styles.description}>
          Yapay zeka destekli ürün tanıma özelliği ile hızlıca ürününüzü ekleyin.
        </Text>
        
        <Pressable 
          style={styles.button}
          onPress={() => router.push('/add-listing')}
        >
          <MaterialIcons name="smart-toy" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>AI ile Ürün Ekle</Text>
        </Pressable>
        
        <Text style={styles.note}>
          📱 Fotoğraf çek → 🤖 AI analiz etsin → ✨ Otomatik doldursun
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
});