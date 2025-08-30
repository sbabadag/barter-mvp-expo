import { View, Text, Pressable, ScrollView, Image, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useListing } from "../../src/services/listings";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

const { width } = Dimensions.get('window');

export default function ListingDetail(){
  const { id } = useLocalSearchParams<{id: string}>();
  const { data } = useListing(id!);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!data) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Yükleniyor...</Text>
    </View>
  );

  // Get images from listing data or fallback to generated ones
  const images = data.images || [
    data.image_url || `https://picsum.photos/400/500?random=${data.id}`,
    `https://picsum.photos/400/500?random=${data.id}2`,
    `https://picsum.photos/400/500?random=${data.id}3`,
  ];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageGallery}>
        <Image 
          source={{ uri: images[currentImageIndex] }} 
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <Pressable style={styles.prevButton} onPress={prevImage}>
              <MaterialIcons name="chevron-left" size={24} color="white" />
            </Pressable>
            <Pressable style={styles.nextButton} onPress={nextImage}>
              <MaterialIcons name="chevron-right" size={24} color="white" />
            </Pressable>
            
            {/* Image Dots Indicator */}
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </>
        )}
      </View>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
        >
          {images.map((imageUri, index) => (
            <Pressable
              key={index}
              onPress={() => setCurrentImageIndex(index)}
              style={[
                styles.thumbnail,
                currentImageIndex === index && styles.activeThumbnail
              ]}
            >
              <Image 
                source={{ uri: imageUri }} 
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.price}>
          {data.price ? `$${data.price}` : "Takas"}
        </Text>
        
        <Text style={styles.sectionTitle}>Açıklama</Text>
        <Text style={styles.description}>{data.description}</Text>
        
        <Text style={styles.sectionTitle}>Ürün Bilgileri</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Durum:</Text>
          <Text style={styles.infoValue}>Çok İyi</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kategori:</Text>
          <Text style={styles.infoValue}>Giyim</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Yayınlanma:</Text>
          <Text style={styles.infoValue}>
            {new Date(data.created_at).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.messageButton}>
          <MaterialIcons name="chat" size={20} color="white" />
          <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
        </Pressable>
        <Pressable style={styles.offerButton}>
          <MaterialIcons name="local-offer" size={20} color="white" />
          <Text style={styles.offerButtonText}>Teklif Ver</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  imageGallery: {
    width: width,
    height: 400,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  prevButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#f0a500',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f0a500',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  offerButton: {
    flex: 1,
    backgroundColor: '#f0a500',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  offerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
