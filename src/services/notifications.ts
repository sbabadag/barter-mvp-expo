import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../state/AuthProvider';
import { useReceivedOffers } from './tekliflerim';
import * as Notifications from 'expo-notifications';
import { TimeIntervalTriggerInput } from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationCounts {
  pendingOffers: number;
  newMessages: number; // for future implementation
  total: number;
}

export interface NotificationData {
  type: 'new_bid' | 'message' | 'listing_sold' | 'general';
  listingId?: string;
  bidId?: string;
  userId?: string;
  title: string;
  body: string;
}

export const useNotificationCounts = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: receivedOffers } = useReceivedOffers();

  return useQuery({
    queryKey: ["notificationCounts", user?.id],
    queryFn: async (): Promise<NotificationCounts> => {
      if (!isAuthenticated || !user) {
        return { pendingOffers: 0, newMessages: 0, total: 0 };
      }

      // Count pending received offers (new bids on user's listings)
      const pendingOffers = receivedOffers?.filter(offer => 
        offer.status === 'pending' || offer.status === 'countered'
      ).length || 0;

      // Future: Add new messages count
      const newMessages = 0;

      const total = pendingOffers + newMessages;

      return {
        pendingOffers,
        newMessages,
        total
      };
    },
    enabled: isAuthenticated && !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

// Push Notification Service
class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<string | null> {
    try {
      // Sadece fiziksel cihazlarda çalışır
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // İzin kontrolü
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Token al
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.log('No project ID found for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      this.expoPushToken = token.data;
      console.log('📱 Push token:', this.expoPushToken);
      
      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  async scheduleBidNotification(listingTitle: string, bidAmount: number, listingId: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Yeni Teklif! 🎯',
          body: `${listingTitle} için ${bidAmount} TL teklif aldınız`,
          data: {
            type: 'new_bid',
            listingId,
          },
        },
        trigger: null, // Hemen gönder
      });
      console.log('✅ Bid notification scheduled');
    } catch (error) {
      console.error('Error scheduling bid notification:', error);
    }
  }

  async scheduleMessageNotification(senderName: string, messagePreview: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${senderName} mesaj gönderdi 💬`,
          body: messagePreview,
          data: {
            type: 'message',
          },
        },
        trigger: null,
      });
      console.log('✅ Message notification scheduled');
    } catch (error) {
      console.error('Error scheduling message notification:', error);
    }
  }

  async scheduleSoldNotification(listingTitle: string, finalPrice: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ürün Satıldı! 🎉',
          body: `${listingTitle} ${finalPrice} TL'ye satıldı`,
          data: {
            type: 'listing_sold',
          },
        },
        trigger: null,
      });
      console.log('✅ Sold notification scheduled');
    } catch (error) {
      console.error('Error scheduling sold notification:', error);
    }
  }

  async scheduleReminderNotification(title: string, body: string, triggerSeconds: number = 3600) {
    try {
      const trigger: TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
      };
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'general',
          },
        },
        trigger: triggerSeconds > 0 ? trigger : null,
      });
      console.log('✅ Reminder notification scheduled');
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Bildirim dinleyicilerini kaydet
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Android için bildirim kanalları
  async setupAndroidChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('bids', {
        name: 'Teklifler',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Mesajlar',
        importance: Notifications.AndroidImportance.DEFAULT,
      });

      await Notifications.setNotificationChannelAsync('general', {
        name: 'Genel',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }
}

export const notificationService = new NotificationService();
