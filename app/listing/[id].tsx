import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useListing } from "../../src/services/listings";

export default function ListingDetail(){
  const { id } = useLocalSearchParams<{id: string}>();
  const { data } = useListing(id!);

  if (!data) return <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}><Text>Yükleniyor...</Text></View>

  return (
    <View style={{ flex:1, padding:16, gap:8 }}>
      <Text style={{ fontSize: 22, fontWeight:"700" }}>{data.title}</Text>
      <Text>{data.description}</Text>
      <Text style={{ fontWeight:"700", marginTop:6 }}>{data.price ? `${data.price} ₺` : "Takas"}</Text>
      <View style={{ flexDirection:"row", gap:8, marginTop:12 }}>
        <Pressable style={{ padding:12, backgroundColor:"#111", borderRadius:12 }}>
          <Text style={{ color:"#fff" }}>Mesaj Gönder</Text>
        </Pressable>
        <Pressable style={{ padding:12, backgroundColor:"#16a34a", borderRadius:12 }}>
          <Text style={{ color:"#fff" }}>Teklif Ver</Text>
        </Pressable>
      </View>
    </View>
  )
}
