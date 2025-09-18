import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/state/AuthProvider";
import AuthGuard from "../src/components/AuthGuard";
import { notificationService } from "../src/services/notifications";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Mobil platformlarda notification service'i başlat
    if (Platform.OS !== 'web') {
      notificationService.initialize()
        .then(() => {
          console.log('📱 Notification service initialized successfully');
        })
        .catch((error) => {
          console.log('⚠️ Notification service initialization failed (app continues normally):', error.message);
        });
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
