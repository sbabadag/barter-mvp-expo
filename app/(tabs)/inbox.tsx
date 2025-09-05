import { View, Text, Platform, StyleSheet } from "react-native";

export default function InboxScreen(){
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mesajlar (yakında)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#ffffff',
    // Web responsive tasarımı
    ...(Platform.OS === 'web' && {
      maxWidth: 480,
      alignSelf: 'center',
      width: '100%',
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: '#e1e1e1',
    }),
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
});
