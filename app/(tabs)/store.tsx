import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions, Pressable, Alert, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../src/utils/supabase";
import ListingCard from "../../src/components/ListingCard";
import { HapticService } from "../../src/services/haptics";

const { width } = Dimensions.get('window');

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  location: string;
  images: string[];
  created_at: string;
  seller_id: string;
  status: 'active' | 'sold' | 'inactive';
  profiles?: {
    display_name: string;
    avatar_url?: string;
    phone?: string;
  };
}

export default function StoreScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // Kullanıcının ilanlarını getir
  const { data: myListings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-listings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Önce sadece listings verilerini al
      const { data: listingsData, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('İlanlar alınırken hata:', error);
        throw error;
      }

      // Eğer profile bilgisine ihtiyaç varsa ayrı olarak al
      if (listingsData && listingsData.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, phone')
          .eq('id', user.id)
          .single();

        // Profile bilgisini her ilana ekle
        return listingsData.map(listing => ({
          ...listing,
          profiles: profileData ? {
            display_name: profileData.display_name,
            avatar_url: profileData.avatar_url,
            phone: profileData.phone
          } : undefined
        }));
      }

      return listingsData || [];
    },
    enabled: !!user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    HapticService.light();
    await refetch();
    setRefreshing(false);
  };

  const handleAddListing = () => {
    HapticService.light();
    router.push('/sell');
  };

  const handleEditListing = (listingId: string) => {
    HapticService.light();
    // Düzenleme sayfasına yönlendir
    Alert.alert('Bilgi', 'İlan düzenleme özelliği yakında gelecek!');
  };

  const handleDeleteListing = async (listingId: string) => {
    HapticService.warning();
    Alert.alert(
      'İlanı Sil',
      'Bu ilanı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId)
                .eq('seller_id', user?.id);

              if (error) throw error;

              HapticService.success();
              refetch();
            } catch (error) {
              console.error('İlan silinirken hata:', error);
              HapticService.error();
              Alert.alert('Hata', 'İlan silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const toggleListingStatus = async (listingId: string, currentStatus: string) => {
    HapticService.light();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      HapticService.success();
      refetch();
    } catch (error) {
      console.error('İlan durumu değiştirilirken hata:', error);
      HapticService.error();
      Alert.alert('Hata', 'İlan durumu değiştirilirken bir hata oluştu.');
    }
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <View style={styles.listingContainer}>
      <ListingCard
        listing={item}
        onPress={() => router.push(`/listing/${item.id}`)}
      />
      
      {/* İlan yönetim butonları */}
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: item.status === 'active' ? '#ff6b6b' : '#4ecdc4' }]}
          onPress={() => toggleListingStatus(item.id, item.status)}
        >
          <MaterialIcons 
            name={item.status === 'active' ? 'visibility-off' : 'visibility'} 
            size={16} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {item.status === 'active' ? 'Gizle' : 'Aktif Et'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: '#ffa726' }]}
          onPress={() => handleEditListing(item.id)}
        >
          <MaterialIcons name="edit" size={16} color="white" />
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: '#ef5350' }]}
          onPress={() => handleDeleteListing(item.id)}
        >
          <MaterialIcons name="delete" size={16} color="white" />
          <Text style={styles.actionButtonText}>Sil</Text>
        </Pressable>
      </View>

      {/* İlan durumu */}
      <View style={[styles.statusBadge, { 
        backgroundColor: item.status === 'active' ? '#4caf50' : 
                        item.status === 'sold' ? '#2196f3' : '#9e9e9e' 
      }]}>
        <Text style={styles.statusText}>
          {item.status === 'active' ? 'Aktif' : 
           item.status === 'sold' ? 'Satıldı' : 'Pasif'}
        </Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f0a500" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="store" size={28} color="#f0a500" />
          <Text style={styles.headerTitle}>Mağazam</Text>
        </View>
        <Pressable style={styles.addButton} onPress={handleAddListing}>
          <MaterialIcons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{myListings.length}</Text>
          <Text style={styles.statLabel}>Toplam İlan</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {myListings.filter((listing: Listing) => listing.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Aktif İlan</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {myListings.filter((listing: Listing) => listing.status === 'sold').length}
          </Text>
          <Text style={styles.statLabel}>Satılan</Text>
        </View>
      </View>

      {/* İlan listesi */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f0a500" />
          <Text style={styles.loadingText}>İlanlarınız yükleniyor...</Text>
        </View>
      ) : myListings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="store" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz hiç ilanınız yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk ilanınızı vererek komşularınızla eşya paylaşımına başlayın!
          </Text>
          <Pressable style={styles.emptyButton} onPress={handleAddListing}>
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.emptyButtonText}>İlk İlanımı Ver</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={myListings}
          keyExtractor={(item) => item.id}
          renderItem={renderListingItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f0a500']}
              tintColor="#f0a500"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 12,
  },
  addButton: {
    backgroundColor: '#f0a500',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0a500',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  listingContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0a500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
