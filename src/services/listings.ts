import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
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

// Utility function to parse location string and extract coordinates
const parseLocationWithCoords = (locationString: string | null | undefined): { address: string; coords?: { latitude: number; longitude: number } } => {
  if (!locationString) return { address: '' };
  
  const coordsMarker = '|COORDS:';
  const coordsIndex = locationString.indexOf(coordsMarker);
  
  if (coordsIndex === -1) {
    return { address: locationString };
  }
  
  const address = locationString.substring(0, coordsIndex);
  const coordsJson = locationString.substring(coordsIndex + coordsMarker.length);
  
  try {
    const coords = JSON.parse(coordsJson);
    return { address, coords };
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return { address };
  }
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  created_at: string;
  image_url?: string; // Primary image URL
  images?: string[]; // Array of all image URLs
  currency?: string; // Currency code (TRY, USD, EUR)
  category?: string; // Product category
  location?: string; // Seller location (address text)
  locationCoords?: { latitude: number; longitude: number }; // GPS coordinates
  seller_name?: string; // Seller display name
  seller_id?: string; // Seller user ID for ratings
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'; // Item condition
  status?: 'active' | 'sold' | 'inactive'; // Listing status
  seller?: { // Seller profile information
    id: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    avatar_url?: string;
  };
};

export const useListings = () => useQuery({
  queryKey: ["listings"],
  queryFn: async () => {
    // Sadece placeholder config'de mock data kullan - web'de artık gerçek veri
    if (supabaseConfig.isPlaceholder) {
      // Return mock data for development/testing when Supabase not configured
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
          ],
          currency: 'TRY',
          category: 'Giyim',
          location: 'İstanbul',
          seller_name: 'solo',
          condition: 'good' as const,
          status: 'active' as const
        },
        {
          id: generateMockUUID("mock_2"), 
          title: "iPhone 13 Pro 128GB",
          description: "Excellent condition iPhone 13 Pro with original box and accessories",
          price: 18000,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=2",
          images: [
            "https://picsum.photos/300/400?random=2",
            "https://picsum.photos/300/400?random=21",
            "https://picsum.photos/300/400?random=22",
          ],
          currency: 'TRY',
          category: 'Elektronik',
          location: 'Ankara',
          seller_name: '3dmake',
          condition: 'like_new' as const,
          status: 'active' as const
        },
        {
          id: generateMockUUID("mock_3"),
          title: "Nike Air Max 90 Spor Ayakkabı",
          description: "Orijinal Nike Air Max 90 ayakkabı, 42 numara",
          price: 1200,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=3",
          images: [
            "https://picsum.photos/300/400?random=3",
            "https://picsum.photos/300/400?random=31",
            "https://picsum.photos/300/400?random=32",
            "https://picsum.photos/300/400?random=33",
            "https://picsum.photos/300/400?random=34",
          ],
          currency: 'TRY',
          category: 'Ayakkabı',
          location: 'İzmir',
          seller_name: 'emirfashionn',
          condition: 'good' as const,
          status: 'active' as const
        },
        {
          id: generateMockUUID("mock_4"),
          title: "Vintage Deri Çanta",
          description: "Hakiki deri vintage tarzı el çantası",
          price: 450,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=4",
          images: [
            "https://picsum.photos/300/400?random=4",
            "https://picsum.photos/300/400?random=41",
          ],
          currency: 'TRY',
          category: 'Çanta',
          location: 'Bursa',
          seller_name: 'vintage_store',
          condition: 'fair' as const,
          status: 'active' as const
        },
        {
          id: generateMockUUID("mock_5"),
          title: "MacBook Air M2 2022",
          description: "13 inch MacBook Air with M2 chip, 8GB RAM, 256GB SSD",
          price: 25000,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=5",
          images: [
            "https://picsum.photos/300/400?random=5",
            "https://picsum.photos/300/400?random=51",
            "https://picsum.photos/300/400?random=52",
          ],
          currency: 'TRY',
          category: 'Elektronik',
          location: 'İstanbul',
          seller_name: 'tech_guru',
          condition: 'like_new' as const,
          status: 'active' as const
        },
        {
          id: generateMockUUID("mock_6"),
          title: "Harry Potter Kitap Seti",
          description: "Tam set Harry Potter kitapları, orijinal İngilizce",
          price: 300,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=6",
          images: [
            "https://picsum.photos/300/400?random=6",
            "https://picsum.photos/300/400?random=61",
            "https://picsum.photos/300/400?random=62",
          ],
          currency: 'TRY',
          category: 'Kitap',
          location: 'Ankara',
          seller_name: 'book_lover',
          condition: 'good' as const,
          status: 'active' as const
        },
        {
          id: generateMockUUID("mock_7"),
          title: "Yoga Matı ve Aksesuarları",
          description: "Premium yoga matı, blok ve kayış seti",
          price: 200,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=7",
          images: [
            "https://picsum.photos/300/400?random=7",
            "https://picsum.photos/300/400?random=71",
            "https://picsum.photos/300/400?random=72",
            "https://picsum.photos/300/400?random=73",
          ],
          currency: 'TRY',
          category: 'Spor',
          location: 'İzmir',
          seller_name: 'fitness_life',
          condition: 'new' as const,
          status: 'active' as const
        },
        {
          id: generateMockUUID("mock_8"),
          title: "Kahve Makinesi Delonghi",
          description: "Otomatik espresso kahve makinesi, az kullanılmış",
          price: 1500,
          created_at: new Date().toISOString(),
          image_url: "https://picsum.photos/300/400?random=8",
          images: [
            "https://picsum.photos/300/400?random=8",
            "https://picsum.photos/300/400?random=81",
            "https://picsum.photos/300/400?random=82",
          ],
          currency: 'TRY',
          category: 'Ev & Yaşam',
          location: 'Antalya',
          seller_name: 'coffee_master',
          condition: 'like_new' as const,
          status: 'active' as const
        }
      ];
      
      // Combine user-created listings (newest first) with mock data
      const allListings = [...newListings, ...mockListings];
      
      console.log(`Mock: Returning ${allListings.length} listings (${newListings.length} user-created, ${mockListings.length} mock)`);
      console.log("Mock: User listings will appear first, showing real photos and data");
      return allListings;
    }

    // Mobil platformlarda Supabase kullan - seller bilgileri de dahil
    const { data, error } = await supabase.from("listings").select(`
      id, 
      title, 
      description, 
      price, 
      currency,
      category,
      location,
      seller_id,
      condition,
      status,
      images,
      created_at
    `).eq("status", "active").order("created_at", { ascending: false }).limit(100);
    
    if (error) {
      console.error('❌ Listings query error:', error.message);
      throw error;
    }
    
    console.log('✅ Listings loaded:', data?.length || 0, 'items');
    
    // Transform the data to include the primary image URL from the images array and parse location coordinates
    const transformedData = await Promise.all(data?.map(async (item) => {
      const locationInfo = parseLocationWithCoords(item.location);
      
      // Get seller name from profiles table using seller_id
      let seller_name = 'İsimsiz Kullanıcı';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, first_name, last_name')
          .eq('id', item.seller_id)
          .single();
        
        if (profile) {
          seller_name = profile.display_name || 
                       `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
                       'İsimsiz Kullanıcı';
        }
      } catch (error) {
        console.log('Profile not found for seller:', item.seller_id);
      }
      
      return {
        ...item,
        location: locationInfo.address, // Clean address without coordinates
        locationCoords: locationInfo.coords, // Parsed coordinates
        image_url: item.images && Array.isArray(item.images) && item.images.length > 0 
          ? item.images[0] 
          : `https://picsum.photos/300/400?random=${item.id.slice(-3)}`,
        images: item.images || [],
        seller_name: seller_name
      };
    }) || []);
    
    return transformedData as Listing[];
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchOnWindowFocus: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
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

    const { data, error } = await supabase.from("listings").select(`
      id, 
      title, 
      description, 
      price, 
      currency,
      category,
      location,
      seller_id,
      condition,
      status,
      images,
      created_at
    `).eq("id", id).single();
    if (error) throw error;
    if (!data) throw new Error("Listing not found");
    
    // Transform the data to include the primary image URL from the images array and parse location coordinates
    const locationInfo = parseLocationWithCoords(data.location);
    const transformedListing = {
      ...data,
      location: locationInfo.address, // Clean address without coordinates
      locationCoords: locationInfo.coords, // Parsed coordinates
      image_url: data.images && Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] 
        : `https://picsum.photos/300/400?random=${data.id.slice(-3)}`,
      images: data.images || [],
      seller_name: `Kullanıcı ${data.seller_id?.slice(-4) || 'xxxx'}` // Simple seller name from ID
    };
    
    return transformedListing as Listing;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchOnWindowFocus: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
});

export const createListing = async (
  input: { 
    title: string; 
    description: string; 
    price: number | null; 
    imageUris: string[];
    category?: string;
    location?: string;
    locationCoords?: { latitude: number; longitude: number };
    condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  },
  onProgress?: (progress: number, message: string) => void
) => {
  console.log("createListing called with input:", input);
  console.log("Supabase configuration:", {
    url: supabaseConfig.url,
    isPlaceholder: supabaseConfig.isPlaceholder
  });
  
  if (supabaseConfig.isPlaceholder) {
    // Mock implementation for development/testing
    console.log("Mock: Creating listing", input);
    onProgress?.(10, "Listing oluşturuluyor...");
    
    // Get current user for mock mode too
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user ? await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single() : { data: null };
      
    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Kullanıcı';
    
    // Simulate network delay with progress updates
    await new Promise(resolve => setTimeout(resolve, 500));
    onProgress?.(50, "Görüntüler işleniyor...");
    
    await new Promise(resolve => setTimeout(resolve, 500));
    onProgress?.(90, "Listing kaydediliyor...");
    
    await new Promise(resolve => setTimeout(resolve, 300));
    onProgress?.(100, "Tamamlandı!");
    
    // Generate a mock listing ID
    const mockListingId = `user_${Date.now()}`;
    
    // Create a new listing object with the user's real data
    const newListing: Listing = {
      id: mockListingId,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: 'TRY',
      category: input.category || 'Genel',
      location: input.location || 'İstanbul',
      locationCoords: input.locationCoords,
      seller_name: displayName, // Real user display name
      condition: input.condition || 'good',
      status: 'active',
      created_at: new Date().toISOString(),
      image_url: input.imageUris[0] || `https://picsum.photos/300/400?random=${mockListingId}`, 
      images: input.imageUris.length > 0 ? input.imageUris : [`https://picsum.photos/300/400?random=${mockListingId}`]
    };
    
    // Add to our local storage (at the beginning so it appears first)
    newListings.unshift(newListing);
    
    console.log("Mock: Listing created successfully with ID:", mockListingId);
    console.log("Mock: User data will be shown in listings");
    
    // Return immediately, don't proceed to real Supabase code
    return mockListingId;
  }

  console.log("Real Supabase: Proceeding with actual database insertion...");
  onProgress?.(5, "Başlıyor...");

  // Real Supabase implementation
  try {
    // Get current user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Kullanıcı girişi gerekli");
    }

    // Get user profile for display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    const displayName = profile?.display_name || user.email?.split('@')[0] || 'Kullanıcı';

    // First upload images to storage and get URLs
    const uploadedImageUrls: string[] = [];
    const totalImages = input.imageUris.length;
    
    onProgress?.(10, `${totalImages} görüntü yükleniyor...`);
    
    for (let i = 0; i < input.imageUris.length; i++) {
      const uri = input.imageUris[i];
      const imageProgress = 10 + ((i / totalImages) * 70); // 10-80% for images
      onProgress?.(imageProgress, `Görüntü ${i + 1}/${totalImages} yükleniyor...`);
      
      console.log(`Uploading image ${i + 1}/${input.imageUris.length}...`);
      
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        
        // Generate unique filename
        const fileExtension = uri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${i}.${fileExtension}`;
        const filePath = `listings/${fileName}`;
        
        // Upload to Supabase storage
        const uploadResult = await supabase.storage
          .from("listing-photos")
          .upload(filePath, decode(base64), { 
            contentType: `image/${fileExtension}`,
            upsert: true 
          });
        
        if (uploadResult.error) {
          console.error(`Error uploading image ${i + 1}:`, uploadResult.error);
          throw uploadResult.error;
        }
        
        // Get public URL using config URL
        const publicUrl = `${supabaseConfig.url}/storage/v1/object/public/listing-photos/${filePath}`;
        uploadedImageUrls.push(publicUrl);
        console.log(`Image ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        // Continue with other images even if one fails
      }
    }

    onProgress?.(85, "Listing kaydediliyor...");

    // Create the listing with uploaded image URLs and user info
    // LocationCoords'u location string'ine JSON formatında dahil et
    let locationWithCoords = input.location || null;
    if (input.locationCoords && input.location) {
      // Location string'ine coordinates'ı ekle
      locationWithCoords = `${input.location}|COORDS:${JSON.stringify(input.locationCoords)}`;
    }

    const { data, error } = await supabase.from("listings").insert({ 
      title: input.title, 
      description: input.description, 
      price: input.price,
      category: input.category || null,
      location: locationWithCoords,
      condition: input.condition || null,
      currency: 'TRY',
      status: 'active',
      images: uploadedImageUrls, // Store array of image URLs
      image_url: uploadedImageUrls[0] || null, // Primary image
      seller_id: user.id, // Current user ID
    }).select("id").single();
    
    if (error) throw error;
    if (!data) throw new Error("Failed to create listing");
    
    onProgress?.(100, "Tamamlandı!");
    
    console.log("Listing created successfully with ID:", data.id);
    console.log("Images uploaded:", uploadedImageUrls.length);
    console.log("Seller ID:", user.id);
    
    return data.id;
  } catch (error) {
    console.error("Real Supabase error:", error);
    throw error;
  }
};
