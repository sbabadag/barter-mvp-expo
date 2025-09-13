import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Product {
  id: string;
  title: string;
  price?: number;
  currency?: string;
  image_url?: string;
  category?: string;
  seller_name?: string;
  location?: string;
  created_at: string;
  isNew?: boolean;
  isSale?: boolean;
  liked?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
  onPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  onPress,
}) => {
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Takas';
    return `${price} ${currency || 'TL'}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress?.(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: product.image_url || 'https://via.placeholder.com/300x400?text=No+Image'
          }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Badges */}
        <View style={styles.badgeContainer}>
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>Yeni</Text>
            </View>
          )}
          {product.isSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>İndirim</Text>
            </View>
          )}
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(product.id)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Price */}
        <Text style={styles.price}>
          {formatPrice(product.price, product.currency)}
        </Text>

        {/* Seller and Location */}
        <View style={styles.metaContainer}>
          <View style={styles.sellerInfo}>
            <Ionicons name="person-outline" size={12} color="#6B7280" />
            <Text style={styles.seller} numberOfLines={1}>
              {product.seller_name || 'Anonim'}
            </Text>
          </View>
          
          {product.location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.location} numberOfLines={1}>
                {product.location}
              </Text>
            </View>
          )}
        </View>

        {/* Time and Action */}
        <View style={styles.bottomRow}>
          <Text style={styles.timeAgo}>
            {getTimeAgo(product.created_at)}
          </Text>
          
          {product.price ? (
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => onAddToCart?.(product)}
            >
              <Text style={styles.buyButtonText}>Satın Al</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.barterButton}
              onPress={() => onAddToCart?.(product)}
            >
              <Text style={styles.barterButtonText}>Takas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    maxWidth: '48%',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  saleBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  metaContainer: {
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  seller: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  buyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  barterButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  barterButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});