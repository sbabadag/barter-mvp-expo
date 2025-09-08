import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../utils/supabase';

interface UserStats {
  user_id: string;
  average_rating: number;
  total_reviews: number;
  seller_average_rating: number;
  seller_total_reviews: number;
  buyer_average_rating: number;
  buyer_total_reviews: number;
}

interface UserRatingDisplayProps {
  userId: string;
  showDetailedStats?: boolean;
  showRecentReviews?: boolean;
  maxReviews?: number;
  compact?: boolean; // New prop for compact display
}

const UserRatingDisplay: React.FC<UserRatingDisplayProps> = memo(({
  userId,
  showDetailedStats = false, // Default to false for better performance
  showRecentReviews = false, // Default to false for better performance
  maxReviews = 3,
  compact = true, // Default to compact mode
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRatingData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);

      // Only fetch basic stats for performance
      const { data: statsData, error: statsError } = await supabase
        .from('user_rating_stats')
        .select('user_id, average_rating, total_reviews, seller_average_rating, seller_total_reviews, buyer_average_rating, buyer_total_reviews')
        .eq('user_id', userId)
        .single();

      if (!statsError && statsData) {
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRatingData();
  }, [loadRatingData]);

  const renderStars = useCallback((rating: number, size: number = 14) => {
    if (!rating || rating === 0) {
      return (
        <View style={styles.starsContainer}>
          <Text style={[styles.noRatingsText, { fontSize: size - 2 }]}>
            Henüz değerlendirme yok
          </Text>
        </View>
      );
    }

    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
      <View style={styles.starsContainer}>
        {/* Full stars */}
        {Array(fullStars).fill(0).map((_, i) => (
          <Text key={`full-${i}`} style={[styles.star, { fontSize: size, color: '#FFD700' }]}>
            ⭐
          </Text>
        ))}
        
        {/* Empty stars */}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.star, { fontSize: size, color: '#E0E0E0' }]}>
            ⭐
          </Text>
        ))}
        
        <Text style={[styles.ratingNumber, { fontSize: size - 2, marginLeft: 4 }]}>
          ({rating.toFixed(1)})
        </Text>
      </View>
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <View style={styles.noRatingsContainer}>
        <Text style={styles.noRatingsText}>Henüz değerlendirme yok</Text>
      </View>
    );
  }

  if (compact) {
    // Compact display for listing cards and quick views
    return (
      <View style={styles.compactContainer}>
        {renderStars(stats.average_rating, 12)}
        <Text style={styles.compactReviewCount}>
          {stats.total_reviews} değerlendirme
        </Text>
      </View>
    );
  }

  // Full display for profile pages
  return (
    <View style={styles.container}>
      <View style={styles.overallRating}>
        {renderStars(stats.average_rating, 16)}
        <Text style={styles.totalReviews}>
          {stats.total_reviews} toplam değerlendirme
        </Text>
      </View>

      {showDetailedStats && (
        <View style={styles.detailedStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Satıcı olarak:</Text>
            {renderStars(stats.seller_average_rating, 14)}
            <Text style={styles.statCount}>({stats.seller_total_reviews})</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Alıcı olarak:</Text>
            {renderStars(stats.buyer_average_rating, 14)}
            <Text style={styles.statCount}>({stats.buyer_total_reviews})</Text>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  noRatingsContainer: {
    padding: 10,
    alignItems: 'center',
  },
  noRatingsText: {
    color: '#666666',
    fontSize: 12,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 1,
  },
  ratingNumber: {
    color: '#666666',
    fontWeight: '500',
  },
  totalReviews: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  compactReviewCount: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 4,
  },
  detailedStats: {
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#333333',
    width: 80,
  },
  statCount: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 4,
  },
});

export default UserRatingDisplay;
