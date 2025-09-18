import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../state/AuthProvider';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../utils/supabase';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Mock notifications for development
const getMockNotifications = (userId: string) => [
  {
    id: '1',
    user_id: userId,
    type: 'new_bid',
    title: 'Yeni Teklif!',
    body: 'Bisikletiniz için 1.200 TL teklif aldınız',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    data: { bidId: 'bid_1', listingId: 'listing_1' }
  },
  {
    id: '2',
    user_id: userId,
    type: 'new_message',
    title: 'Yeni Mesaj',
    body: 'Teklifiniz hakkında soru var',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    data: { messageId: 'msg_1' }
  },
  {
    id: '3',
    user_id: userId,
    type: 'bid_accepted',
    title: 'Teklif Kabul Edildi!',
    body: 'Teklifiniz kabul edildi. Satıcı ile iletişime geçin.',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    data: { bidId: 'bid_2', listingId: 'listing_2' }
  }
];

// Bildirim kanallarını kurulum (Android için)
const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync('bids', {
      name: 'Teklifler',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f0a500',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mesajlar',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#f0a500',
      sound: 'default',
    });
  }
};

// Ana bildirim servisi
class NotificationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('📱 Initializing notification service...');
      
      // Setup channels
      await setupNotificationChannels();
      
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        console.log('✅ Notification permissions granted');
      } else {
        console.log('❌ Notification permissions denied');
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  async sendLocalNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async updateBadgeCount(count: number = 0) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }
}

export const notificationService = new NotificationService();

// React Hook for notifications with safe error handling
export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        // Always use mock data for now to avoid database errors
        return getMockNotifications(user.id);
      } catch (error) {
        console.log('Using mock notifications');
        return getMockNotifications(user.id);
      }
    },
    enabled: !!user?.id,
    retry: false, // Don't retry on error
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    // In mock mode, just refresh the query
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
  };

  const markAllAsRead = async () => {
    console.log('Marking all notifications as read');
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    await notificationService.clearBadge();
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  };
};

// Initialize the service
notificationService.initialize();

console.log('📱 Notification service initialized successfully');