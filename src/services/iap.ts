import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

// Safe import that handles missing native modules in Expo Go
let InAppPurchases: any = null;
let IAPResponseCode: any = null;
let InAppPurchaseState: any = null;

const isExpoGo = (() => {
  try {
    const iapModule = require('expo-in-app-purchases');
    InAppPurchases = iapModule;
    IAPResponseCode = iapModule.IAPResponseCode;
    InAppPurchaseState = iapModule.InAppPurchaseState;
    return false;
  } catch (error) {
    console.log('🛍️ IAP: Native module not available, using mock service (Expo Go)');
    return true;
  }
})();

// TypeScript interfaces for type safety
interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
}

interface IAPPurchase {
  purchaseId: string;
  productId: string;
  purchaseTime: number;
  purchaseState: number;
  receipt: string;
}

// Supabase import - only for production mode
let supabase: any = null;
if (!isExpoGo) {
  try {
    const supabaseModule = require('../utils/supabase');
    supabase = supabaseModule.supabase;
  } catch (error) {
    console.warn('Supabase not available:', error);
  }
}

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

class InAppPurchaseService {
  private products: Product[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize InAppPurchases
      await InAppPurchases.connectAsync();
      
      // Load products
      await this.loadProducts();
      
      // Setup purchase listener
      this.setupPurchaseListener();
      
      this.isInitialized = true;
      console.log('✅ IAP Service initialized successfully');
    } catch (error) {
      console.error('❌ IAP Service initialization failed:', error);
      throw error;
    }
  }

  private async loadProducts() {
    try {
      const productIds = Object.values(PRODUCTS);
      console.log('Loading products:', productIds);
      
      const response = await InAppPurchases.getProductsAsync(productIds);
      
      if (response.responseCode === IAPResponseCode.OK) {
        this.products = response.results?.map((item: any) => ({
          id: item.productId,
          title: item.title,
          description: item.description,
          price: item.price,
          priceAmountMicros: item.priceAmountMicros || 0,
          priceCurrencyCode: item.priceCurrencyCode,
          type: this.getProductType(item.productId as ProductId),
        })) || [];
        
        console.log('✅ Products loaded:', this.products.length);
      } else {
        console.error('❌ Failed to load products:', response.responseCode);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
    }
  }

  private getProductType(productId: ProductId): 'subscription' | 'consumable' | 'non_consumable' {
    if (productId === PRODUCTS.PREMIUM_MONTHLY || productId === PRODUCTS.PREMIUM_ANNUAL) {
      return 'subscription';
    } else if (productId === PRODUCTS.LISTING_BOOST) {
      return 'consumable';
    }
    return 'non_consumable';
  }

  private setupPurchaseListener() {
    InAppPurchases.setPurchaseListener(async (result: any) => {
      console.log('Purchase event received:', result);
      
      if (result.responseCode === IAPResponseCode.OK && result.results) {
        for (const purchase of result.results) {
          try {
            switch (purchase.purchaseState) {
              case InAppPurchaseState.PURCHASED:
                await this.handlePurchaseSuccess(purchase);
                break;
              case InAppPurchaseState.FAILED:
                await this.handlePurchaseFailure(purchase);
                break;
              case InAppPurchaseState.RESTORED:
                await this.handlePurchaseRestore(purchase);
                break;
              case InAppPurchaseState.DEFERRED:
                console.log('Purchase deferred:', purchase.productId);
                break;
            }
          } catch (error) {
            console.error('Error handling purchase:', error);
          }
        }
      }
    });
  }

  private async handlePurchaseSuccess(purchase: IAPPurchase) {
    try {
      console.log('Processing successful purchase:', purchase.productId);
      
      // Save purchase to database
      await this.savePurchaseToDatabase(purchase);
      
      // Acknowledge/finish the purchase
      await InAppPurchases.finishTransactionAsync(purchase, true);
      
      console.log('✅ Purchase processed successfully');
    } catch (error) {
      console.error('❌ Error processing purchase:', error);
      await InAppPurchases.finishTransactionAsync(purchase, false);
    }
  }

  private async handlePurchaseFailure(purchase: IAPPurchase) {
    console.log('Purchase failed:', purchase.productId);
    Alert.alert('Satın Alma Başarısız', 'Satın alma işlemi tamamlanamadı.');
    await InAppPurchases.finishTransactionAsync(purchase, false);
  }

  private async handlePurchaseRestore(purchase: IAPPurchase) {
    console.log('Purchase restored:', purchase.productId);
    // Handle restored purchase similar to successful purchase
    await this.handlePurchaseSuccess(purchase);
  }

  private async savePurchaseToDatabase(purchase: IAPPurchase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate expiry date for subscriptions
      let expiresAt = null;
      if (purchase.productId === PRODUCTS.PREMIUM_MONTHLY) {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      } else if (purchase.productId === PRODUCTS.PREMIUM_ANNUAL) {
        expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 365 days
      }

      // Save subscription record
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          product_id: purchase.productId,
          original_transaction_id: purchase.originalOrderId || purchase.orderId,
          transaction_id: purchase.orderId,
          purchase_date: new Date(purchase.purchaseTime).toISOString(),
          expires_date: expiresAt,
          status: 'active',
          receipt_data: purchase.transactionReceipt || '',
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('✅ Purchase saved to database');
    } catch (error) {
      console.error('❌ Error saving purchase to database:', error);
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
      console.log('Starting purchase for:', productId);
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      await InAppPurchases.purchaseItemAsync(productId);
      return true; // Actual result will come through the purchase listener
    } catch (error) {
      console.error('Purchase error:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      console.log('Restoring purchases...');
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (response.responseCode === IAPResponseCode.OK && response.results) {
        // Process restored purchases
        for (const purchase of response.results) {
          if (purchase.purchaseState === InAppPurchaseState.PURCHASED) {
            await this.savePurchaseToDatabase(purchase);
          }
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  }

  async isPremiumUser(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_date', new Date().toISOString())
        .order('expires_date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking premium status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  async getUserSubscription(): Promise<Subscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('expires_date', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      const sub = data[0];
      return {
        id: sub.id,
        user_id: sub.user_id,
        product_id: sub.product_id,
        status: sub.status,
        starts_at: sub.purchase_date,
        expires_at: sub.expires_date,
        auto_renew: sub.auto_renew_status ?? true,
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }
}

// Create singleton instance
export const iapService = new InAppPurchaseService();

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
      await iapService.initialize();
      const loadedProducts = await iapService.getProducts();
      setProducts(loadedProducts);
      
      const userSub = await iapService.getUserSubscription();
      setSubscription(userSub);
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
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