import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/state/AuthProvider";
import AuthGuard from "../src/components/AuthGuard";
import { notificationService } from "../src/services/notifications";
import { initializeFirebase } from "../src/utils/firebase";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Initialize Firebase for Android development builds (optional)
    const initFirebase = async () => {
      const firebaseApp = await initializeFirebase();
      if (firebaseApp) {
        console.log('🔥 Firebase initialized successfully for push notifications');
      } else {
        console.log('📱 App will use Expo Push notifications instead of FCM');
      }
    };
    
    initFirebase();
    
    // Mobil platformlarda notification service'i başlat
    if (Platform.OS !== 'web') {
      notificationService.initialize()
        .then((token) => {
          if (token) {
            console.log('📱 Notification service initialized successfully');
          } else {
            console.log('📱 Notification service initialized without push token (this is normal in development)');
          }
        })
        .catch((error) => {
          console.log('⚠️ Notification service initialization failed (app continues normally):', error.message);
        });
      
      // Android için notification channels setup
      notificationService.setupAndroidChannels().catch((error) => {
        console.log('📱 Android notification channels setup skipped:', error);
      });
      
      // Notification listeners
      const notificationListener = notificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('📥 Notification received:', notification);
        }
      );
      
      const responseListener = notificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log('👆 Notification response:', response);
          // Burada notification'a tıklama ile navigasyon yapılabilir
        }
      );
      
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    }
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {Platform.OS === 'web' ? (
          // Web'de AuthGuard olmadan direkt çalıştır ama AuthProvider'ı kullan
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="listing/[id]" />
          </Stack>
        ) : (
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="listing/[id]" />
            </Stack>
          </AuthGuard>
        )}
      </QueryClientProvider>
    </AuthProvider>
  );
}
