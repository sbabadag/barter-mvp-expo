import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../src/state/AuthProvider";

export default function ProfileScreen(){
  const { session, signInWithOtp, signOut } = useAuth()
  return (
    <View style={{ flex:1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Profil</Text>
      {session ? (
        <>
          <Text>Giriş yapıldı: {session.user?.email}</Text>
          <Pressable onPress={signOut} style={{ padding:12, backgroundColor:"#ef4444", borderRadius:12 }}>
            <Text style={{ color:"#fff", textAlign:"center" }}>Çıkış Yap</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text>E-posta ile tek kullanımlık şifre alarak giriş yapın.</Text>
          <Pressable onPress={() => signInWithOtp(prompt('E-posta adresi?') || '')} style={{ padding:12, backgroundColor:"#111", borderRadius:12 }}>
            <Text style={{ color:"#fff", textAlign:"center" }}>Giriş Bağlantısı Gönder</Text>
          </Pressable>
        </>
      )}
    </View>
  )
}
