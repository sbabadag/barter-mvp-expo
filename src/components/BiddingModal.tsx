import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCreateOffer } from '../services/tekliflerim';
import { useAuth } from '../state/AuthProvider';

interface BiddingModalProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  currentPrice: number;
  onBidSubmitted?: () => void;
}

export default function BiddingModal({
  visible,
  onClose,
  listingId,
  listingTitle,
  currentPrice,
  onBidSubmitted,
}: BiddingModalProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [message, setMessage] = useState('');
  const [expires24h, setExpires24h] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const createOfferMutation = useCreateOffer();

  const handleSubmit = async () => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      Alert.alert('Giriş Gerekli', 'Teklif vermek için önce giriş yapmalısınız.');
      return;
    }

    if (!bidAmount.trim()) {
      Alert.alert('Hata', 'Lütfen teklif miktarını girin');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Geçerli bir miktar girin');
      return;
    }

    if (amount >= currentPrice) {
      Alert.alert(
        'Uyarı',
        `Teklifiniz (${amount} TL) mevcut fiyatla (${currentPrice} TL) aynı veya daha yüksek. Devam etmek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Devam Et', onPress: () => submitBid(amount) },
        ]
      );
    } else {
      await submitBid(amount);
    }
  };

  const submitBid = async (amount: number) => {
    try {
      await createOfferMutation.mutateAsync({
        listingId,
        amount,
        message: message.trim() || undefined,
        expiresIn24h: expires24h,
      });

      Alert.alert(
        'Başarılı!',
        'Teklifiniz gönderildi. Satıcı en kısa sürede cevap verecektir.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              setBidAmount('');
              setMessage('');
              setExpires24h(true);
              onClose();
              onBidSubmitted?.();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Teklif gönderilirken hata oluştu');
      console.error('Bid submission error:', error);
    }
  };

  const suggestedAmounts = [
    Math.floor(currentPrice * 0.7),
    Math.floor(currentPrice * 0.8),
    Math.floor(currentPrice * 0.9),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Teklif Ver</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle} numberOfLines={2}>
              {listingTitle}
            </Text>
            <Text style={styles.currentPrice}>
              Mevcut Fiyat: <Text style={styles.priceAmount}>{currentPrice} TL</Text>
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teklif Miktarı</Text>
            <TextInput
              style={styles.input}
              value={bidAmount}
              onChangeText={setBidAmount}
              placeholder="Teklif miktarınızı girin"
              keyboardType="numeric"
              maxLength={10}
            />
            
            <View style={styles.suggestedAmounts}>
              <Text style={styles.suggestedTitle}>Önerilen miktarlar:</Text>
              <View style={styles.suggestedButtons}>
                {suggestedAmounts.map((amount, index) => (
                  <Pressable
                    key={index}
                    style={styles.suggestedButton}
                    onPress={() => setBidAmount(amount.toString())}
                  >
                    <Text style={styles.suggestedButtonText}>{amount} TL</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mesaj (İsteğe Bağlı)</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Satıcıya bir mesaj bırakın..."
              multiline
              maxLength={200}
            />
            <Text style={styles.characterCount}>
              {message.length}/200
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.optionRow}>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>24 Saat Süreli Teklif</Text>
                <Text style={styles.optionDescription}>
                  Teklifiniz 24 saat sonra otomatik olarak iptal olur
                </Text>
              </View>
              <Switch
                value={expires24h}
                onValueChange={setExpires24h}
                trackColor={{ false: '#ccc', true: '#00d4aa' }}
                thumbColor={expires24h ? '#00a085' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <MaterialIcons name="info" size={20} color="#666" />
            <Text style={styles.infoText}>
              Teklifiniz satıcıya gönderilecek. Satıcı teklifinizi kabul edebilir, 
              reddedebilir veya karşı teklif yapabilir.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </Pressable>
          
          <Pressable
            style={[styles.button, styles.submitButton, createOfferMutation.isPending && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={createOfferMutation.isPending}
          >
            <Text style={styles.submitButtonText}>
              {createOfferMutation.isPending ? 'Gönderiliyor...' : 'Teklif Gönder'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listingInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 14,
    color: '#666',
  },
  priceAmount: {
    fontWeight: 'bold',
    color: '#00d4aa',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  suggestedAmounts: {
    marginTop: 12,
  },
  suggestedTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  suggestedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestedButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestedButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#00d4aa',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
