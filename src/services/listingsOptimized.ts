import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";

// Lightweight listing fetch for immediate display
export const useListingQuick = (id: string) => useQuery({
  queryKey: ["listing-quick", id],
  queryFn: async () => {
    if (supabaseConfig.isPlaceholder) {
      // Return mock data for development - same as before but minimal
      return {
        id: id,
        title: id.includes("mock_1") ? "Midi sundress with shirring detail" : "Mock Listing",
        description: "Bu bir test ilanıdır.",
        price: 15000,
        created_at: new Date().toISOString(),
        image_url: `https://picsum.photos/300/400?random=${id.replace('mock_', '')}`,
        images: [
          `https://picsum.photos/300/400?random=${id.replace('mock_', '')}`,
          `https://picsum.photos/300/400?random=${id.replace('mock_', '')}1`,
          `https://picsum.photos/300/400?random=${id.replace('mock_', '')}2`,
        ],
        seller_id: `seller_${id.replace('mock_', '')}`,
        category: 'Giyim',
        condition: 'İyi',
        location: 'İstanbul',
        status: 'active'
      };
    }

    // Fetch only essential listing data first (no JOIN)
    const { data, error } = await supabase.from("listings").select(`
      id, 
      title, 
      description, 
      price, 
      currency,
      category,
      location,
      condition,
      status,
      images,
      created_at,
      seller_id
    `).eq("id", id).single();
    
    if (error) throw error;
    if (!data) throw new Error("Listing not found");
    
    return {
      ...data,
      image_url: data.images && Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] 
        : `https://picsum.photos/300/400?random=${data.id.slice(-3)}`,
      images: data.images || []
    };
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});

// Separate seller info fetch
export const useSellerProfile = (sellerId: string, enabled: boolean = true) => useQuery({
  queryKey: ["seller-profile", sellerId],
  queryFn: async () => {
    if (supabaseConfig.isPlaceholder) {
      return {
        id: sellerId,
        display_name: "Test Seller",
        first_name: "Test",
        last_name: "User",
        city: "İstanbul",
        avatar_url: null
      };
    }

    const { data, error } = await supabase.from("profiles").select(`
      id,
      display_name,
      first_name,
      last_name,
      city,
      avatar_url
    `).eq("id", sellerId).single();
    
    if (error) throw error;
    return data;
  },
  enabled: enabled && !!sellerId,
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 15 * 60 * 1000, // 15 minutes
});

export default { useListingQuick, useSellerProfile };
