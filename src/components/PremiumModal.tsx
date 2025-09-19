import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { InAppPurchaseService } from '../services/iap-universal';
import { useInAppPurchases, PRODUCTS, ProductId } from '../hooks/useInAppPurchases';
import { HapticService } from '../services/haptics';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string; // The premium feature that triggered this modal
}

const PremiumFeatures = [
  {
    icon: 'stars',
    title: 'Öne Çıkan İlanlar',
    description: 'İlanlarınız listede üstte görünsün',
  },
  {
    icon: 'photo-library',
    title: 'Sınırsız Fotoğraf',
    description: 'İlan başına 10\'a kadar fotoğraf ekleyin',
  },
  {
    icon: 'search',
    title: 'Gelişmiş Arama',
    description: 'Filtreler ve kayıtlı aramalar',
  },
  {
    icon: 'chat',
    title: 'Öncelikli Destek',
    description: '7/24 öncelikli müşteri desteği',
  },
  {
    icon: 'analytics',
    title: 'İlan Analitikleri',
    description: 'Görüntülenme ve tıklanma istatistikleri',
  },
  {
    icon: 'verified',
    title: 'Doğrulanmış Rozet',
    description: 'Profilinizde güven rozeti',
  },
];

export default function PremiumModal({ visible, onClose, feature }: PremiumModalProps) {
  const { products, purchaseProduct, restorePurchases, isLoading } = useInAppPurchases();
  const [selectedProduct, setSelectedProduct] = useState<ProductId>(PRODUCTS.PREMIUM_MONTHLY);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      HapticService.light();
      
      const success = await purchaseProduct(selectedProduct);
      
      if (success) {
        HapticService.success();
        onClose();
      } else {
        HapticService.error();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      HapticService.error();
      Alert.alert('Hata', 'Satın alma işlemi tamamlanamadı.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      HapticService.light();
      const success = await restorePurchases();
      
      if (success) {
        HapticService.success();
        Alert.alert('Başarılı', 'Satın almalarınız geri yüklendi.');
        onClose();
      } else {
        HapticService.error();
        Alert.alert('Bilgi', 'Geri yüklenecek satın alma bulunamadı.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      HapticService.error();
    }
  };

  const getProductPrice = (productId: ProductId) => {
    const product = products.find(p => p.id === productId);
    return product?.price || 'Yükleniyor...';
  };

  const getSavingsText = () => {
    const monthlyProduct = products.find(p => p.id === PRODUCTS.PREMIUM_MONTHLY);
    const annualProduct = products.find(p => p.id === PRODUCTS.PREMIUM_ANNUAL);
    
    if (monthlyProduct && annualProduct) {
      const monthlyPrice = monthlyProduct.priceAmountMicros;
      const annualPrice = annualProduct.priceAmountMicros;
      const yearlyMonthly = monthlyPrice * 12;
      const savings = ((yearlyMonthly - annualPrice) / yearlyMonthly * 100).toFixed(0);
      return `%${savings} tasarruf edin`;
    }
    
    return 'En popüler';
  };

  if (isLoading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f0a500" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="stars" size={24} color="#f0a500" />
            <Text style={styles.headerTitle}>Premium'a Geçin</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          {feature && (
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                "{feature}" özelliği premium üyelere özeldir
              </Text>
              <Text style={styles.heroSubtitle}>
                Tüm premium özelliklerden yararlanmak için üyeliğinizi yükseltin
              </Text>
            </View>
          )}

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Premium Özellikler</Text>
            {PremiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialIcons name={feature.icon as any} size={20} color="#f0a500" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <MaterialIcons name="check-circle" size={20} color="#28a745" />
              </View>
            ))}
          </View>

          {/* Pricing Options */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Fiyatlandırma Seçenekleri</Text>
            
            {/* Annual Plan */}
            <Pressable
              style={[
                styles.pricingOption,
                selectedProduct === PRODUCTS.PREMIUM_ANNUAL && styles.selectedOption
              ]}
              onPress={() => setSelectedProduct(PRODUCTS.PREMIUM_ANNUAL)}
            >
              <View style={styles.pricingHeader}>
                <View>
                  <Text style={styles.pricingTitle}>Yıllık Premium</Text>
                  <Text style={styles.pricingSubtitle}>12 ay, aylık {Math.round((products.find(p => p.id === PRODUCTS.PREMIUM_ANNUAL)?.priceAmountMicros || 0) / 12000000)}₺</Text>
                </View>
                <View style={styles.pricingRight}>
                  <Text style={styles.pricingPrice}>{getProductPrice(PRODUCTS.PREMIUM_ANNUAL)}</Text>
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{getSavingsText()}</Text>
                  </View>
                </View>
              </View>
              {selectedProduct === PRODUCTS.PREMIUM_ANNUAL && (
                <MaterialIcons name="check-circle" size={20} color="#f0a500" style={styles.checkIcon} />
              )}
            </Pressable>

            {/* Monthly Plan */}
            <Pressable
              style={[
                styles.pricingOption,
                selectedProduct === PRODUCTS.PREMIUM_MONTHLY && styles.selectedOption
              ]}
              onPress={() => setSelectedProduct(PRODUCTS.PREMIUM_MONTHLY)}
            >
              <View style={styles.pricingHeader}>
                <View>
                  <Text style={styles.pricingTitle}>Aylık Premium</Text>
                  <Text style={styles.pricingSubtitle}>Aylık faturalandırma</Text>
                </View>
                <View style={styles.pricingRight}>
                  <Text style={styles.pricingPrice}>{getProductPrice(PRODUCTS.PREMIUM_MONTHLY)}</Text>
                </View>
              </View>
              {selectedProduct === PRODUCTS.PREMIUM_MONTHLY && (
                <MaterialIcons name="check-circle" size={20} color="#f0a500" style={styles.checkIcon} />
              )}
            </Pressable>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              • Ödeme, satın alma onayında iTunes hesabınızdan tahsil edilir{'\n'}
              • Abonelik, mevcut dönem sona ermeden en az 24 saat önce iptal edilmediği takdirde otomatik olarak yenilenir{'\n'}
              • Hesap, mevcut dönem sona ermeden 24 saat içinde yenileme için ücretlendirilir{'\n'}
              • Abonelikler kullanıcı tarafından yönetilebilir ve otomatik yenileme, satın alma sonrasında kullanıcının Hesap Ayarları'na gidilerek kapatılabilir
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Pressable
            style={[styles.purchaseButton, isPurchasing && styles.disabledButton]}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <MaterialIcons name="stars" size={20} color="white" />
                <Text style={styles.purchaseButtonText}>
                  Premium'a Başla - {getProductPrice(selectedProduct)}
                </Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreButtonText}>Satın Alımları Geri Yükle</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  pricingSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pricingOption: {
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#f0a500',
    backgroundColor: '#fff9f0',
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pricingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pricingRight: {
    alignItems: 'flex-end',
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0a500',
  },
  savingsBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  termsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  actionSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  purchaseButton: {
    backgroundColor: '#f0a500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});