import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserBids, updateBidStatus, Bid } from '../services/bids';
import { useRouter } from 'expo-router';

export default function UserBidsScreen() {
  const { madeBids, isLoading, refetch } = useUserBids();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'countered': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'accepted': return 'Kabul Edildi';
      case 'rejected': return 'Reddedildi';
      case 'countered': return 'Karşı Teklif';
      default: return status;
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    Alert.alert(
      'Teklifi Geri Çek',
      'Bu teklifi geri çekmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Geri Çek',
          style: 'destructive',
          onPress: async () => {
            const result = await updateBidStatus(bidId, 'rejected');
            if (result.success) {
              refetch();
            } else {
              Alert.alert('Hata', result.error || 'Teklif geri çekilirken hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleAcceptCounter = async (bidId: string) => {
    const result = await updateBidStatus(bidId, 'accepted');
    if (result.success) {
      Alert.alert('Başarılı', 'Karşı teklif kabul edildi!');
      refetch();
    } else {
      Alert.alert('Hata', result.error || 'Karşı teklif kabul edilirken hata oluştu');
    }
  };

  const renderBidItem = ({ item }: { item: Bid }) => (
    <Pressable
      style={styles.bidCard}
      onPress={() => router.push(`/listing/${item.listing_id}`)}
    >
      <View style={styles.bidHeader}>
        <Image
          source={{ uri: `https://picsum.photos/100/100?random=${item.listing_id}` }}
          style={styles.listingImage}
        />
        <View style={styles.bidInfo}>
          <Text style={styles.listingTitle} numberOfLines={2}>
            Ürün #{item.listing_id}
          </Text>
          <Text style={styles.bidAmount}>{item.amount} TL</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>

      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Mesajınız:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}

      {item.counter_offer_amount && (
        <View style={styles.counterOfferContainer}>
          <Text style={styles.counterOfferLabel}>Karşı Teklif:</Text>
          <Text style={styles.counterOfferAmount}>{item.counter_offer_amount} TL</Text>
          {item.counter_offer_message && (
            <Text style={styles.counterOfferMessage}>{item.counter_offer_message}</Text>
          )}
        </View>
      )}

      <View style={styles.bidFooter}>
        <Text style={styles.bidDate}>
          {new Date(item.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        
        <View style={styles.actionButtons}>
          {item.status === 'pending' && (
            <Pressable
              style={styles.withdrawButton}
              onPress={() => handleWithdrawBid(item.id)}
            >
              <Text style={styles.withdrawButtonText}>Geri Çek</Text>
            </Pressable>
          )}
          
          {item.status === 'countered' && (
            <Pressable
              style={styles.acceptButton}
              onPress={() => handleAcceptCounter(item.id)}
            >
              <Text style={styles.acceptButtonText}>Kabul Et</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Teklifleriniz yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tekliflerim</Text>
        <Text style={styles.subtitle}>
          {madeBids.length} teklif
        </Text>
      </View>

      {madeBids.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="local-offer" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz teklif vermediniz</Text>
          <Text style={styles.emptySubtitle}>
            Beğendiğiniz ürünlere teklif vererek pazarlık yapabilirsiniz
          </Text>
          <Pressable
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Ürünlere Göz At</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={madeBids}
          renderItem={renderBidItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
  listContainer: {
    padding: 16,
  },
  bidCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  bidInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  counterOfferContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  counterOfferLabel: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
    fontWeight: '500',
  },
  counterOfferAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  counterOfferMessage: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  bidFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bidDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  withdrawButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  withdrawButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
