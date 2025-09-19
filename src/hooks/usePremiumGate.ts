import { useState, useCallback, useEffect } from 'react';
import { useInAppPurchases } from './useInAppPurchases';

interface UsePremiumGateOptions {
  featureName?: string;
  onPremiumRequired?: () => void;
}

export function usePremiumGate(options: UsePremiumGateOptions = {}) {
  const { isPremium: checkIsPremium } = useInAppPurchases();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premium = await checkIsPremium();
      setIsPremium(premium);
    };
    
    checkPremiumStatus();
  }, [checkIsPremium]);

  const checkPremiumAccess = useCallback(async (action: () => void) => {
    const premium = await checkIsPremium();
    if (premium) {
      action();
    } else {
      setShowPremiumModal(true);
      options.onPremiumRequired?.();
    }
  }, [checkIsPremium, options.onPremiumRequired]);

  const closePremiumModal = useCallback(() => {
    setShowPremiumModal(false);
  }, []);

  return {
    isPremium,
    showPremiumModal,
    closePremiumModal,
    checkPremiumAccess,
    requirePremium: () => setShowPremiumModal(true),
  };
}

// Feature-specific premium gates
export const PREMIUM_FEATURES = {
  FEATURED_LISTINGS: 'Öne Çıkan İlanlar',
  UNLIMITED_PHOTOS: 'Sınırsız Fotoğraf',
  ADVANCED_SEARCH: 'Gelişmiş Arama',
  ANALYTICS: 'İlan Analitikleri',
  PRIORITY_SUPPORT: 'Öncelikli Destek',
  VERIFIED_BADGE: 'Doğrulanmış Rozet',
  MULTIPLE_LISTINGS: 'Çoklu İlan',
  MESSAGE_TEMPLATES: 'Mesaj Şablonları',
  AUTO_REPOST: 'Otomatik Yeniden Yayın',
  EXPORT_DATA: 'Veri Dışa Aktarma',
} as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];