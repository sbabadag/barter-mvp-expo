import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DepopTheme, DepopLayout } from '../styles/DepopTheme';

const { width: screenWidth } = Dimensions.get('window');
// Web'de daha küçük kart boyutu
const getCardWidth = () => {
  if (Platform.OS === 'web') {
    return (480 - (DepopLayout.screenPadding * 2) - DepopLayout.cardSpacing) / 2; // 480px max genişlik
  }
  return (screenWidth - (DepopLayout.screenPadding * 2) - DepopLayout.cardSpacing) / 2;
};
const cardWidth = getCardWidth();

interface DepopCardProps {
  item: {
    id: string;
    title: string;
    price: string;
    seller: string;
    image_url: string;
    liked?: boolean;
  };
  onPress: () => void;
  onLike: () => void;
}

export const DepopCard: React.FC<DepopCardProps> = ({ item, onPress, onLike }) => {
  const [liked, setLiked] = useState(item.liked || false);

  const handleLike = () => {
    setLiked(!liked);
    onLike();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Heart Button - Depop Style */}
        <TouchableOpacity 
          style={styles.heartButton} 
          onPress={handleLike}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? DepopTheme.colors.heart : DepopTheme.colors.text.inverse}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Seller Name - Small and understated */}
        <Text style={styles.seller} numberOfLines={1}>
          @{item.seller}
        </Text>
        
        {/* Item Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        {/* Price - Bold and prominent */}
        <Text style={styles.price}>
          ${item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: DepopTheme.colors.surface,
    marginBottom: DepopLayout.cardSpacing,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth * DepopLayout.cardAspectRatio,
    backgroundColor: DepopTheme.colors.background,
  },
  
  image: {
    width: '100%',
    height: '100%',
  } as const,
  
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    padding: DepopTheme.spacing.sm,
    paddingHorizontal: DepopTheme.spacing.xs,
  },
  
  seller: {
    fontSize: DepopTheme.typography.sizes.xs,
    color: DepopTheme.colors.text.tertiary,
    fontWeight: DepopTheme.typography.weights.normal,
    marginBottom: 2,
  },
  
  title: {
    fontSize: DepopTheme.typography.sizes.sm,
    color: DepopTheme.colors.text.primary,
    fontWeight: DepopTheme.typography.weights.normal,
    lineHeight: 18,
    marginBottom: 4,
  },
  
  price: {
    fontSize: DepopTheme.typography.sizes.base,
    color: DepopTheme.colors.text.primary,
    fontWeight: DepopTheme.typography.weights.bold,
  },
});
