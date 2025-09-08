import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  location: string;
  images: string[];
  created_at: string;
  seller_id: string;
  status: 'active' | 'sold' | 'inactive';
  profiles?: {
    display_name: string;
    avatar_url?: string;
    phone?: string;
  };
}

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
}

export default function ListingCard({ listing, onPress }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new': return 'Sıfır';
      case 'like_new': return 'Sıfır Gibi';
      case 'good': return 'İyi';
      case 'fair': return 'Orta';
      case 'poor': return 'Kötü';
      default: return condition;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return '#4caf50';
      case 'like_new': return '#8bc34a';
      case 'good': return '#ffc107';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Resim */}
      <View style={styles.imageContainer}>
        {listing.images && listing.images.length > 0 ? (
          <Image 
            source={{ uri: listing.images[0] }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageContainer}>
            <MaterialIcons name="image" size={40} color="#ccc" />
            <Text style={styles.noImageText}>Resim Yok</Text>
          </View>
        )}
        
        {/* Resim sayısı */}
        {listing.images && listing.images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <MaterialIcons name="photo-library" size={12} color="white" />
            <Text style={styles.imageCountText}>{listing.images.length}</Text>
          </View>
        )}
      </View>

      {/* İçerik */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={styles.price}>
            {formatPrice(listing.price)}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {listing.description}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialIcons name="star" size={14} color={getConditionColor(listing.condition)} />
            <Text style={[styles.conditionText, { color: getConditionColor(listing.condition) }]}>
              {getConditionText(listing.condition)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={14} color="#6c757d" />
            <Text style={styles.locationText} numberOfLines={1}>
              {listing.location}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.category}>
            {listing.category}
          </Text>
          <Text style={styles.date}>
            {formatDate(listing.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6c757d',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  imageCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f0a500',
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 12,
    color: '#6c757d',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#f0a500',
    fontWeight: '600',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  date: {
    fontSize: 12,
    color: '#6c757d',
  },
});
