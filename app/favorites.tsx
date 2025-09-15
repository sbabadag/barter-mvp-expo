import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from "../src/services/favorites";
import { useListings } from "../src/services/listings";
import { useAuthService } from "../src/services/auth";
import { ProductCard, Product } from "../src/components/modern/ProductCard";
import { useToggleFavorite } from "../src/services/favorites";

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuthService();
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites(user?.id);
  const { data: allListings = [], isLoading: listingsLoading } = useListings();
  const toggleFavorite = useToggleFavorite();

  // Filter listings to only show favorited ones
  const favoriteListings = allListings.filter(listing => 
    favorites.some((fav: any) => fav.listing_id === listing.id)
  );

  // Convert to Product format
  const convertToProducts = (listings: any[]): Product[] => {
    return listings.map(listingItem => ({
      id: listingItem.id,
      title: listingItem.title,
      price: listingItem.price,
      currency: listingItem.currency,
      image_url: listingItem.image_url || listingItem.images?.[0],
      seller_name: listingItem.seller_name || (listingItem.profiles?.[0]?.display_name) || ('user' + listingItem.id.slice(-2)),
      seller_avatar: listingItem.seller_avatar || (listingItem.profiles?.[0]?.avatar_url) || '',
      location: listingItem.location,
      category: listingItem.category,
      condition: listingItem.condition,
      created_at: listingItem.created_at,
      isNew: listingItem.condition === 'new',
      isSale: !!listingItem.price,
    }));
  };

  const products = convertToProducts(favoriteListings);

  const handleToggleFavorite = async (productId: string) => {
    if (!user?.id) return;

    try {
      await toggleFavorite.mutateAsync({
        userId: user.id,
        listingId: productId,
        isCurrentlyFavorited: true, // We know it's favorited since we're on favorites screen
      });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/listing/${product.id}`);
  };

  if (favoritesLoading || listingsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Giriş Yapın</Text>
          <Text style={styles.emptySubtitle}>
            Favorilerinizi görmek için giriş yapmanız gerekiyor.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Favorilerim</Text>
          <Text style={styles.subtitle}>{favorites.length} favori</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Henüz favoriniz yok</Text>
          <Text style={styles.emptySubtitle}>
            Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Favorilerim</Text>
        <Text style={styles.subtitle}>{products.length} favori ürün</Text>
      </View>
      
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ProductCard
              product={item}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={true} // All items here are favorited
              onPress={handleProductPress}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    margin: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});