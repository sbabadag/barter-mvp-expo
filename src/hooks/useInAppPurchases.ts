import { useState, useEffect, useCallback } from 'react';
import { InAppPurchaseService, Product } from '../services/iap-universal';

export interface UseInAppPurchasesReturn {
  products: Product[];
  isLoading: boolean;
  isPremium: () => Promise<boolean>;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  initialize: () => Promise<boolean>;
}

export function useInAppPurchases(): UseInAppPurchasesReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const iapService = InAppPurchaseService.getInstance();

  const initialize = useCallback(async (): Promise<boolean> => {
    if (isInitialized) return true;

    setIsLoading(true);
    try {
      const success = await iapService.initialize();
      if (success) {
        setProducts(iapService.getProducts());
        setIsInitialized(true);
      }
      return success;
    } catch (error) {
      console.error('❌ Hook: IAP initialization failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [iapService, isInitialized]);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await iapService.purchaseProduct(productId);
      if (success) {
        // Refresh products after purchase
        setProducts(iapService.getProducts());
      }
      return success;
    } catch (error) {
      console.error('❌ Hook: Purchase failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [iapService]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await iapService.restorePurchases();
      return success;
    } catch (error) {
      console.error('❌ Hook: Restore failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [iapService]);

  const isPremium = useCallback(async (): Promise<boolean> => {
    try {
      // In development mode (Expo Go), return true for testing
      if (!iapService.isReady()) {
        console.log('🛍️ Hook: IAP not ready, assuming premium for development');
        return true;
      }

      // In production, check actual subscription status
      // This would typically check with your backend or Supabase
      // For now, return false - you'll need to implement actual subscription checking
      return false;
    } catch (error) {
      console.error('❌ Hook: Premium check failed:', error);
      return false;
    }
  }, [iapService]);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    products,
    isLoading,
    isPremium,
    purchaseProduct,
    restorePurchases,
    initialize,
  };
}

// Product IDs
export const PRODUCTS = {
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
  PREMIUM_ANNUAL: 'premium_yearly', // Alias for yearly
} as const;

export type ProductId = typeof PRODUCTS[keyof typeof PRODUCTS];