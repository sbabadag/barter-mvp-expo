import { View, Text, Pressable, Image, StyleSheet, Dimensions, TextInput, ScrollView, SafeAreaView, Platform } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useListings } from "../../src/services/listings";
import CommentsModal from "../../src/components/CommentsModal";
import { DepopCard } from "../../src/components/DepopCard";
import { DepopTheme, DepopLayout } from "../../src/styles/DepopTheme";
import { Link, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useNotificationCounts } from "../../src/services/notifications";
import NotificationBadge from "../../src/components/NotificationBadge";
import { FILTER_CATEGORIES } from "../../src/constants/categories";

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useListings();
  const { data: notificationCounts } = useNotificationCounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [likedItems, setLikedItems] = useState<{[key: string]: boolean}>({});
  const [likeCounts, setLikeCounts] = useState<{[key: string]: number}>({});
  const [updateKey, setUpdateKey] = useState(Date.now());
  const [commentsModal, setCommentsModal] = useState<{visible: boolean, listingId: string, listingTitle: string}>({
    visible: false,
    listingId: '',
    listingTitle: ''
  });

  // Categories for filtering
  const categories = FILTER_CATEGORIES;

  // Filter data based on search query and category
  const filteredData = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Filter by category
    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Giyim' && (!item.category || item.category.toLowerCase().includes('dress') || item.category.toLowerCase().includes('giyim'))) ||
        (selectedCategory === 'Aksesuar' && item.category?.toLowerCase().includes('aksesuar')) ||
        (selectedCategory === 'Ayakkabı' && item.category?.toLowerCase().includes('ayakkabı')) ||
        (selectedCategory === 'Çanta' && item.category?.toLowerCase().includes('çanta')) ||
        (selectedCategory === 'Elektronik' && item.category?.toLowerCase().includes('elektronik')) ||
        (selectedCategory === 'Ev & Yaşam' && item.category?.toLowerCase().includes('ev')) ||
        (selectedCategory === 'Spor' && item.category?.toLowerCase().includes('spor')) ||
        (selectedCategory === 'Kitap' && item.category?.toLowerCase().includes('kitap'))
      );
    }

    // Filter by search query (searches through title, description, seller name, and category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.seller_name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        // Also search in auto-generated seller names
        (item.id.includes('mock_1') && 'solo'.includes(query)) ||
        (item.id.includes('mock_2') && '3dmake'.includes(query)) ||
        (item.id.includes('mock_3') && 'solo'.includes(query)) ||
        (item.id.includes('mock_4') && 'emirfashionn'.includes(query)) ||
        (item.id.includes('user_') && 'sen'.includes(query))
      );
    }

    return filtered;
  }, [data, searchQuery, selectedCategory]);

  const handleLike = (itemId: string) => {
    console.log('Like button pressed for item:', itemId);
    
    setLikedItems(prevLikedItems => {
      const currentState = prevLikedItems[itemId] || false;
      const newState = !currentState;
      
      console.log(`Toggle for ${itemId}: ${currentState} -> ${newState}`);
      
      const updatedItems = { ...prevLikedItems, [itemId]: newState };
      console.log('Updated liked items:', updatedItems);
      
      return updatedItems;
    });
    
    setLikeCounts(prevCounts => {
      const currentCount = prevCounts[itemId] || 5;
      const currentLikedState = likedItems[itemId] || false;
      const newCount = !currentLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);
      
      return { ...prevCounts, [itemId]: newCount };
    });
    
    setUpdateKey(Date.now());
  };

  const handleComment = (itemId: string, itemTitle: string) => {
    console.log('Opening comments for item:', itemId);
    setCommentsModal({
      visible: true,
      listingId: itemId,
      listingTitle: itemTitle
    });
  };

  const closeCommentsModal = () => {
    setCommentsModal({
      visible: false,
      listingId: '',
      listingTitle: ''
    });
  };

  const handleFollow = (sellerId: string) => {
    // Follow functionality - could connect to backend
    console.log('Following seller:', sellerId);
  };

  const handleCardPress = (itemId: string) => {
    console.log('Navigating to listing detail:', itemId);
    router.push(`/listing/${itemId}`);
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    // Group items in pairs for 2-column grid layout
    if (index % 2 !== 0) return null; // Only render on even indices
    
    const currentItem = item;
    const nextItem = filteredData?.[index + 1];
    
    // Map current item to DepopCard format
    const mapToDepopItem = (listingItem: any) => ({
      id: listingItem.id,
      title: listingItem.title,
      price: listingItem.price ? `${listingItem.price} ${listingItem.currency || 'TL'}` : 'Takas',
      seller: listingItem.seller_name || 
        (listingItem.id.includes('mock_1') ? 'solo' :
         listingItem.id.includes('mock_2') ? '3dmake' :
         listingItem.id.includes('mock_3') ? 'solo' :
         listingItem.id.includes('mock_4') ? 'emirfashionn' :
         listingItem.id.includes('user_') ? 'Sen' :
         'user' + listingItem.id.slice(-2)),
      image_url: listingItem.image_url || `https://picsum.photos/300/400?random=${listingItem.id}`,
      liked: likedItems[listingItem.id] || false,
    });
    
    return (
      <View style={styles.row}>
        {/* First Card */}
        <DepopCard
          item={mapToDepopItem(currentItem)}
          onPress={() => handleCardPress(currentItem.id)}
          onLike={() => handleLike(currentItem.id)}
        />
        
        {/* Second Card */}
        {nextItem && (
          <DepopCard
            item={mapToDepopItem(nextItem)}
            onPress={() => handleCardPress(nextItem.id)}
            onLike={() => handleLike(nextItem.id)}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Keşfet</Text>
      
      {/* Search Section */}
      <View style={styles.searchSection}>
        {/* Search Input with Notification */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ürün, satıcı veya kategori ara..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </Pressable>
            )}
          </View>
          
          {/* Notification Icon with Badge */}
          <Pressable 
            style={styles.notificationButton}
            onPress={() => router.push('/tekliflerim')}
          >
            <View style={styles.notificationContainer}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
              <NotificationBadge 
                count={notificationCounts?.total || 0} 
                size="small"
                color="#f0a500"
              />
            </View>
          </Pressable>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results Count */}
        {(searchQuery.trim() || selectedCategory !== 'Tümü') && (
          <Text style={styles.resultsCount}>
            {filteredData?.length || 0} sonuç bulundu
          </Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>Yükleniyor…</Text>
        </View>
      ) : (
        <FlashList
          estimatedItemSize={200}
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          extraData={[likedItems, likeCounts, updateKey]}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          numColumns={1}
        />
      )}
      
      <CommentsModal
        visible={commentsModal.visible}
        onClose={closeCommentsModal}
        listingId={commentsModal.listingId}
        listingTitle={commentsModal.listingTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DepopTheme.colors.background,
    paddingHorizontal: DepopLayout.screenPadding,
    // Web için responsive tasarım
    ...(Platform.OS === 'web' && {
      maxWidth: 480, // Mobil app genişliği simülasyonu
      alignSelf: 'center',
      width: '100%',
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#e1e1e1',
      backgroundColor: '#ffffff',
    }),
  },
  header: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 20,
    marginTop: 10,
    color: DepopTheme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 16,
    color: DepopTheme.colors.text.secondary,
    textAlign: 'center' as const,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    width: '48%', // Each card takes 48% of the row
    backgroundColor: 'white',
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8, // Add margin to separate from follow button
    overflow: 'hidden', // Prevent overflow
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  sellerDetails: {
    flex: 1,
    minWidth: 0, // Allow shrinking
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow shrinking if needed
  },
  stars: {
    fontSize: 10,
    marginRight: 4,
    flexShrink: 0, // Don't shrink stars
  },
  ratingCount: {
    fontSize: 11,
    color: '#666',
    flexShrink: 1, // Allow count to shrink if needed
  },
  followButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // Don't shrink follow button
  },
  followButtonText: {
    fontSize: 10,
    color: 'white',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f8f8',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 4,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#999',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  commentCount: {
    fontSize: 12,
    color: '#999',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DepopLayout.cardSpacing,
  },
  // Search Section Styles
  searchSection: {
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DepopTheme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: DepopTheme.colors.border,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: DepopTheme.colors.surface,
    borderWidth: 1,
    borderColor: DepopTheme.colors.border,
  },
  notificationContainer: {
    position: 'relative',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: DepopTheme.colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryContainer: {
    paddingHorizontal: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: DepopTheme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DepopTheme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: DepopTheme.colors.primary,
    borderColor: DepopTheme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: DepopTheme.colors.text.secondary,
    fontWeight: '500' as const,
  },
  categoryChipTextActive: {
    color: DepopTheme.colors.background,
    fontWeight: '600' as const,
  },
  resultsCount: {
    fontSize: 14,
    color: DepopTheme.colors.text.secondary,
    marginLeft: 4,
    fontStyle: 'italic' as const,
  },
});
