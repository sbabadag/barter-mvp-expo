import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

// Utility function to generate UUID-like strings for mock data
const generateMockUUID = (seed: string): string => {
  // Create consistent UUIDs for mock data so they don't change between renders
  const seeds = {
    'mock_1': '272b2de6-f9b3-4340-9c67-d13650b6b229',
    'mock_2': '9bfa692d-ebee-438f-afa2-6e63b8ea7053', 
    'mock_3': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'mock_4': 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'mock_5': 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    'mock_6': 'd4e5f6g7-h8i9-0123-defa-456789012345',
    'mock_7': 'e5f6g7h8-i9j0-1234-efab-567890123456',
    'mock_8': 'f6g7h8i9-j0k1-2345-fabc-678901234567'
  };
  return seeds[seed as keyof typeof seeds] || `${seed.replace('mock_', '')}-0000-0000-0000-000000000000`;
};

// In-memory storage for new listings (in a real app, this would be in a database)
let newListings: Listing[] = [];

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  created_at: string;
  image_url?: string; // Primary image URL
  images?: string[]; // Array of all image URLs
};

export const useListings = () => useQuery({
  queryKey: ["listings"],
  queryFn: async () => {
    if (supabaseConfig.isPlaceholder) {
      // Return mock data for development/testing
      const mockListings: Listing[] = [
        {
          id: generateMockUUID("mock_1"),
          title: "Midi sundress with shirring detail",
          description: "Beautiful floral midi dress perfect for summer",
          price: 29,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=1",
          images: [
            "https://picsum.photos/300/400?random=1",
            "https://picsum.photos/300/400?random=11",
            "https://picsum.photos/300/400?random=12",
            "https://picsum.photos/300/400?random=13",
          ]
        },
        {
          id: generateMockUUID("mock_2"), 
          title: "Midi sundress with ruched front",
          description: "Elegant mint green dress with ruched detailing",
          price: 18,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=2",
          images: [
            "https://picsum.photos/300/400?random=2",
            "https://picsum.photos/300/400?random=21",
            "https://picsum.photos/300/400?random=22",
          ]
        },
        {
          id: generateMockUUID("mock_3"),
          title: "Midi dress in pink ditsy floral",
          description: "Cute pink floral pattern midi dress",
          price: 14,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=3",
          images: [
            "https://picsum.photos/300/400?random=3",
            "https://picsum.photos/300/400?random=31",
            "https://picsum.photos/300/400?random=32",
            "https://picsum.photos/300/400?random=33",
            "https://picsum.photos/300/400?random=34",
          ]
        },
        {
          id: generateMockUUID("mock_4"),
          title: "Cami maxi dress in polka dot",
          description: "Classic black polka dot maxi dress",
          price: 25,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=4",
          images: [
            "https://picsum.photos/300/400?random=4",
            "https://picsum.photos/300/400?random=41",
          ]
        },
        {
          id: generateMockUUID("mock_5"),
          title: "Summer dress in yellow",
          description: "Bright yellow summer dress for warm days",
          price: 22,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=5",
          images: [
            "https://picsum.photos/300/400?random=5",
            "https://picsum.photos/300/400?random=51",
            "https://picsum.photos/300/400?random=52",
          ]
        },
        {
          id: generateMockUUID("mock_6"),
          title: "Casual blue midi dress",
          description: "Comfortable light blue midi dress",
          price: 20,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=6",
          images: [
            "https://picsum.photos/300/400?random=6",
            "https://picsum.photos/300/400?random=61",
            "https://picsum.photos/300/400?random=62",
          ]
        },
        {
          id: generateMockUUID("mock_7"),
          title: "Floral wrap dress",
          description: "Elegant wrap style dress with floral print",
          price: 32,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=7",
          images: [
            "https://picsum.photos/300/400?random=7",
            "https://picsum.photos/300/400?random=71",
            "https://picsum.photos/300/400?random=72",
            "https://picsum.photos/300/400?random=73",
          ]
        },
        {
          id: generateMockUUID("mock_8"),
          title: "Striped casual dress",
          description: "Navy and white striped casual dress",
          price: 26,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=8",
          images: [
            "https://picsum.photos/300/400?random=8",
            "https://picsum.photos/300/400?random=81",
            "https://picsum.photos/300/400?random=82",
          ]
        }
      ];
      
      // Combine mock listings with newly created ones
      const allListings = [...newListings, ...mockListings];
      
      console.log("Mock: Returning mock listings data with", newListings.length, "new listings");
      return allListings;
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
      // First check if it's a user-created listing
      const userListing = newListings.find(listing => listing.id === id);
      if (userListing) {
        console.log("Mock: Returning user-created listing for ID:", id);
        return userListing;
      }

      // Return mock data for development/testing
      const mockListing: Listing = {
        id: id,
        title: id.includes("mock_1") ? "Midi sundress with shirring detail" :
               id.includes("mock_2") ? "Midi sundress with ruched front" :
               id.includes("mock_3") ? "Midi dress in pink ditsy floral" :
               id.includes("mock_4") ? "Cami maxi dress in polka dot" :
               id.includes("mock_5") ? "Summer dress in yellow" :
               id.includes("mock_6") ? "Casual blue midi dress" :
               id.includes("mock_7") ? "Floral wrap dress" :
               id.includes("mock_8") ? "Striped casual dress" : "Mock Listing",
        description: id.includes("mock_2") ? "Elegant mint green dress with ruched detailing" :
                    id.includes("mock_3") ? "Cute pink floral pattern midi dress" :
                    id.includes("mock_4") ? "Classic black polka dot maxi dress" :
                    "Bu bir test ilanıdır. Gerçek Supabase bağlantısı kurulduğunda gerçek veriler görüntülenecektir.",
        price: id.includes("mock_2") ? null : 
               id.includes("mock_1") ? 29 :
               id.includes("mock_3") ? 14 :
               id.includes("mock_4") ? 25 :
               id.includes("mock_5") ? 22 :
               id.includes("mock_6") ? 20 :
               id.includes("mock_7") ? 32 :
               id.includes("mock_8") ? 26 : 15000,
        created_at: new Date().toISOString(),
        image_url: `https://picsum.photos/300/400?random=${id.replace('mock_', '')}`,
        images: [
          `https://picsum.photos/300/400?random=${id.replace('mock_', '')}`,
          `https://picsum.photos/300/400?random=${id.replace('mock_', '')}1`,
          `https://picsum.photos/300/400?random=${id.replace('mock_', '')}2`,
          `https://picsum.photos/300/400?random=${id.replace('mock_', '')}3`,
        ]
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
    const mockListingId = `user_${Date.now()}`;
    
    // Create a new listing object with the user's data
    const newListing: Listing = {
      id: mockListingId,
      title: input.title,
      description: input.description,
      price: input.price,
      created_at: new Date().toISOString(),
      image_url: input.imageUris[0] || `https://picsum.photos/300/400?random=${mockListingId}`, // Use first image or fallback
      images: input.imageUris.length > 0 ? input.imageUris : [`https://picsum.photos/300/400?random=${mockListingId}`] // Store all images
    };
    
    // Add to our local storage (at the beginning so it appears first)
    newListings.unshift(newListing);
    
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
