import { View, Text, Pressable, ScrollView, Image, StyleSheet, Dimensions, Alert, PanResponder } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useListing } from "../../src/services/listings";
import { useSellerInfo } from "../../src/services/seller";
import { useBidsForListing } from "../../src/services/bids";
import { useAuth } from "../../src/state/AuthProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import BiddingModal from "../../src/components/BiddingModal";
import RatingModal from "../../src/components/RatingModal";
import UserRatingDisplay from "../../src/components/UserRatingDisplayOptimized";
import ErrorBoundary from "../../src/components/ErrorBoundary";
import LoadingSkeleton from "../../src/components/LoadingSkeleton";

const { width } = Dimensions.get('window');

export default function ListingDetail(){
  const { id } = useLocalSearchParams<{id: string}>();
  const { data } = useListing(id!);
  const { user, isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBiddingModal, setShowBiddingModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [loadBids, setLoadBids] = useState(false);
  const [loadSeller, setLoadSeller] = useState(false);
  
  // Lazy load seller info only when needed
  const { data: sellerInfo } = useSellerInfo(loadSeller ? data?.seller_id : undefined);
  
  // Lazy load bids only when needed
  const { bids, isLoading, error, refetch: refetchBids } = useBidsForListing(loadBids ? id! : '');
  
  // Load secondary content after a delay to prioritize listing display
  useEffect(() => {
    if (data) {
      // Load seller info first after 1 second
      const sellerTimer = setTimeout(() => {
        setLoadSeller(true);
      }, 1000);
      
      // Load bids after 2 seconds
      const bidsTimer = setTimeout(() => {
        setLoadBids(true);
      }, 2000);
      
      return () => {
        clearTimeout(sellerTimer);
        clearTimeout(bidsTimer);
      };
    }
  }, [data]);

  // Create a simple panResponder with dynamic functions
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Optional: You can add visual feedback here
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        
        // Determine if swipe was significant enough
        const swipeThreshold = width * 0.25; // 25% of screen width
        const velocityThreshold = 0.5;
        
        if (Math.abs(dx) > swipeThreshold || Math.abs(vx) > velocityThreshold) {
          // Get current images from data
          const currentImages = data?.images || [
            data?.image_url || '',
          ].filter(img => img); // Filter out empty strings
          
          if (dx > 0) {
            // Swipe right - go to previous image
            setCurrentImageIndex((prevIndex) => 
              prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
            );
          } else {
            // Swipe left - go to next image
            setCurrentImageIndex((prevIndex) => 
              prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
            );
          }
        }
      },
    })
  ).current;

  if (!data) return <LoadingSkeleton type="listing" />;

  // Get images from listing data - only use real images
  const images = data.images || [
    data.image_url || '',
  ].filter(img => img); // Filter out empty strings

  // Helper functions for button navigation
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
    <ErrorBoundary>
      <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageGallery}>
        <View style={styles.imageContainer} {...panResponder.panHandlers}>
          <Image 
            source={{ uri: images[currentImageIndex] }} 
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Image Navigation Buttons */}
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
              {images.map((_: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.activeDot
                  ]}
                />
              ))}
            </View>
            
            {/* Swipe Indicator */}
            <View style={styles.swipeIndicator}>
              <Text style={styles.swipeText}>← Fotoğraflar arasında kaydırın →</Text>
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
          {images.map((imageUri: string, index: number) => (
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

        {/* Seller Information - Lazy loaded */}
        {loadSeller && data ? (
          <>
            <Text style={styles.sectionTitle}>Satıcı Bilgileri</Text>
            <View style={styles.sellerContainer}>
              <View style={styles.sellerHeader}>
                <View style={styles.sellerInfo}>
                  {sellerInfo?.avatar_url && (
                    <Image source={{ uri: sellerInfo.avatar_url }} style={styles.sellerAvatar} />
                  )}
                  <View style={styles.sellerDetails}>
                    <Text style={styles.sellerName}>
                      {sellerInfo?.display_name || `${sellerInfo?.first_name} ${sellerInfo?.last_name}` || data.seller_name || "İsimsiz Satıcı"}
                    </Text>
                    {sellerInfo?.city && (
                      <Text style={styles.sellerLocation}>{sellerInfo.city}</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : data && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Satıcı bilgileri yükleniyor...</Text>
          </View>
        )}

        {/* Always show rating display separately when seller_id exists */}
        {data?.seller_id && (
          <View style={styles.sellerRatingContainer}>
            <View style={styles.ratingHeader}>
              <Text style={styles.sectionTitle}>Satıcı Değerlendirmeleri</Text>
              {user && data.seller_id && user.id !== data.seller_id && (
                <Pressable 
                  style={styles.rateSellerButton}
                  onPress={() => setShowRatingModal(true)}
                >
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rateSellerText}>Değerlendir</Text>
                </Pressable>
              )}
            </View>
            <UserRatingDisplay 
              userId={data.seller_id}
              compact={false}
              showRecentReviews={true}
            />
          </View>
        )}

        {/* Bidding Section - Load lazily */}
        {loadBids ? (
          <>
            {isLoading ? (
              <LoadingSkeleton type="bids" />
            ) : bids && bids.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Teklifler ({bids.length})</Text>
                <View style={styles.bidsContainer}>
                  {bids.slice(0, 3).map((bid, index) => (
                    <View key={bid.id} style={styles.bidItem}>
                      <View style={styles.bidHeader}>
                        <Text style={styles.bidAmount}>{bid.amount} TL</Text>
                        <View style={[
                          styles.bidStatus,
                          { backgroundColor: 
                            bid.status === 'accepted' ? '#4CAF50' :
                            bid.status === 'rejected' ? '#F44336' :
                            bid.status === 'countered' ? '#FF9800' : '#9E9E9E'
                          }
                        ]}>
                          <Text style={styles.bidStatusText}>
                            {bid.status === 'pending' ? 'Bekliyor' :
                             bid.status === 'accepted' ? 'Kabul' :
                             bid.status === 'rejected' ? 'Red' : 'Karşı Teklif'}
                          </Text>
                        </View>
                      </View>
                      {bid.message && (
                        <Text style={styles.bidMessage} numberOfLines={2}>
                          "{bid.message}"
                        </Text>
                      )}
                      <Text style={styles.bidDate}>
                        {new Date(bid.created_at).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  ))}
                  {bids.length > 3 && (
                    <Text style={styles.moreBidsText}>
                      +{bids.length - 3} teklif daha
                    </Text>
                  )}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <LoadingSkeleton type="bids" />
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.messageButton}>
          <MaterialIcons name="chat" size={20} color="white" />
          <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
        </Pressable>
        <Pressable 
          style={[
            styles.offerButton,
            !isAuthenticated && styles.disabledButton
          ]}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Giriş Gerekli', 'Teklif vermek için önce giriş yapmalısınız.');
              return;
            }
            setShowBiddingModal(true);
          }}
        >
          <MaterialIcons name="local-offer" size={20} color="white" />
          <Text style={styles.offerButtonText}>
            {isAuthenticated ? 'Teklif Ver' : 'Giriş Yap'}
          </Text>
        </Pressable>
      </View>

      {/* Bidding Modal */}
      <BiddingModal
        visible={showBiddingModal}
        onClose={() => setShowBiddingModal(false)}
        listingId={id!}
        listingTitle={data.title}
        currentPrice={data.price || 0}
        onBidSubmitted={refetchBids}
      />

      {/* Rating Modal - Fully functional */}
      {data?.seller_id && (
        <RatingModal
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          reviewedUserId={data.seller_id}
          listingId={id!}
          transactionType="seller"
          reviewedUserName={sellerInfo?.display_name || `${sellerInfo?.first_name} ${sellerInfo?.last_name}` || data.seller_name || "Satıcı"}
          onSuccess={() => {
            console.log('Rating submitted successfully');
            // Refresh rating data - no need to reload everything
          }}
        />
      )}
    </ScrollView>
    </ErrorBoundary>
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
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
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
  swipeIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 12,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
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
    borderRadius: 16,
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
    borderRadius: 16,
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
  // Bidding styles
  bidsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  bidItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  bidStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  bidStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  bidMessage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  bidDate: {
    fontSize: 12,
    color: '#999',
  },
  moreBidsText: {
    fontSize: 14,
    color: '#00d4aa',
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Seller styles
  sellerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e9ecef',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sellerLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  rateSellerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 4,
  },
  rateSellerText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  sellerRatingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
