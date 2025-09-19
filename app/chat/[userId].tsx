import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../src/utils/supabase";
import { HapticService } from "../../src/services/haptics";

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  is_own: boolean;
  sender_name: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { userId, listing } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [listingInfo, setListingInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Mevcut kullanıcıyı al
      const { data: currentUserData } = await supabase.auth.getUser();
      setCurrentUser(currentUserData.user);

      // Diğer kullanıcının bilgilerini al
      const { data: otherUserData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .single();
      
      setOtherUser(otherUserData);

      // İlan bilgilerini al
      if (listing) {
        const { data: listingData } = await supabase
          .from('listings')
          .select('title, images, price')
          .eq('id', listing)
          .single();
        
        setListingInfo(listingData);
      }

      // Bids tablosundan mesajları al - FIXED: Properly fetch conversation between two users
      if (currentUserData.user && listing) {
        await loadMessages(currentUserData.user.id, otherUserData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Chat yüklenirken hata:', error);
      setIsLoading(false);
    }
  };

  const loadMessages = async (currentUserId: string, otherUserData: any) => {
    try {
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          id,
          message,
          created_at,
          bidder_id,
          status,
          amount
        `)
        .eq('listing_id', listing)
        .order('created_at', { ascending: true });

      if (bidsData) {
        // Filter to only include messages/bids between the two users in this conversation
        const conversationBids = bidsData.filter(bid => 
          bid.bidder_id === currentUserId || bid.bidder_id === userId
        );

        const chatMessages: ChatMessage[] = conversationBids.map(bid => ({
          id: bid.id,
          content: bid.message || `${bid.amount}₺ teklif yapıldı`,
          created_at: bid.created_at,
          is_own: bid.bidder_id === currentUserId,
          sender_name: bid.bidder_id === currentUserId ? 'Sen' : otherUserData?.display_name || 'Kullanıcı'
        }));

        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !listing) {
      Alert.alert('Hata', 'Mesaj boş olamaz');
      return;
    }

    // Double-check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      Alert.alert(
        'Oturum Hatası', 
        'Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.',
        [
          { text: 'Tamam', onPress: () => router.push('/profile') }
        ]
      );
      return;
    }

    try {
      HapticService.light();

      // Yeni bid olarak mesaj gönder
      const { data, error } = await supabase
        .from('bids')
        .insert({
          listing_id: listing,
          bidder_id: user.id, // Use freshly verified user ID
          message: newMessage.trim(),
          amount: 0, // Mesaj için 0 tutar
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Mesaj gönderilirken hata:', error);
        
        if (error.code === '42501') {
          Alert.alert(
            'İzin Hatası', 
            'Mesaj gönderebilmek için giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın.',
            [
              { text: 'Tamam', style: 'default' },
              { 
                text: 'Profil Sayfası', 
                onPress: () => router.push('/profile'),
                style: 'default'
              }
            ]
          );
          return;
        }
        
        if (error.code === 'PGRST116') {
          Alert.alert(
            'Bağlantı Hatası', 
            'Sunucu ile bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.',
            [{ text: 'Tamam', style: 'default' }]
          );
          return;
        }
        
        throw error;
      }

      // Clear the input field
      setNewMessage("");
      
      // Reload messages to show the new message and maintain conversation history
      if (currentUser && otherUser) {
        await loadMessages(currentUser.id, otherUser);
      }
      
      HapticService.success();

    } catch (error: any) {
      console.error('Mesaj gönderilirken hata:', error);
      HapticService.error();
      
      // Provide specific error messages based on the error type
      if (error?.message?.includes('JWT')) {
        Alert.alert('Oturum Hatası', 'Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.');
        router.push('/profile');
      } else if (error?.code === '42501') {
        Alert.alert('İzin Hatası', 'Mesaj gönderme izniniz yok. Lütfen uygulamayı yeniden başlatın.');
      } else if (error?.message?.includes('network')) {
        Alert.alert('Bağlantı Hatası', 'İnternet bağlantınızı kontrol edin.');
      } else {
        Alert.alert('Hata', `Mesaj gönderilemedi: ${error?.message || 'Bilinmeyen hata'}`);
      }
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.is_own ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.is_own ? styles.ownMessageText : styles.otherMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={[
        styles.messageTime,
        item.is_own ? styles.ownMessageTime : styles.otherMessageTime
      ]}>
        {new Date(item.created_at).toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chat yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
        </Pressable>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {otherUser?.display_name || 'Kullanıcı'}
          </Text>
          {listingInfo && (
            <Text style={styles.headerListing} numberOfLines={1}>
              📦 {listingInfo.title}
            </Text>
          )}
        </View>

        <MaterialIcons name="info-outline" size={24} color="#6c757d" />
      </View>

      {/* İlan bilgisi */}
      {listingInfo && (
        <View style={styles.listingInfo}>
          <MaterialIcons name="shopping-bag" size={16} color="#f0a500" />
          <Text style={styles.listingInfoText}>
            {listingInfo.title} - {new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              minimumFractionDigits: 0,
            }).format(listingInfo.price)}
          </Text>
        </View>
      )}

      {/* Mesajlar */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Mesaj gönderme alanı */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Mesajınızı yazın..."
          multiline
          maxLength={500}
        />
        <Pressable 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <MaterialIcons 
            name="send" 
            size={20} 
            color={newMessage.trim() ? "white" : "#ccc"} 
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerListing: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  listingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff3e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  listingInfoText: {
    fontSize: 14,
    color: '#f0a500',
    marginLeft: 8,
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f0a500',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#2c3e50',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: '#6c757d',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0a500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});
