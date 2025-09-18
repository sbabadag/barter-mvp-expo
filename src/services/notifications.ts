import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../state/AuthProvider';
import { useReceivedOffers } from './tekliflerim';
import * as Notifications from 'expo-notifications';
import { TimeIntervalTriggerInput } from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
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
  private static instance: NotificationService;
  private isInitialized = false;
  private notificationListener: any = null;
  private responseListener: any = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('📱 Initializing notification service...');

      // Request permissions
      await this.requestPermissions();

      // Setup notification channels (Android)
      await setupNotificationChannels();

      // Setup listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('❌ Failed to get push token for push notification!');
          return false;
        }
        
        console.log('✅ Notification permissions granted');
        return true;
      } else {
        console.log('📱 Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('📱 Must use physical device for Push Notifications');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      console.log('🎫 Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  private setupNotificationListeners(): void {
    // Uygulama açıkken gelen bildirimler
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notification received:', notification);
      // Badge sayısını güncelle
      this.updateBadgeCount();
    });

    // Bildirime tıklandığında
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      // Deep linking burada handle edilebilir
      this.handleNotificationTap(response);
    });
  }

  private async handleNotificationTap(response: any): Promise<void> {
    const data = response.notification.request.content.data;
    console.log('📂 Notification data:', data);
    
    // Burada deep linking mantığı eklenebilir
    // Örneğin: router.push() ile ilgili sayfaya yönlendirme
  }

  async updateBadgeCount(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Okunmamış bildirim sayısını al
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .eq('read', false);

      await Notifications.setBadgeCountAsync(count || 0);
    } catch (error) {
      console.error('❌ Error updating badge count:', error);
    }
  }

  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null, // Hemen gönder
      });
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('❌ Error clearing badge:', error);
    }
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// React Hook for notifications
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

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Update badge count
      await notificationService.updateBadgeCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await notificationService.clearBadge();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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

// Bildirim test fonksiyonu
export const testNotification = async () => {
  await notificationService.sendLocalNotification(
    'Test Bildirimi',
    'Bu bir test bildirimidir!',
    { test: true }
  );
};

export default NotificationService;