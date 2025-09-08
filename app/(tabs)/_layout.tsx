import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabsLayout() {
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
          tabBarIcon: ({color, size}) => <MaterialIcons name="local-offer" color={color} size={size} /> 
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
