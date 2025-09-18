import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useListings } from "../../src/services/listings";
import { useNotifications } from "../../src/services/notifications";
import { Header } from "../../src/components/modern/Header";
import { CategoryFilter } from "../../src/components/modern/CategoryFilter";
import { ProductCard, Product } from "../../src/components/modern/ProductCard";
import { FILTER_CATEGORIES } from "../../src/constants/categories";

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useListings();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Categories for filtering
  const categories = FILTER_CATEGORIES;

  // Convert your listings data to Product format
  const convertToProducts = (listings: any[]): Product[] => {
    return listings.map(listingItem => ({
      id: listingItem.id,
      title: listingItem.title,
      price: listingItem.price,
      currency: listingItem.currency || 'TL',
      image_url: listingItem.image_url || '',
      category: listingItem.category,
      seller_name: listingItem.seller_name || 'İsimsiz Kullanıcı',
      location: listingItem.location || 'İstanbul',
      created_at: listingItem.created_at || new Date().toISOString(),
      isNew: isNewListing(listingItem.created_at),
      isSale: !!listingItem.price,
    }));
  };

  const isNewListing = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
    return diffInDays <= 7; // Consider new if less than 7 days old
  };

  // Filter data based on search query and category
  const filteredData = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => {
        const itemCategory = item.category?.toLowerCase() || '';
        const selectedCat = selectedCategory.toLowerCase();
        return itemCategory.includes(selectedCat) || selectedCat.includes(itemCategory);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    return convertToProducts(filtered);
  }, [data, selectedCategory, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddToCart = (product: Product) => {
    // Navigate to listing detail or handle offer
    router.push(`/listing/${product.id}`);
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleProductPress = (product: Product) => {
    console.log('🔥 Card tapped:', product.id);
    try {
      router.push(`/listing/${product.id}`);
      console.log('🔥 Navigation initiated to:', `/listing/${product.id}`);
    } catch (error) {
      console.error('🔥 Navigation error:', error);
    }
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleCartClick = () => {
    router.push('/tekliflerim');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Bir hata oluştu</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        notificationCount={unreadCount || 0}
        cartItemCount={0} // Could be implemented for shopping cart
        onCartClick={handleCartClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNotificationPress={handleNotificationPress}
        onFavoritesPress={() => router.push('/favorites')}
      />

      <View style={styles.content}>
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredData.length} ilan bulundu
            {searchQuery && ` "${searchQuery}" için`}
            {selectedCategory !== 'All' && ` ${selectedCategory} kategorisinde`}
          </Text>
        </View>

        {/* Products Grid */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Henüz ilan yok</Text>
            <Text style={styles.emptySubtitle}>
              Arama kriterlerinizi değiştirmeyi deneyin
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(item.id)}
                onPress={handleProductPress}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={6}
            windowSize={10}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});