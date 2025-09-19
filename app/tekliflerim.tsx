import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import {
  useMyOffers,
  useReceivedOffers,
  useOfferStats,
  useRespondToOffer,
  useWithdrawOffer,
  MyOffer,
  ReceivedOffer
} from '../src/services/tekliflerim';
import { supabaseConfig } from '../src/utils/supabase';

const { width } = Dimensions.get('window');

type TabType = 'made' | 'received' | 'stats';

export default function TekliflerimScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('made');
  const [refreshing, setRefreshing] = useState(false);

  const { data: myOffers = [], isLoading: loadingMade, refetch: refetchMade } = useMyOffers();
  const { data: receivedOffers = [], isLoading: loadingReceived, refetch: refetchReceived } = useReceivedOffers();
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useOfferStats();
  
  const respondToOfferMutation = useRespondToOffer();
  const withdrawOfferMutation = useWithdrawOffer();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMade(), refetchReceived(), refetchStats()]);
    setRefreshing(false);
  };

  const handleRespondToOffer = (offerId: string, action: 'accept' | 'reject' | 'counter') => {
    if (action === 'counter') {
      // For demo, show a simple alert. In real app, show counter offer modal
      Alert.alert(
        'Karşı Teklif',
        'Karşı teklif özelliği yakında gelecek!',
        [{ text: 'Tamam' }]
      );
      return;
    }

    const message = action === 'accept' 
      ? 'Bu teklifi kabul etmek istiyor musunuz?'
      : 'Bu teklifi reddetmek istiyor musunuz?';

    Alert.alert(
      action === 'accept' ? 'Teklifi Kabul Et' : 'Teklifi Reddet',
      message,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: action === 'accept' ? 'Kabul Et' : 'Reddet',
          style: action === 'accept' ? 'default' : 'destructive',
          onPress: () => {
            respondToOfferMutation.mutate({ offerId, action });
          }
        }
      ]
    );
  };

  const handleWithdrawOffer = (offerId: string) => {
    Alert.alert(
      'Teklifi Geri Çek',
      'Bu teklifi geri çekmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Geri Çek',
          style: 'destructive',
          onPress: () => {
            withdrawOfferMutation.mutate(offerId);
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f0a500';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#f44336';
      case 'countered': return '#2196F3';
      case 'expired': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusText = (status: string, isMyOffer = false) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'accepted': return 'Kabul Edildi';
      case 'rejected': 
        // Kendi teklifimizse "Geri Çekildi", başkasının teklifiyse "Reddedildi"
        return isMyOffer ? 'Geri Çekildi' : 'Reddedildi';
      case 'countered': return 'Karşı Teklif';
      case 'expired': return 'Süresi Doldu';
      default: return status;
    }
  };

  const renderMyOfferCard = (offer: MyOffer) => (
    <View key={offer.id} style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Image source={{ uri: offer.listing_image }} style={styles.offerImage} />
        <View style={styles.offerInfo}>
          <Text style={styles.offerTitle} numberOfLines={2}>
            {offer.listing_title}
          </Text>
          <Text style={styles.offerLocation}>{offer.listing_location}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.listingPrice}>İlan: ₺{offer.listing_price}</Text>
            <Text style={styles.offerAmount}>Teklifim: ₺{offer.amount}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) }]}>
            <Text style={styles.statusText}>{getStatusText(offer.status, true)}</Text>
          </View>
          {offer.time_left && !offer.is_expired && (
            <Text style={styles.timeLeft}>{offer.time_left}</Text>
          )}
        </View>
      </View>

      {offer.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Mesajım:</Text>
          <Text style={styles.messageText}>{offer.message}</Text>
        </View>
      )}

      {offer.status === 'countered' && offer.counter_offer_amount && (
        <View style={styles.counterOfferContainer}>
          <Text style={styles.counterOfferLabel}>Karşı Teklif: ₺{offer.counter_offer_amount}</Text>
          {offer.counter_offer_message && (
            <Text style={styles.counterOfferMessage}>{offer.counter_offer_message}</Text>
          )}
        </View>
      )}

      <View style={styles.offerActions}>
        <View style={styles.sellerInfo}>
          <Image source={{ uri: offer.seller_avatar || 'https://i.pravatar.cc/40' }} style={styles.sellerAvatar} />
          <Text style={styles.sellerName}>{offer.seller_name}</Text>
          {offer.seller_rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#f0a500" />
              <Text style={styles.ratingText}>{offer.seller_rating}</Text>
            </View>
          )}
        </View>
        
        {offer.status === 'pending' && (
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={() => handleWithdrawOffer(offer.id)}
          >
            <Text style={styles.withdrawButtonText}>Geri Çek</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderReceivedOfferCard = (offer: ReceivedOffer) => (
    <View key={offer.id} style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Image source={{ uri: offer.listing_image }} style={styles.offerImage} />
        <View style={styles.offerInfo}>
          <Text style={styles.offerTitle} numberOfLines={2}>
            {offer.listing_title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.listingPrice}>İlan: ₺{offer.listing_price}</Text>
            <Text style={styles.offerAmount}>Teklif: ₺{offer.amount}</Text>
          </View>
          {offer.price_difference !== undefined && (
            <Text style={[
              styles.priceDifference,
              { color: offer.price_difference >= 0 ? '#4CAF50' : '#f44336' }
            ]}>
              {offer.price_difference >= 0 ? '+' : ''}₺{offer.price_difference} 
              ({offer.price_difference_percentage}%)
            </Text>
          )}
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) }]}>
            <Text style={styles.statusText}>{getStatusText(offer.status, false)}</Text>
          </View>
          {offer.time_left && !offer.is_expired && (
            <Text style={styles.timeLeft}>{offer.time_left}</Text>
          )}
        </View>
      </View>

      {offer.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Mesaj:</Text>
          <Text style={styles.messageText}>{offer.message}</Text>
        </View>
      )}

      <View style={styles.offerActions}>
        <View style={styles.bidderInfo}>
          <Image source={{ uri: offer.bidder_avatar || 'https://i.pravatar.cc/40' }} style={styles.sellerAvatar} />
          <Text style={styles.sellerName}>{offer.bidder_name}</Text>
          {offer.bidder_rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#f0a500" />
              <Text style={styles.ratingText}>{offer.bidder_rating}</Text>
            </View>
          )}
        </View>
        
        {offer.status === 'pending' && (
          <View style={styles.responseButtons}>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleRespondToOffer(offer.id, 'reject')}
            >
              <Text style={styles.rejectButtonText}>Reddet</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.counterButton}
              onPress={() => handleRespondToOffer(offer.id, 'counter')}
            >
              <Text style={styles.counterButtonText}>Karşı Teklif</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleRespondToOffer(offer.id, 'accept')}
            >
              <Text style={styles.acceptButtonText}>Kabul Et</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Teklif İstatistiklerim</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_made}</Text>
            <Text style={styles.statLabel}>Verdiğim Teklifler</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_received}</Text>
            <Text style={styles.statLabel}>Aldığım Teklifler</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending_made}</Text>
            <Text style={styles.statLabel}>Bekleyen Tekliflerim</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending_received}</Text>
            <Text style={styles.statLabel}>Bekleyen Gelen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.accepted_made}</Text>
            <Text style={styles.statLabel}>Kabul Edilen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.success_rate}%</Text>
            <Text style={styles.statLabel}>Başarı Oranım</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tekliflerim</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'made' && styles.activeTab]}
          onPress={() => setActiveTab('made')}
        >
          <Text style={[styles.tabText, activeTab === 'made' && styles.activeTabText]}>
            Verdiğim ({myOffers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Aldığım ({receivedOffers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <MaterialIcons 
            name="bar-chart" 
            size={20} 
            color={activeTab === 'stats' ? '#f0a500' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'made' && (
          <View>
            {loadingMade ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            ) : myOffers.length > 0 ? (
              myOffers.map(renderMyOfferCard)
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="local-offer" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>Henüz teklif vermediniz</Text>
                <Text style={styles.emptyStateSubtext}>İlginizi çeken ürünlere teklif verin!</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'received' && (
          <View>
            {loadingReceived ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            ) : receivedOffers.length > 0 ? (
              receivedOffers.map(renderReceivedOfferCard)
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="inbox" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>Henüz teklif almadınız</Text>
                <Text style={styles.emptyStateSubtext}>Ürün ekleyin, teklifler gelsin!</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'stats' && (
          <View>
            {loadingStats ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            ) : (
              renderStatsCard()
          )}
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // Web responsive tasarımı
    ...(Platform.OS === 'web' && {
      maxWidth: 480,
      alignSelf: 'center',
      width: '100%',
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#e1e1e1',
      backgroundColor: '#ffffff',
    }),
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'left',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#f0a500',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#f0a500',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  offerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  offerLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingPrice: {
    fontSize: 14,
    color: '#666',
  },
  offerAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f0a500',
  },
  priceDifference: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  timeLeft: {
    fontSize: 11,
    color: '#666',
  },
  messageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  counterOfferContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  counterOfferLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 4,
  },
  counterOfferMessage: {
    fontSize: 14,
    color: '#333',
  },
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  withdrawButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f44336',
  },
  withdrawButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f44336',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  counterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2196F3',
  },
  counterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 64) / 2,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f0a500',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
});
