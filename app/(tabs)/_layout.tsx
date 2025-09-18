import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useNotifications } from "../../src/services/notifications";
import { TabBadge } from "../../src/components/NotificationBadge";
import { usePushNotificationSetup } from "../../src/hooks/usePushNotificationSetup";

export default function TabsLayout() {
  const { unreadCount } = useNotifications();
  
  // Set up push notifications when user is authenticated
  usePushNotificationSetup();

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        // Web'de mobil gibi tab bar boyutu
        ...(Platform.OS === 'web' && {
          tabBarStyle: {
            maxWidth: 480,
            alignSelf: 'center',
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: '#e1e1e1',
            height: 60,
          },
        }),
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          tabBarLabel: "Keşfet", 
          tabBarIcon: ({color, size}) => <MaterialIcons name="explore" color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="store" 
        options={{ 
          tabBarLabel: "Mağaza", 
          tabBarIcon: ({color, size}) => <MaterialIcons name="store" color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="sell" 
        options={{ 
          tabBarLabel: "İlan Ver", 
          tabBarIcon: ({color, size}) => <MaterialIcons name="add-box" color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="bids" 
        options={{ 
          tabBarLabel: "Tekliflerim", 
          tabBarIcon: ({color, size, focused}) => (
            <View style={{ position: 'relative' }}>
              <MaterialIcons name="local-offer" color={color} size={size} />
              <TabBadge count={unreadCount || 0} focused={focused} />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="inbox" 
        options={{ 
          tabBarLabel: "Mesajlar", 
          tabBarIcon: ({color, size}) => <MaterialIcons name="chat" color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          tabBarLabel: "Profil", 
          tabBarIcon: ({color, size}) => <MaterialIcons name="person" color={color} size={size} /> 
        }} 
      />
    </Tabs>
  )
}
