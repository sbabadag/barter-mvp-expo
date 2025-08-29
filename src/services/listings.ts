import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  created_at: string;
};

export const useListings = () => useQuery({
  queryKey: ["listings"],
  queryFn: async () => {
    if (supabaseConfig.isPlaceholder) {
      // Return mock data for development/testing
      const mockListings: Listing[] = [
        {
          id: "mock_1",
          title: "iPhone 13 Pro",
          description: "Çok temiz kullanılmış iPhone 13 Pro. Kılıf ve ekran koruyucu ile birlikte verilecek.",
          price: 25000,
          created_at: new Date().toISOString()
        },
        {
          id: "mock_2", 
          title: "Bisiklet - Trek FX3",
          description: "Az kullanılmış şehir bisikleti. Tüm bakımları yapılmış durumda.",
          price: null, // Takas
          created_at: new Date().toISOString()
        },
        {
          id: "mock_3",
          title: "MacBook Air M2",
          description: "2022 model MacBook Air, 8GB RAM, 256GB SSD. Orijinal kutusu mevcut.",
          price: 35000,
          created_at: new Date().toISOString()
        }
      ];
      
      console.log("Mock: Returning mock listings data");
      return mockListings;
    }

    const { data, error } = await supabase.from("listings").select("id, title, description, price, created_at").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return data as Listing[];
  }
});

export const useListing = (id: string) => useQuery({
  queryKey: ["listing", id],
  queryFn: async () => {
    if (supabaseConfig.isPlaceholder) {
      // Return mock data for development/testing
      const mockListing: Listing = {
        id: id,
        title: "Mock Listing",
        description: "Bu bir test ilanıdır. Gerçek Supabase bağlantısı kurulduğunda gerçek veriler görüntülenecektir.",
        price: id.includes("mock_2") ? null : 15000,
        created_at: new Date().toISOString()
      };
      
      console.log("Mock: Returning mock listing data for ID:", id);
      return mockListing;
    }

    const { data, error } = await supabase.from("listings").select("id, title, description, price, created_at").eq("id", id).single();
    if (error) throw error;
    return data as Listing;
  }
});

export const createListing = async (input: { title: string; description: string; price: number | null; imageUris: string[]; }) => {
  console.log("createListing called with input:", input);
  console.log("Supabase configuration:", {
    url: supabaseConfig.url,
    isPlaceholder: supabaseConfig.isPlaceholder
  });
  
  if (supabaseConfig.isPlaceholder) {
    // Mock implementation for development/testing
    console.log("Mock: Creating listing", input);
    console.log("Mock: Simulating network delay...");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock listing ID
    const mockListingId = `mock_${Date.now()}`;
    
    console.log("Mock: Listing created successfully with ID:", mockListingId);
    
    // Return immediately, don't proceed to real Supabase code
    return mockListingId;
  }
  
  console.log("Real Supabase: Proceeding with actual database insertion...");

  // Real Supabase implementation
  try {
    // Test için geçici seller_id null ile oluşturuyoruz
    const { data, error } = await supabase.from("listings").insert({ 
      title: input.title, 
      description: input.description, 
      price: input.price,
      seller_id: null // Test için - normalde gerçek user ID olacak
    }).select("id").single();
    if (error) throw error;
    const listingId = data.id;

    // upload images to storage bucket "listing-photos"
    for (let i = 0; i < input.imageUris.length; i++) {
      const uri = input.imageUris[i];
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const filePath = `${listingId}/${Date.now()}_${i}.jpg`;
      const { error: upErr } = await supabase.storage.from("listing-photos").upload(filePath, decode(base64), { contentType: "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      await supabase.from("listing_photos").insert({ listing_id: listingId, url: filePath, sort_order: i });
    }

    return listingId;
  } catch (error) {
    console.error("Real Supabase error:", error);
    throw error;
  }
};
