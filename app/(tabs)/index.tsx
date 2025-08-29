import { View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useListings } from "../../src/services/listings";
import { Link } from "expo-router";

export default function FeedScreen() {
  const { data, isLoading, refetch } = useListings();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>Yakındaki İlanlar</Text>
      {isLoading ? <Text>Yükleniyor…</Text> : (
        <FlashList
          estimatedItemSize={120}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/listing/${item.id}`} asChild>
              <Pressable style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 10 }}>
                <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                <Text numberOfLines={2} style={{ color: "#444" }}>{item.description}</Text>
                <Text style={{ marginTop: 6, fontWeight: "600" }}>{item.price ? `${item.price} ₺` : "Takas"}</Text>
              </Pressable>
            </Link>
          )}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}
