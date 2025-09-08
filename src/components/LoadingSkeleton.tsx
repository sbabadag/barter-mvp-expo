import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface LoadingSkeletonProps {
  type: 'listing' | 'rating' | 'bids';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type }) => {
  if (type === 'listing') {
    return (
      <View style={styles.container}>
        {/* Image skeleton */}
        <View style={styles.imageSkeleton} />
        
        {/* Content skeleton */}
        <View style={styles.contentContainer}>
          <View style={[styles.lineSkeleton, styles.titleSkeleton]} />
          <View style={[styles.lineSkeleton, styles.priceSkeleton]} />
          <View style={[styles.lineSkeleton, styles.descriptionSkeleton]} />
          <View style={[styles.lineSkeleton, styles.descriptionSkeleton, { width: '60%' }]} />
        </View>
      </View>
    );
  }

  if (type === 'rating') {
    return (
      <View style={styles.ratingContainer}>
        <View style={[styles.lineSkeleton, { width: 100, height: 20 }]} />
        <View style={[styles.lineSkeleton, { width: 150, height: 16, marginTop: 8 }]} />
      </View>
    );
  }

  if (type === 'bids') {
    return (
      <View style={styles.bidsContainer}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.bidSkeleton}>
            <View style={[styles.lineSkeleton, { width: 80, height: 20 }]} />
            <View style={[styles.lineSkeleton, { width: 120, height: 16, marginTop: 8 }]} />
          </View>
        ))}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  imageSkeleton: {
    width: width,
    height: 400,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    padding: 16,
  },
  lineSkeleton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 12,
  },
  titleSkeleton: {
    height: 24,
    width: '80%',
  },
  priceSkeleton: {
    height: 28,
    width: '40%',
  },
  descriptionSkeleton: {
    height: 16,
    width: '100%',
  },
  ratingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  bidsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  bidSkeleton: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

export default LoadingSkeleton;
