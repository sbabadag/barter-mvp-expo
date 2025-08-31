import { View, Text, Pressable, Image, StyleSheet, Dimensions, TextInput, ScrollView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useListings } from "../../src/services/listings";
import CommentsModal from "../../src/components/CommentsModal";
import { Link, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.48; // Each card takes 48% of screen width - much wider!

export default function FeedScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useListings();
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
  const categories = ['Tümü', 'Giyim', 'Aksesuar', 'Ayakkabı', 'Çanta', 'Elektronik', 'Ev & Yaşam', 'Spor', 'Kitap'];

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
    // Group items in pairs for custom 2-column layout
    if (index % 2 !== 0) return null; // Only render on even indices
    
    const currentItem = item;
    const nextItem = filteredData?.[index + 1];
    
    return (
      <View style={styles.row}>
        {/* First Card */}
        <CardItem key={`${currentItem.id}-${updateKey}-${likedItems[currentItem.id] || false}`} item={currentItem} />
        
        {/* Second Card */}
        {nextItem && <CardItem key={`${nextItem.id}-${updateKey}-${likedItems[nextItem.id] || false}`} item={nextItem} />}
      </View>
    );
  };

  const CardItem = ({ item }: { item: any }) => {
    const isLiked = likedItems[item.id] || false;
    const likeCount = likeCounts[item.id] || 5;
    const commentCount = Math.floor(Math.random() * 5);
    
    console.log(`🔄 Rendering CardItem ${item.id}: isLiked=${isLiked}, updateKey=${updateKey}`);
    
    // Additional debug: log the background color that should be applied
    const backgroundColor = isLiked ? '#FF0000' : '#EEEEEE';
    console.log(`🎨 ${item.id} should have background: ${backgroundColor}`);
    
    return (
      <View style={styles.card}>
        {/* Seller Info Header */}
        <View style={styles.sellerHeader}>
          <View style={styles.sellerInfo}>
            <Image 
              source={{ uri: `https://i.pravatar.cc/40?u=${item.id}` }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>
                {item.seller_name || 
                 (item.id.includes('mock_1') ? 'solo' :
                  item.id.includes('mock_2') ? '3dmake' :
                  item.id.includes('mock_3') ? 'solo' :
                  item.id.includes('mock_4') ? 'emirfashionn' :
                  item.id.includes('user_') ? 'Sen' :
                  'user' + item.id.slice(-2))}
              </Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                  <Text style={styles.ratingCount}>({Math.floor(Math.random() * 5000) + 100})</Text>
                </View>
                <Pressable 
                  style={styles.followButton}
                  onPress={() => handleFollow(item.id)}
                >
                  <Text style={styles.followButtonText}>👥+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Product Image with Badge */}
        <Pressable onPress={() => handleCardPress(item.id)}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.image_url || `https://picsum.photos/300/400?random=${item.id}` }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.badgeContainer}>
              <Text style={styles.badge}>Yeni &{'\n'}Etiketli</Text>
            </View>
          </View>

          {/* Product Details */}
          <View style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.category}>
              {item.category || 
               (item.title.toLowerCase().includes('dress') ? 'Giyim' :
                item.title.toLowerCase().includes('book') ? 'Edebiyat' :
                item.title.toLowerCase().includes('tech') ? 'Elektronik' : 'Diğer')}
            </Text>
            {item.location && (
              <Text style={styles.location}>📍 {item.location}</Text>
            )}
            <Text style={styles.price}>
              {item.price ? `${item.price} ${item.currency || 'TL'}` : 'Takas'}
            </Text>
          </View>
        </Pressable>
        
        {/* Interaction Row - Outside the navigation pressable */}
        <View style={styles.interactionRow}>
          <Pressable 
            style={styles.likeContainer}
            onPress={() => {
              console.log('Like pressed for:', item.id);
              handleLike(item.id);
            }}
          >
            <Text style={[styles.likeIcon, { color: isLiked ? '#FF0000' : '#CCCCCC', fontSize: 16 }]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.likeCount}>{likeCount} Beğeni</Text>
          </Pressable>
          
          <Pressable 
            style={styles.commentContainer}
            onPress={() => {
              console.log('Comment pressed for:', item.id);
              handleComment(item.id, item.title);
            }}
          >
            <Text style={styles.commentIcon}>💬</Text>
            <Text style={styles.commentCount}>{commentCount} Yorum</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Keşfet</Text>
      
      {/* Search Section */}
      <View style={styles.searchSection}>
        {/* Search Input */}
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
        <Text style={styles.loading}>Yükleniyor…</Text>
      ) : (
        <FlashList
          estimatedItemSize={300}
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          extraData={[likedItems, likeCounts, updateKey]}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
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
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
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
    marginBottom: 16,
  },
  // Search Section Styles
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryContainer: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
});
