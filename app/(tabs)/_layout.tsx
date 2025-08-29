import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ tabBarLabel: "Keşfet", tabBarIcon: ({color, size}) => <MaterialIcons name="explore" color={color} size={size} /> }} />
      <Tabs.Screen name="sell" options={{ tabBarLabel: "İlan Ver", tabBarIcon: ({color, size}) => <MaterialIcons name="add-box" color={color} size={size} /> }} />
      <Tabs.Screen name="inbox" options={{ tabBarLabel: "Mesajlar", tabBarIcon: ({color, size}) => <MaterialIcons name="chat" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: "Profil", tabBarIcon: ({color, size}) => <MaterialIcons name="person" color={color} size={size} /> }} />
    </Tabs>
  )
}
