import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  reviewedUserId: string;
  listingId?: string;
  transactionType: 'buyer' | 'seller';
  reviewedUserName: string;
  onSuccess?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  reviewedUserId,
  listingId,
  transactionType,
  reviewedUserName,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [communicationRating, setCommunicationRating] = useState(5);
  const [itemConditionRating, setItemConditionRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderStars = (currentRating: number, onRatingChange: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              console.log('Star pressed:', star, 'Current rating:', currentRating);
              onRatingChange(star);
            }}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={star <= currentRating ? "star" : "star-border"} 
              size={32} 
              color={star <= currentRating ? '#FFD700' : '#E0E0E0'} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const submitRating = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Hata', 'Giriş yapmanız gerekiyor');
        return;
      }

      const { error } = await supabase
        .from('ratings')
        .insert({
          reviewer_id: user.id,
          reviewed_user_id: reviewedUserId,
          listing_id: listingId,
          transaction_type: transactionType,
          rating,
          review_text: reviewText.trim() || null,
          communication_rating: communicationRating,
          item_condition_rating: itemConditionRating,
          delivery_rating: deliveryRating,
          is_verified: true,
        });

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Uyarı', 'Bu işlem için zaten değerlendirme yapmışsınız.');
        } else {
          throw error;
        }
        return;
      }

      Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi!');
      onSuccess?.();
      onClose();
      
      // Reset form
      setRating(5);
      setReviewText('');
      setCommunicationRating(5);
      setItemConditionRating(5);
      setDeliveryRating(5);
      
    } catch (error) {
      console.error('Rating error:', error);
      Alert.alert('Hata', 'Değerlendirme gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {transactionType === 'seller' ? 'Satıcıyı' : 'Alıcıyı'} Değerlendirin
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.userName}>{reviewedUserName}</Text>
          
          {/* Overall Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Genel Değerlendirme</Text>
            {renderStars(rating, setRating)}
          </View>

          {/* Detailed Ratings */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>İletişim</Text>
            {renderStars(communicationRating, setCommunicationRating)}
          </View>

          {transactionType === 'seller' && (
            <>
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Ürün Durumu</Text>
                {renderStars(itemConditionRating, setItemConditionRating)}
              </View>

              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Teslimat</Text>
                {renderStars(deliveryRating, setDeliveryRating)}
              </View>
            </>
          )}

          {/* Review Text */}
          <View style={styles.textSection}>
            <Text style={styles.textLabel}>Yorumunuz (İsteğe bağlı)</Text>
            <TextInput
              style={styles.textInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Deneyiminizi paylaşın..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{reviewText.length}/500</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={submitRating}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 8,
    margin: 2,
  },
  textSection: {
    marginBottom: 20,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RatingModal;
