// App initialization to register push tokens
// This should be called when the user logs in or when the app starts
import { registerPushToken } from '../services/notifications';
import { useAuth } from '../state/AuthProvider';
import { useEffect } from 'react';

export function usePushNotificationSetup() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      console.log('🔔 Setting up push notifications for user:', user.id);
      registerPushToken(user.id);
    }
  }, [user?.id]);
}