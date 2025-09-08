import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions, Pressable, Alert, RefreshControl, ActivityIndicator, TextInput, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../src/utils/supabase";
import { HapticService } from "../../src/services/haptics";

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  listing_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_profile?: {
    display_name: string;
    avatar_url?: string;
  };
  listing?: {
    title: string;
    images: string[];
  };
}

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  listing_id: string;
  listing_title: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_sender: boolean;
}

export default function InboxScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const router = useRouter();

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // Kullanıcının sohbetlerini getir (offers tablosunu kullanarak)
  const { data: conversations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // Bids tablosundan sohbetleri al (offers yerine)
        const { data: bids, error } = await supabase
          .from('bids')
          .select(`
            id,
            listing_id,
            bidder_id,
            message,
            created_at,
            status,
            amount
          `)
          .eq('bidder_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Sohbetleri grupla
        const conversationsMap = new Map<string, Conversation>();

        for (const bid of bids || []) {
          // Her bid için listing bilgisini ayrı al
          const { data: listingData } = await supabase
            .from('listings')
            .select('title, images, seller_id')
            .eq('id', bid.listing_id)
            .single();

          if (!listingData) continue;

          const otherUserId = listingData.seller_id; // Bid'de bidder var, karşı taraf seller
          const conversationKey = `${bid.listing_id}-${otherUserId}`;

          if (!conversationsMap.has(conversationKey)) {
            // Diğer kullanıcının profilini al
            const { data: otherUserProfile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', otherUserId)
              .single();

            conversationsMap.set(conversationKey, {
              other_user_id: otherUserId,
              other_user_name: otherUserProfile?.display_name || 'Anonim Kullanıcı',
              other_user_avatar: otherUserProfile?.avatar_url,
              listing_id: bid.listing_id,
              listing_title: listingData.title,
              last_message: bid.message || `${bid.amount}₺ teklif yaptınız`,
              last_message_time: bid.created_at,
              unread_count: 0, // Şimdilik 0
              is_sender: true // Bid yapan kişiyiz
            });
          }
        }

        return Array.from(conversationsMap.values());
      } catch (error) {
        console.error('Sohbetler alınırken hata:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    HapticService.light();
    await refetch();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    HapticService.light();
    // Sohbet detay sayfasına git
    router.push(`/chat/${conversation.other_user_id}?listing=${conversation.listing_id}`);
  };

  const handleNewMessage = () => {
    HapticService.light();
    setShowNewMessageModal(true);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <Pressable 
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatarContainer}>
        {item.other_user_avatar ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.other_user_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        ) : (
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={24} color="#999" />
          </View>
        )}
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.other_user_name}
          </Text>
          <Text style={styles.timeText}>
            {new Date(item.last_message_time).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short'
            })}
          </Text>
        </View>

        <Text style={styles.listingTitle} numberOfLines={1}>
          📦 {item.listing_title}
        </Text>

        <Text style={[
          styles.lastMessage,
          item.unread_count > 0 && styles.unreadMessage
        ]} numberOfLines={2}>
          {item.last_message}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} color="#ccc" />
    </Pressable>
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
          <MaterialIcons name="chat" size={28} color="#f0a500" />
          <Text style={styles.headerTitle}>Mesajlar</Text>
        </View>
        <Pressable style={styles.newMessageButton} onPress={handleNewMessage}>
          <MaterialIcons name="edit" size={20} color="white" />
        </Pressable>
      </View>

      {/* Sohbet listesi */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f0a500" />
          <Text style={styles.loadingText}>Sohbetleriniz yükleniyor...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz hiç mesajınız yok</Text>
          <Text style={styles.emptySubtitle}>
            İlanlardan teklif yaparak veya size teklif geldiğinde sohbetler burada görünecek
          </Text>
          <Pressable style={styles.emptyButton} onPress={() => router.push('/')}>
            <MaterialIcons name="explore" size={20} color="white" />
            <Text style={styles.emptyButtonText}>İlanları Keşfet</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => `${item.listing_id}-${item.other_user_id}`}
          renderItem={renderConversationItem}
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
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Yeni mesaj modal'ı */}
      <Modal
        visible={showNewMessageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewMessageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowNewMessageModal(false)}>
              <Text style={styles.modalCancelButton}>İptal</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Yeni Mesaj</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalInfo}>
              Yeni mesaj göndermek için önce bir ilana teklif yapmalısınız.
            </Text>
            <Pressable 
              style={styles.modalButton}
              onPress={() => {
                setShowNewMessageModal(false);
                router.push('/');
              }}
            >
              <Text style={styles.modalButtonText}>İlanları Görüntüle</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  newMessageButton: {
    backgroundColor: '#f0a500',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 0,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f0a500',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#6c757d',
  },
  listingTitle: {
    fontSize: 12,
    color: '#f0a500',
    marginBottom: 4,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  separator: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginLeft: 82,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#f0a500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalInfo: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  modalButton: {
    backgroundColor: '#f0a500',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
