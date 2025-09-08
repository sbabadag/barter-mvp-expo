import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../utils/supabase';

interface Rating {
  id: string;
  rating: number;
  review_text: string;
  communication_rating: number;
  item_condition_rating: number;
  delivery_rating: number;
  transaction_type: 'buyer' | 'seller';
  created_at: string;
  reviewer: {
    display_name: string;
  };
  listing: {
    title: string;
  } | null;
}

interface UserStats {
  user_id: string;
  average_rating: number;
  total_reviews: number;
  seller_average_rating: number;
  seller_total_reviews: number;
  buyer_average_rating: number;
  buyer_total_reviews: number;
  seller_5_star: number;
  seller_4_star: number;
  seller_3_star: number;
  seller_2_star: number;
  seller_1_star: number;
}

interface UserRatingDisplayProps {
  userId: string;
  showDetailedStats?: boolean;
  showRecentReviews?: boolean;
  maxReviews?: number;
}

const UserRatingDisplay: React.FC<UserRatingDisplayProps> = ({
  userId,
  showDetailedStats = true,
  showRecentReviews = true,
  maxReviews = 5,
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'seller' | 'buyer'>('seller');

  const loadRatingData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);

      // Only fetch stats if we want to show them
      if (showDetailedStats || !showRecentReviews) {
        const { data: statsData, error: statsError } = await supabase
          .from('user_rating_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!statsError && statsData) {
          setStats(statsData);
        }
      }

      // Only fetch recent ratings if we want to show them
      if (showRecentReviews) {
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select(`
            id,
            rating,
            review_text,
            communication_rating,
            item_condition_rating,
            delivery_rating,
            transaction_type,
            created_at,
            reviewer:profiles!ratings_reviewer_id_fkey(display_name),
            listing:listings(title)
          `)
          .eq('reviewed_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(maxReviews);

        if (!ratingsError && ratingsData) {
          // Transform the data to handle Supabase array responses
          const transformedRatings = ratingsData.map(rating => ({
            ...rating,
            reviewer: Array.isArray(rating.reviewer) ? rating.reviewer[0] : rating.reviewer,
            listing: Array.isArray(rating.listing) ? rating.listing[0] : rating.listing,
          }));
          setRatings(transformedRatings as Rating[]);
        }
      }

    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, showDetailedStats, showRecentReviews, maxReviews]);

  useEffect(() => {
    loadRatingData();
  }, [loadRatingData]);

  const renderStars = useCallback((rating: number, size: number = 16) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.starsContainer}>
        {/* Full stars */}
        {Array(fullStars).fill(0).map((_, i) => (
          <Text key={`full-${i}`} style={[styles.star, { fontSize: size, color: '#FFD700' }]}>
            ⭐
          </Text>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <Text style={[styles.star, { fontSize: size, color: '#FFD700' }]}>
            ⭐
          </Text>
        )}
        
        {/* Empty stars */}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.star, { fontSize: size, color: '#E0E0E0' }]}>
            ⭐
          </Text>
        ))}
        
        <Text style={[styles.ratingNumber, { fontSize: size - 2 }]}>
          ({rating.toFixed(1)})
        </Text>
      </View>
    );
  }, []);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.starsContainer}>
        {/* Full stars */}
        {Array(fullStars).fill(0).map((_, i) => (
          <Text key={`full-${i}`} style={[styles.star, { fontSize: size, color: '#FFD700' }]}>
            ⭐
          </Text>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <Text style={[styles.star, { fontSize: size, color: '#FFD700' }]}>
            ⭐
          </Text>
        )}
        
        {/* Empty stars */}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.star, { fontSize: size, color: '#E0E0E0' }]}>
            ⭐
          </Text>
        ))}
        
        <Text style={[styles.ratingNumber, { fontSize: size - 2 }]}>
          ({rating.toFixed(1)})
        </Text>
      </View>
    );
  };

  const renderRatingItem = ({ item }: { item: Rating }) => (
    <View style={styles.ratingItem}>
      <View style={styles.ratingHeader}>
        <Text style={styles.reviewerName}>
          {item.reviewer?.display_name || 'Anonim'}
        </Text>
        <View style={styles.ratingStars}>
          {renderStars(item.rating, 14)}
        </View>
      </View>
      
      {item.listing && (
        <Text style={styles.listingTitle}>
          "{item.listing.title}" için değerlendirme
        </Text>
      )}
      
      {item.review_text && (
        <Text style={styles.reviewText}>{item.review_text}</Text>
      )}
      
      {showDetailedStats && (
        <View style={styles.detailedRatings}>
          <View style={styles.detailRating}>
            <Text style={styles.detailLabel}>İletişim:</Text>
            {renderStars(item.communication_rating, 12)}
          </View>
          {item.transaction_type === 'seller' && (
            <>
              <View style={styles.detailRating}>
                <Text style={styles.detailLabel}>Ürün:</Text>
                {renderStars(item.item_condition_rating, 12)}
              </View>
              <View style={styles.detailRating}>
                <Text style={styles.detailLabel}>Teslimat:</Text>
                {renderStars(item.delivery_rating, 12)}
              </View>
            </>
          )}
        </View>
      )}
      
      <Text style={styles.ratingDate}>
        {new Date(item.created_at).toLocaleDateString('tr-TR')}
      </Text>
    </View>
  );

  const renderStatsSummary = () => {
    if (!stats || stats.total_reviews === 0) {
      return (
        <View style={styles.noRatingsContainer}>
          <Text style={styles.noRatingsText}>Henüz değerlendirme yok</Text>
        </View>
      );
    }

    const currentStats = activeTab === 'seller' 
      ? { average: stats.seller_average_rating, total: stats.seller_total_reviews }
      : { average: stats.buyer_average_rating, total: stats.buyer_total_reviews };

    return (
      <View style={styles.statsContainer}>
        <View style={styles.overallRating}>
          {renderStars(currentStats.average, 20)}
          <Text style={styles.totalReviews}>
            {currentStats.total} değerlendirme
          </Text>
        </View>

        {showDetailedStats && activeTab === 'seller' && (
          <View style={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats[`seller_${star}_star` as keyof UserStats] as number;
              const percentage = stats.seller_total_reviews > 0 
                ? (count / stats.seller_total_reviews) * 100 
                : 0;
              
              return (
                <View key={star} style={styles.ratingRow}>
                  <Text style={styles.starLabel}>{star} ⭐</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${percentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.countLabel}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Selection */}
      {stats && (stats.seller_total_reviews > 0 || stats.buyer_total_reviews > 0) && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'seller' && styles.activeTab]}
            onPress={() => setActiveTab('seller')}
          >
            <Text style={[styles.tabText, activeTab === 'seller' && styles.activeTabText]}>
              Satıcı ({stats.seller_total_reviews})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buyer' && styles.activeTab]}
            onPress={() => setActiveTab('buyer')}
          >
            <Text style={[styles.tabText, activeTab === 'buyer' && styles.activeTabText]}>
              Alıcı ({stats.buyer_total_reviews})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Summary */}
      {renderStatsSummary()}

      {/* Recent Reviews */}
      {showRecentReviews && ratings.length > 0 && (
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Son Değerlendirmeler</Text>
          <FlatList
            data={ratings.filter(r => r.transaction_type === activeTab)}
            keyExtractor={(item) => item.id}
            renderItem={renderRatingItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  star: {
    marginRight: 2,
  },
  ratingNumber: {
    marginLeft: 8,
    color: '#666666',
    fontWeight: '500',
  },
  totalReviews: {
    fontSize: 14,
    color: '#666666',
  },
  ratingBreakdown: {
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starLabel: {
    width: 40,
    fontSize: 12,
    color: '#333333',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  countLabel: {
    width: 30,
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  noRatingsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noRatingsText: {
    color: '#666666',
    fontSize: 14,
  },
  reviewsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  ratingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingTitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  reviewText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  detailedRatings: {
    marginBottom: 8,
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666666',
    width: 60,
  },
  ratingDate: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'right',
  },
});

export default UserRatingDisplay;
