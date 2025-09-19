import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

// Mock IAP service for development in Expo Go
// This provides the same interface as the real IAP service but with mock data

// Product definitions
export const PRODUCTS = {
  PREMIUM_MONTHLY: Platform.select({
    ios: 'eskici_premium_monthly',
    android: 'premium_monthly',
  }) as string,
  PREMIUM_ANNUAL: Platform.select({
    ios: 'eskici_premium_annual',
    android: 'premium_annual', 
  }) as string,
  LISTING_BOOST: Platform.select({
    ios: 'eskici_listing_boost',
    android: 'listing_boost',
  }) as string,
} as const;

export type ProductId = typeof PRODUCTS[keyof typeof PRODUCTS];

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  type: 'subscription' | 'consumable' | 'non_consumable';
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: ProductId;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  starts_at: string;
  expires_at: string;
  auto_renew: boolean;
}

// Mock products data
const MOCK_PRODUCTS: Product[] = [
  {
    id: PRODUCTS.PREMIUM_MONTHLY,
    title: 'Aylık Premium Üyelik',
    description: 'Tüm premium özelliklerden yararlanın',
    price: '₺29,99',
    priceAmountMicros: 29990000,
    priceCurrencyCode: 'TRY',
    type: 'subscription',
  },
  {
    id: PRODUCTS.PREMIUM_ANNUAL,
    title: 'Yıllık Premium Üyelik',
    description: '12 aylık premium üyelik - %40 tasarruf',
    price: '₺299,99',
    priceAmountMicros: 299990000,
    priceCurrencyCode: 'TRY',
    type: 'subscription',
  },
  {
    id: PRODUCTS.LISTING_BOOST,
    title: 'İlan Öne Çıkarma',
    description: '7 gün boyunca öne çıkan ilan',
    price: '₺9,99',
    priceAmountMicros: 9990000,
    priceCurrencyCode: 'TRY',
    type: 'consumable',
  },
];

class MockInAppPurchaseService {
  private products: Product[] = MOCK_PRODUCTS;
  private isInitialized = false;
  private mockPremiumStatus = false; // Set to true to test premium features

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🛍️ Mock IAP Service: Initializing...');
      
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isInitialized = true;
      console.log('✅ Mock IAP Service initialized successfully');
    } catch (error) {
      console.error('❌ Mock IAP Service initialization failed:', error);
      throw error;
    }
  }

  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.products;
  }

  async purchaseProduct(productId: ProductId): Promise<boolean> {
    try {
      console.log('🛍️ Mock IAP: Starting purchase for:', productId);
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Simulate purchase flow
      Alert.alert(
        "Mock Purchase",
        `Mock purchase successful for ${productId}!\n\nIn production, this would trigger real Apple/Google payment.`,
        [
          {
            text: "Enable Premium (Mock)",
            onPress: () => {
              this.mockPremiumStatus = true;
              console.log('✅ Mock premium status enabled');
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      
      return true;
    } catch (error) {
      console.error('Mock purchase error:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      console.log('🛍️ Mock IAP: Restoring purchases...');
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      Alert.alert(
        "Mock Restore",
        "Mock restore successful!\n\nIn production, this would restore real purchases.",
        [
          {
            text: "Enable Premium (Mock)",
            onPress: () => {
              this.mockPremiumStatus = true;
              console.log('✅ Mock premium status enabled via restore');
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      
      return true;
    } catch (error) {
      console.error('Mock restore error:', error);
      return false;
    }
  }

  async isPremiumUser(): Promise<boolean> {
    // For development, you can toggle this to test premium features
    const isDev = __DEV__;
    const mockPremium = isDev && (process.env.EXPO_PUBLIC_MOCK_PREMIUM === 'true' || this.mockPremiumStatus);
    
    console.log('🛍️ Mock IAP: Premium check:', { mockPremium, isDev, env: process.env.EXPO_PUBLIC_MOCK_PREMIUM });
    
    return mockPremium;
  }

  async getUserSubscription(): Promise<Subscription | null> {
    const isPremium = await this.isPremiumUser();
    
    if (!isPremium) return null;

    // Return mock subscription
    return {
      id: 'mock-subscription-id',
      user_id: 'mock-user-id',
      product_id: PRODUCTS.PREMIUM_MONTHLY,
      status: 'active',
      starts_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      auto_renew: true,
    };
  }
}

// Create singleton instance
export const iapService = new MockInAppPurchaseService();

// React Hook for easy usage
export function useInAppPurchases() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    initializeIAP();
  }, []);

  const initializeIAP = async () => {
    try {
      console.log('🛍️ Mock IAP Hook: Initializing...');
      await iapService.initialize();
      const loadedProducts = await iapService.getProducts();
      setProducts(loadedProducts);
      
      const userSub = await iapService.getUserSubscription();
      setSubscription(userSub);
      
      console.log('✅ Mock IAP Hook initialized');
    } catch (error) {
      console.error('Failed to initialize Mock IAP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseProduct = async (productId: ProductId): Promise<boolean> => {
    try {
      const result = await iapService.purchaseProduct(productId);
      if (result) {
        // Refresh subscription status
        const userSub = await iapService.getUserSubscription();
        setSubscription(userSub);
      }
      return result;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const result = await iapService.restorePurchases();
      if (result) {
        // Refresh subscription status
        const userSub = await iapService.getUserSubscription();
        setSubscription(userSub);
      }
      return result;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  };

  const isPremium = async (): Promise<boolean> => {
    return await iapService.isPremiumUser();
  };

  return {
    products,
    isLoading,
    subscription,
    purchaseProduct,
    restorePurchases,
    isPremium,
  };
}