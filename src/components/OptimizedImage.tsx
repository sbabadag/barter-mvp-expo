import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

export interface OptimizedImageProps {
  // Image URLs for different sizes
  thumbnailUrl?: string;
  mediumUrl?: string;
  fullUrl?: string;
  fallbackUrl?: string; // Fallback to original image_url
  
  // Display properties
  style?: any;
  width?: number;
  height?: number;
  borderRadius?: number;
  
  // Behavior
  progressive?: boolean; // Load thumbnail first, then higher quality
  lazy?: boolean; // Enable lazy loading
  onPress?: () => void;
  onError?: (error: any) => void;
  onLoadEnd?: () => void;
  
  // Loading states
  showPlaceholder?: boolean;
  placeholderColor?: string;
  
  // Accessibility
  accessibilityLabel?: string;
}

interface ImageLoadState {
  thumbnailLoaded: boolean;
  mediumLoaded: boolean;
  fullLoaded: boolean;
  error: boolean;
  isLoading: boolean;
}

export default function OptimizedImage({
  thumbnailUrl,
  mediumUrl,
  fullUrl,
  fallbackUrl,
  style,
  width,
  height,
  borderRadius = 0,
  progressive = true,
  lazy = false,
  onPress,
  onError,
  onLoadEnd,
  showPlaceholder = true,
  placeholderColor = '#f0f0f0',
  accessibilityLabel,
}: OptimizedImageProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>({
    thumbnailLoaded: false,
    mediumLoaded: false,
    fullLoaded: false,
    error: false,
    isLoading: false,
  });

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  // Determine the best available image URL based on what's loaded
  const getBestImageUrl = (): string | null => {
    if (loadState.error) {
      return fallbackUrl || null;
    }

    if (progressive) {
      // Progressive loading: show best available quality
      if (loadState.fullLoaded && fullUrl) return fullUrl;
      if (loadState.mediumLoaded && mediumUrl) return mediumUrl;
      if (loadState.thumbnailLoaded && thumbnailUrl) return thumbnailUrl;
    } else {
      // Non-progressive: try to show the highest quality available
      if (fullUrl) return fullUrl;
      if (mediumUrl) return mediumUrl;
      if (thumbnailUrl) return thumbnailUrl;
    }

    return fallbackUrl || null;
  };

  // Start loading images in sequence (progressive) or parallel
  useEffect(() => {
    if (!shouldLoad) return;

    const loadImages = async () => {
      setLoadState(prev => ({ ...prev, isLoading: true }));

      try {
        if (progressive) {
          // Load images progressively (thumbnail first, then medium, then full)
          if (thumbnailUrl) {
            setCurrentImageUrl(thumbnailUrl);
            // Thumbnail loads quickly, so we mark it as loaded immediately
            setLoadState(prev => ({ ...prev, thumbnailLoaded: true }));
          }

          // Load medium quality
          if (mediumUrl) {
            setTimeout(() => {
              setCurrentImageUrl(mediumUrl);
              setLoadState(prev => ({ ...prev, mediumLoaded: true }));
            }, 100); // Small delay to show thumbnail first
          }

          // Load full quality
          if (fullUrl) {
            setTimeout(() => {
              setCurrentImageUrl(fullUrl);
              setLoadState(prev => ({ ...prev, fullLoaded: true }));
            }, 300); // Larger delay for progressive effect
          }
        } else {
          // Load the best available image directly
          const bestUrl = fullUrl || mediumUrl || thumbnailUrl || fallbackUrl;
          if (bestUrl) {
            setCurrentImageUrl(bestUrl);
            if (bestUrl === fullUrl) {
              setLoadState(prev => ({ ...prev, fullLoaded: true }));
            } else if (bestUrl === mediumUrl) {
              setLoadState(prev => ({ ...prev, mediumLoaded: true }));
            } else if (bestUrl === thumbnailUrl) {
              setLoadState(prev => ({ ...prev, thumbnailLoaded: true }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading optimized image:', error);
        setLoadState(prev => ({ ...prev, error: true }));
        onError?.(error);
      } finally {
        setLoadState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadImages();
  }, [shouldLoad, thumbnailUrl, mediumUrl, fullUrl, fallbackUrl, progressive]);

  // Handle lazy loading
  useEffect(() => {
    if (lazy && !shouldLoad) {
      // For lazy loading, we'd need to implement intersection observer
      // For now, we'll load after a short delay
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }
  }, [lazy, shouldLoad]);

  // Determine what to render
  const imageUrl = getBestImageUrl();
  
  const containerStyle = [
    styles.container,
    style,
    {
      width: width || style?.width,
      height: height || style?.height,
      borderRadius,
    },
  ];

  const imageStyle = [
    styles.image,
    {
      borderRadius,
    },
  ];

  const handleImageError = (error: any) => {
    console.warn('OptimizedImage error:', error);
    setLoadState(prev => ({ ...prev, error: true }));
    onError?.(error);
  };

  const handleImageLoadEnd = () => {
    setLoadState(prev => ({ ...prev, isLoading: false }));
    onLoadEnd?.();
  };

  // Render placeholder
  if (!imageUrl || (!shouldLoad && lazy)) {
    return (
      <View style={[containerStyle, { backgroundColor: placeholderColor }]}>
        {showPlaceholder && (
          <View style={styles.placeholder}>
            <MaterialIcons name="image" size={24} color="#ccc" />
          </View>
        )}
      </View>
    );
  }

  // Render error state
  if (loadState.error && !fallbackUrl) {
    return (
      <View style={[containerStyle, { backgroundColor: placeholderColor }]}>
        <View style={styles.placeholder}>
          <MaterialIcons name="broken-image" size={24} color="#ff6b6b" />
        </View>
      </View>
    );
  }

  // Render image
  const imageContent = (
    <View style={containerStyle}>
      <Image
        source={{ uri: imageUrl }}
        style={imageStyle}
        contentFit="cover"
        transition={200}
        onError={handleImageError}
        onLoadEnd={handleImageLoadEnd}
        accessibilityLabel={accessibilityLabel}
        placeholder={{ uri: thumbnailUrl }}
        placeholderContentFit="cover"
      />
      
      {/* Loading indicator */}
      {loadState.isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
    </View>
  );

  // Wrap with Pressable if onPress is provided
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {imageContent}
      </Pressable>
    );
  }

  return imageContent;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  pressable: {
    // No additional styles needed
  },
});