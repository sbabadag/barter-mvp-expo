import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../state/AuthProvider';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../utils/supabase';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Type definitions for notifications
export interface NotificationData {
  id: string;
  user_id: string;
  type: 'new_bid' | 'bid_accepted' | 'bid_rejected' | 'bid_countered' | 'new_message' | 'listing_sold' | 'listing_expired' | 'reminder';
  title: string;
  body: string;
  data: any;
  read: boolean;
  sent: boolean;
  delivery_method: 'push' | 'email' | 'sms' | 'in_app';
  listing_id?: string;
  bid_id?: string;
  message_id?: string;
  created_at: string;
  sent_at?: string;
  read_at?: string;
  scheduled_for: string;
}

// Configure notification behavior for both platforms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Function to register push token
export async function registerPushToken(userId: string) {
  try {
    console.log('🔔 Registering push token for user:', userId);
    
    if (!Device.isDevice) {
      console.log('⚠️  Must use physical device for push notifications');
      return null;
    }

    // Get push token
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId ?? 'your-project-id',
    });
    
    console.log('📱 Got push token:', token);

    // First, try to find existing token for this user+token combination
    const { data: existingToken, error: selectError } = await supabase
      .from('user_push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('token', token)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error checking existing token:', selectError);
    }

    if (existingToken) {
      // Token already exists, just update it
      const { error: updateError } = await supabase
        .from('user_push_tokens')
        .update({
          platform: Platform.OS,
          device_name: Device.deviceName || `${Platform.OS} Device`,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingToken.id);

      if (updateError) {
        console.error('❌ Error updating existing token:', updateError);
        return null;
      }
      
      console.log('✅ Push token updated successfully');
    } else {
      // Token doesn't exist, insert new one
      const { error: insertError } = await supabase
        .from('user_push_tokens')
        .insert({
          user_id: userId,
          token: token,
          platform: Platform.OS,
          device_name: Device.deviceName || `${Platform.OS} Device`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        // If it's a duplicate key error, that's fine - another process might have inserted it
        if (insertError.code === '23505') {
          console.log('⚠️  Token already exists (inserted by another process), continuing...');
        } else {
          console.error('❌ Error inserting push token:', insertError);
          return null;
        }
      } else {
        console.log('✅ Push token registered successfully');
      }
    }

    return token;
  } catch (error) {
    console.error('❌ Error registering push token:', error);
    return null;
  }
}

// Setup notification channels for Android
const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    // Default channel for general notifications
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Varsayılan',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f0a500',
      sound: 'default',
    });

    // High priority channel for bids
    await Notifications.setNotificationChannelAsync('bids', {
      name: 'Teklifler',
      description: 'Yeni teklifler ve teklif güncellemeleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f0a500',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
    });

    // Medium priority channel for messages
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mesajlar',
      description: 'Yeni mesajlar ve sohbet bildirimleri',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#f0a500',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
    });

    // Low priority channel for general updates
    await Notifications.setNotificationChannelAsync('updates', {
      name: 'Güncellemeler',
      description: 'İlan güncellemeleri ve hatırlatmalar',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 100],
      lightColor: '#f0a500',
      sound: 'default',
    });

    console.log('✅ Android notification channels configured');
  }
};

// Get the appropriate channel for notification type
const getChannelForType = (type: NotificationData['type']): string => {
  switch (type) {
    case 'new_bid':
    case 'bid_accepted':
    case 'bid_rejected':
    case 'bid_countered':
      return 'bids';
    case 'new_message':
      return 'messages';
    case 'listing_sold':
    case 'listing_expired':
    case 'reminder':
      return 'updates';
    default:
      return 'default';
  }
};

// Register for push notifications and get token
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const pushTokenString = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      console.log('✅ Push token obtained:', pushTokenString);
      token = pushTokenString;
    } catch (error) {
      console.log('❌ Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Main notification service class
class NotificationService {
  private isInitialized = false;
  private pushToken: string | null = null;
  private userId: string | null = null;

  async initialize(userId?: string) {
    if (this.isInitialized) return this.pushToken;

    try {
      console.log('📱 Initializing notification service...');
      
      // Store user ID for token registration
      if (userId) {
        this.userId = userId;
      }
      
      // Setup notification channels for Android
      await setupNotificationChannels();
      
      // Register for push notifications
      this.pushToken = await registerForPushNotificationsAsync();
      
      // Store push token in database if we have both token and user
      if (this.pushToken && this.userId) {
        await this.storePushToken(this.pushToken, this.userId);
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
      return this.pushToken;
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
      return null;
    }
  }

  async storePushToken(token: string, userId: string) {
    try {
      // First, try to find existing token for this user+token combination
      const { data: existingToken, error: selectError } = await supabase
        .from('user_push_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('token', token)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing token:', selectError);
        return;
      }

      if (existingToken) {
        // Token already exists, just update it
        const { error: updateError } = await supabase
          .from('user_push_tokens')
          .update({
            platform: Platform.OS,
            device_name: Device.deviceName || `${Platform.OS} Device`,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingToken.id);

        if (updateError) {
          console.error('Error updating existing token:', updateError);
        } else {
          console.log('✅ Push token updated successfully');
        }
      } else {
        // Token doesn't exist, insert new one
        const { error: insertError } = await supabase
          .from('user_push_tokens')
          .insert({
            user_id: userId,
            token: token,
            platform: Platform.OS,
            device_name: Device.deviceName || `${Platform.OS} Device`,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          // If it's a duplicate key error, that's fine - another process might have inserted it
          if (insertError.code === '23505') {
            console.log('⚠️  Token already exists (inserted by another process), continuing...');
          } else {
            console.error('Error storing push token:', insertError);
          }
        } else {
          console.log('✅ Push token stored successfully');
        }
      }
    } catch (error) {
      console.error('Error in storePushToken:', error);
    }
  }

  async sendLocalNotification(
    title: string, 
    body: string, 
    data?: any, 
    type: NotificationData['type'] = 'reminder'
  ) {
    try {
      const channelId = getChannelForType(type);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Local notification sent');
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  async sendPushNotification(
    recipientUserId: string,
    title: string,
    body: string,
    data?: any,
    type: NotificationData['type'] = 'reminder'
  ) {
    try {
      console.log('📤 Sending push notification to user:', recipientUserId);
      
      // Get recipient's push tokens
      const { data: tokens, error } = await supabase
        .from('user_push_tokens')
        .select('token, platform')
        .eq('user_id', recipientUserId);

      if (error) {
        console.error('❌ Error fetching push tokens:', error);
        return;
      }

      if (!tokens || tokens.length === 0) {
        console.log('📭 No push tokens found for user:', recipientUserId);
        return;
      }

      console.log(`📱 Found ${tokens.length} push tokens for user`);

      // Send push notification to each token
      for (const tokenData of tokens) {
        try {
          const message = {
            to: tokenData.token,
            sound: 'default',
            title: title,
            body: body,
            data: data || {},
            channelId: tokenData.platform === 'android' ? getChannelForType(type) : undefined,
          };

          console.log('📤 Sending push message:', { to: tokenData.token.substring(0, 20) + '...', title });

          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          });

          const result = await response.json();
          
          if (result.data && result.data.status === 'ok') {
            console.log('✅ Push notification sent successfully');
          } else {
            console.error('❌ Push notification failed:', result);
          }
        } catch (tokenError) {
          console.error('❌ Error sending to token:', tokenError);
        }
      }
    } catch (error) {
      console.error('❌ Error in sendPushNotification:', error);
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

  // Get push token
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Re-initialize if needed
  async reinitialize(userId: string) {
    this.isInitialized = false;
    this.userId = userId;
    return await this.initialize(userId);
  }
}

export const notificationService = new NotificationService();

// React Hook for notifications with real database integration
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
    queryFn: async (): Promise<NotificationData[]> => {
      if (!user?.id) {
        console.log('📱 No user ID, returning empty notifications');
        return [];
      }

      try {
        console.log('📱 Fetching notifications from database...');
        console.log('📱 User ID:', user.id);
        console.log('📱 Query parameters check...');
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        console.log('📱 Raw query response:', { data: data?.length, error });

        if (error) {
          console.error('❌ Database error fetching notifications:', error);
          console.log('📱 Error details:', JSON.stringify(error, null, 2));
          // Return empty array on error but log it properly
          return [];
        }

        console.log(`✅ Fetched ${data?.length || 0} notifications`);
        if (data && data.length > 0) {
          console.log('📱 First notification:', data[0]);
        }
        return data || [];
      } catch (error) {
        console.error('❌ Exception fetching notifications:', error);
        console.log('📱 Exception details:', JSON.stringify(error, null, 2));
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize notification service when user changes
  React.useEffect(() => {
    if (user?.id) {
      console.log('📱 User changed, initializing notification service for:', user.id);
      notificationService.initialize(user.id);
      
      // Register global refresh function
      setGlobalNotificationRefresh(refetch);
      
      // Force immediate refresh of notifications when user changes
      setTimeout(() => {
        console.log('📱 Forcing notification refresh for user:', user.id);
        refetch();
      }, 1000);
    }
  }, [user?.id, refetch]);

  const unreadCount = notifications.filter((n: NotificationData) => !n.read).length;

  // Update badge count when unread count changes
  React.useEffect(() => {
    notificationService.updateBadgeCount(unreadCount);
  }, [unreadCount]);

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('📱 Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Optimistically update the cache
      queryClient.setQueryData(
        ['notifications', user?.id],
        (oldData: NotificationData[] | undefined) =>
          oldData?.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true, read_at: new Date().toISOString() }
              : notification
          ) || []
      );

      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('📱 Marking all notifications as read');
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update cache and clear badge
      queryClient.setQueryData(
        ['notifications', user?.id],
        (oldData: NotificationData[] | undefined) =>
          oldData?.map(notification => ({
            ...notification,
            read: true,
            read_at: new Date().toISOString()
          })) || []
      );

      await notificationService.clearBadge();
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Set up real-time subscription for new notifications
  React.useEffect(() => {
    if (!user?.id) return;

    console.log('📱 Setting up real-time notification subscription for user:', user.id);

    const subscription = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('📱 New notification received via real-time:', payload.new);
          
          // Force refresh from database to ensure consistency
          console.log('📱 Forcing notification refetch due to real-time update');
          refetch();
          
          // Also update cache optimistically
          queryClient.setQueryData(
            ['notifications', user?.id],
            (oldData: NotificationData[] | undefined) => {
              const newNotification = payload.new as NotificationData;
              return [newNotification, ...(oldData || [])];
            }
          );

          // Show local notification
          const newNotification = payload.new as NotificationData;
          notificationService.sendLocalNotification(
            newNotification.title,
            newNotification.body,
            newNotification.data,
            newNotification.type
          );
        }
      )
      .subscribe((status) => {
        console.log('📱 Subscription status:', status);
      });

    return () => {
      console.log('📱 Unsubscribing from notification updates');
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient, refetch]);

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

// Initialize the service on module load
console.log('📱 Notification service module loaded');

// Global notification refresh function that can be called from other modules
let globalNotificationRefresh: (() => void) | null = null;

export const setGlobalNotificationRefresh = (refetchFn: () => void) => {
  globalNotificationRefresh = refetchFn;
};

export const triggerGlobalNotificationRefresh = () => {
  if (globalNotificationRefresh) {
    console.log('📱 Triggering global notification refresh');
    globalNotificationRefresh();
  } else {
    console.log('📱 Global notification refresh not available');
  }
};