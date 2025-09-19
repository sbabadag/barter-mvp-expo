import { Platform, Alert } from 'react-native';

// Check if we're in Expo Go environment
const isExpoGo = (() => {
  try {
    require('expo-in-app-purchases');
    return false;
  } catch (error) {
    return true;
  }
})();

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
}

export class InAppPurchaseService {
  private static instance: InAppPurchaseService;
  private products: Product[] = [];
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): InAppPurchaseService {
    if (!InAppPurchaseService.instance) {
      InAppPurchaseService.instance = new InAppPurchaseService();
    }
    return InAppPurchaseService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🛍️ IAP: Initializing In-App Purchases...');
      
      if (isExpoGo) {
        console.log('🛍️ IAP: Using mock service for Expo Go development');
        this.setupMockProducts();
        this.isInitialized = true;
        return true;
      }

      // Production initialization
      const { InAppPurchases } = require('expo-in-app-purchases');
      const isConnected = await InAppPurchases.connectAsync();
      if (!isConnected) {
        console.error('❌ IAP: Failed to connect to App Store');
        return false;
      }

      console.log('✅ IAP: Connected to App Store');
      this.setupPurchaseListener();
      await this.loadProducts();
      
      this.isInitialized = true;
      console.log('✅ IAP: Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ IAP: Initialization failed:', error);
      return false;
    }
  }

  private setupMockProducts(): void {
    this.products = [
      {
        id: 'premium_monthly',
        title: 'Premium Aylık',
        description: 'Tüm premium özelliklere erişim',
        price: '₺49,99',
        priceAmountMicros: 49990000,
        priceCurrencyCode: 'TRY'
      },
      {
        id: 'premium_yearly',
        title: 'Premium Yıllık',
        description: 'Tüm premium özelliklere yıllık erişim (2 ay bedava)',
        price: '₺399,99',
        priceAmountMicros: 399990000,
        priceCurrencyCode: 'TRY'
      }
    ];
    console.log('✅ IAP: Mock products loaded');
  }

  private async loadProducts(): Promise<void> {
    try {
      const { InAppPurchases, IAPResponseCode } = require('expo-in-app-purchases');
      const response = await InAppPurchases.getProductsAsync(['premium_monthly', 'premium_yearly']);
      
      if (response.responseCode === IAPResponseCode.OK) {
        this.products = response.results?.map((item: any) => ({
          id: item.productId,
          title: item.title,
          description: item.description,
          price: item.price,
          priceAmountMicros: item.priceAmountMicros,
          priceCurrencyCode: item.priceCurrencyCode,
        })) || [];
        
        console.log('✅ IAP: Products loaded:', this.products.length);
      } else {
        console.error('❌ IAP: Failed to load products');
      }
    } catch (error) {
      console.error('❌ IAP: Error loading products:', error);
    }
  }

  getProducts(): Product[] {
    return this.products;
  }

  async purchaseProduct(productId: string): Promise<boolean> {
    if (isExpoGo) {
      // Mock purchase for development
      const product = this.products.find(p => p.id === productId);
      Alert.alert(
        'Geliştirme Modu',
        `Mock satın alma: ${product?.title || productId}\n\nBu özellik gerçek cihazda test edilmelidir.`,
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Devam Et', 
            onPress: () => {
              Alert.alert(
                'Satın Alma Başarılı',
                'Premium üyeliğiniz aktif edildi! (Mock)',
                [{ text: 'Tamam' }]
              );
            }
          }
        ]
      );
      return true;
    }

    try {
      console.log('🛒 IAP: Attempting purchase:', productId);
      const { InAppPurchases, IAPResponseCode } = require('expo-in-app-purchases');
      const result = await InAppPurchases.purchaseItemAsync(productId);
      return result.responseCode === IAPResponseCode.OK;
    } catch (error) {
      console.error('❌ IAP: Purchase failed:', error);
      Alert.alert(
        'Satın Alma Hatası',
        'Satın alma işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    if (isExpoGo) {
      Alert.alert(
        'Geliştirme Modu',
        'Satın alımları geri yükleme özelliği gerçek cihazda test edilmelidir.',
        [{ text: 'Tamam' }]
      );
      return true;
    }

    try {
      console.log('♻️ IAP: Restoring purchases...');
      const { InAppPurchases, IAPResponseCode } = require('expo-in-app-purchases');
      const result = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (result.responseCode === IAPResponseCode.OK) {
        Alert.alert(
          'Geri Yükleme Başarılı',
          'Satın alımlarınız başarıyla geri yüklendi.',
          [{ text: 'Tamam' }]
        );
        return true;
      } else {
        Alert.alert(
          'Geri Yükleme Hatası',
          'Satın alımlarınız geri yüklenirken bir hata oluştu.',
          [{ text: 'Tamam' }]
        );
        return false;
      }
    } catch (error) {
      console.error('❌ IAP: Restore failed:', error);
      Alert.alert(
        'Geri Yükleme Hatası',
        'Satın alımlarınız geri yüklenirken bir hata oluştu.',
        [{ text: 'Tamam' }]
      );
      return false;
    }
  }

  private setupPurchaseListener(): void {
    try {
      const { InAppPurchases, IAPResponseCode, InAppPurchaseState } = require('expo-in-app-purchases');
      
      InAppPurchases.setPurchaseListener(async (result: any) => {
        console.log('📦 IAP: Purchase update:', result);
        
        if (result.responseCode === IAPResponseCode.OK) {
          for (const purchase of result.results || []) {
            if (purchase.purchaseState === InAppPurchaseState.PURCHASED) {
              await this.handlePurchaseSuccess(purchase);
            } else if (purchase.purchaseState === InAppPurchaseState.PENDING) {
              console.log('⏳ IAP: Purchase pending');
            } else if (purchase.purchaseState === InAppPurchaseState.RESTORED) {
              await this.handlePurchaseRestore(purchase);
            }
          }
        } else {
          console.log('❌ IAP: Purchase failed');
        }
      });
    } catch (error) {
      console.error('❌ IAP: Error setting up purchase listener:', error);
    }
  }

  private async handlePurchaseSuccess(purchase: any): Promise<void> {
    try {
      console.log('✅ IAP: Purchase successful:', purchase.productId);
      await this.savePurchaseToDatabase(purchase);
      
      Alert.alert(
        'Satın Alma Başarılı',
        'Premium üyeliğiniz aktif edildi!',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('❌ IAP: Error handling purchase:', error);
    }
  }

  private async handlePurchaseRestore(purchase: any): Promise<void> {
    try {
      console.log('♻️ IAP: Purchase restored:', purchase.productId);
      await this.savePurchaseToDatabase(purchase);
    } catch (error) {
      console.error('❌ IAP: Error handling restore:', error);
    }
  }

  private async savePurchaseToDatabase(purchase: any): Promise<void> {
    try {
      const { supabase } = require('../utils/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user?.id,
          product_id: purchase.productId,
          original_transaction_id: purchase.originalOrderId || purchase.orderId || purchase.purchaseId,
          transaction_id: purchase.orderId || purchase.purchaseId,
          purchase_date: new Date(purchase.purchaseTime || Date.now()).toISOString(),
          expiry_date: this.calculateExpiryDate(purchase.productId),
          is_active: true,
          receipt_data: purchase.transactionReceipt || purchase.receipt || '',
          platform: Platform.OS
        });

      if (error) {
        console.error('❌ IAP: Database save failed:', error);
      } else {
        console.log('✅ IAP: Purchase saved to database');
      }
    } catch (error) {
      console.error('❌ IAP: Database error:', error);
    }
  }

  private calculateExpiryDate(productId: string): string {
    const now = new Date();
    if (productId.includes('monthly')) {
      now.setMonth(now.getMonth() + 1);
    } else if (productId.includes('yearly')) {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
  }

  async disconnect(): Promise<void> {
    if (isExpoGo) {
      console.log('🔌 IAP: Mock disconnect');
      return;
    }

    try {
      const { InAppPurchases } = require('expo-in-app-purchases');
      await InAppPurchases.disconnectAsync();
      console.log('🔌 IAP: Disconnected');
    } catch (error) {
      console.error('❌ IAP: Disconnect error:', error);
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}