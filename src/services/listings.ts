import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { 
  createOptimizedVersions, 
  optimizeProfileImage,
  ImageOptimizationResult,
  calculateCompressionRatio,
  formatFileSize 
} from "./imageOptimization";

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
  image_url?: string; // Primary image URL (fallback)
  images?: string[]; // Array of all image URLs (legacy)
  thumbnail_url?: string; // Optimized thumbnail (150x150)
  medium_url?: string; // Optimized medium (400x400) 
  full_url?: string; // Optimized full size (800x800)
  image_metadata?: any; // Image optimization metadata
  currency?: string; // Currency code (TRY, USD, EUR)
  category?: string; // Product category
  location?: string; // Seller location
  seller_name?: string; // Seller display name
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'; // Item condition
  status?: 'active' | 'sold' | 'inactive'; // Listing status
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

    const { data, error } = await supabase.from("listings").select(`
      id, 
      title, 
      description, 
      price, 
      currency,
      category,
      location,
      seller_name,
      condition,
      status,
      images,
      created_at
    `).eq("status", "active").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    
    // Transform the data to include the primary image URL from the images array
    const transformedData = data?.map(item => ({
      ...item,
      image_url: item.images && Array.isArray(item.images) && item.images.length > 0 
        ? item.images[0] 
        : `https://picsum.photos/300/400?random=${item.id.slice(-3)}`,
      images: item.images || []
    }));
    
    return transformedData as Listing[];
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

    const { data, error } = await supabase.from("listings").select(`
      id, 
      title, 
      description, 
      price, 
      currency,
      category,
      location,
      seller_name,
      condition,
      status,
      images,
      created_at
    `).eq("id", id).single();
    if (error) throw error;
    if (!data) throw new Error("Listing not found");
    
    // Transform the data to include the primary image URL from the images array
    const transformedListing = {
      ...data,
      image_url: data.images && Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] 
        : `https://picsum.photos/300/400?random=${data.id.slice(-3)}`,
      images: data.images || []
    };
    
    return transformedListing as Listing;
  }
});

export const createListing = async (
  input: { 
    title: string; 
    description: string; 
    price: number | null; 
    imageUris: string[];
    category?: string;
    location?: string;
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
      seller_name: 'Sen', // Current user
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
    // First optimize and upload images to storage
    const uploadedImageUrls: string[] = [];
    const optimizedThumbnails: string[] = [];
    const optimizedMedium: string[] = [];
    const optimizedFull: string[] = [];
    let combinedMetadata: any[] = [];
    
    const totalImages = input.imageUris.length;
    onProgress?.(10, `${totalImages} görüntü optimize ediliyor...`);
    
    for (let i = 0; i < input.imageUris.length; i++) {
      const uri = input.imageUris[i];
      const baseProgress = 10 + ((i / totalImages) * 70); // 10-80% for images
      
      try {
        // Step 1: Optimize images (10% of this image's progress)
        onProgress?.(baseProgress, `Görüntü ${i + 1}/${totalImages} optimize ediliyor...`);
        
        const optimizedResult = await createOptimizedVersions(uri, (progress, message) => {
          const currentProgress = baseProgress + (progress * 0.1); // 10% for optimization
          onProgress?.(currentProgress, `${message} (${i + 1}/${totalImages})`);
        });

        // Calculate compression ratio for metadata
        const compressionRatio = calculateCompressionRatio(
          optimizedResult.original.size,
          optimizedResult.full.size
        );

        // Step 2: Upload optimized versions (60% of this image's progress)
        const uploadProgress = baseProgress + 10;
        onProgress?.(uploadProgress, `Görüntü ${i + 1}/${totalImages} yükleniyor...`);

        // Generate unique filenames
        const timestamp = Date.now();
        const baseFileName = `${timestamp}_${i}`;

        // Upload thumbnail
        const thumbnailBase64 = await FileSystem.readAsStringAsync(optimizedResult.thumbnail.uri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        const thumbnailPath = `listings/${baseFileName}_thumb.jpg`;
        
        const thumbnailUpload = await supabase.storage
          .from("listing-photos")
          .upload(thumbnailPath, decode(thumbnailBase64), { 
            contentType: "image/jpeg",
            upsert: true 
          });

        if (thumbnailUpload.error) throw thumbnailUpload.error;

        // Upload medium size
        const mediumBase64 = await FileSystem.readAsStringAsync(optimizedResult.medium.uri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        const mediumPath = `listings/${baseFileName}_med.jpg`;
        
        const mediumUpload = await supabase.storage
          .from("listing-photos")
          .upload(mediumPath, decode(mediumBase64), { 
            contentType: "image/jpeg",
            upsert: true 
          });

        if (mediumUpload.error) throw mediumUpload.error;

        // Upload full size
        const fullBase64 = await FileSystem.readAsStringAsync(optimizedResult.full.uri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        const fullPath = `listings/${baseFileName}_full.jpg`;
        
        const fullUpload = await supabase.storage
          .from("listing-photos")
          .upload(fullPath, decode(fullBase64), { 
            contentType: "image/jpeg",
            upsert: true 
          });

        if (fullUpload.error) throw fullUpload.error;

        // Generate public URLs
        const thumbnailUrl = `${supabaseConfig.url}/storage/v1/object/public/listing-photos/${thumbnailPath}`;
        const mediumUrl = `${supabaseConfig.url}/storage/v1/object/public/listing-photos/${mediumPath}`;
        const fullUrl = `${supabaseConfig.url}/storage/v1/object/public/listing-photos/${fullPath}`;

        // Store URLs
        optimizedThumbnails.push(thumbnailUrl);
        optimizedMedium.push(mediumUrl);
        optimizedFull.push(fullUrl);
        uploadedImageUrls.push(fullUrl); // Use full URLs for legacy images array

        // Store metadata
        combinedMetadata.push({
          original: optimizedResult.original,
          thumbnail: { 
            url: thumbnailUrl, 
            width: optimizedResult.thumbnail.width,
            height: optimizedResult.thumbnail.height,
            size: optimizedResult.thumbnail.size
          },
          medium: { 
            url: mediumUrl,
            width: optimizedResult.medium.width,
            height: optimizedResult.medium.height,
            size: optimizedResult.medium.size
          },
          full: { 
            url: fullUrl,
            width: optimizedResult.full.width,
            height: optimizedResult.full.height,
            size: optimizedResult.full.size
          },
          compression_ratio: compressionRatio,
          optimized_at: new Date().toISOString()
        });

        console.log(`Image ${i + 1} optimized and uploaded successfully`);
        console.log(`- Original: ${formatFileSize(optimizedResult.original.size)}`);
        console.log(`- Thumbnail: ${formatFileSize(optimizedResult.thumbnail.size)}`);
        console.log(`- Medium: ${formatFileSize(optimizedResult.medium.size)}`);
        console.log(`- Full: ${formatFileSize(optimizedResult.full.size)}`);
        console.log(`- Compression: ${compressionRatio}%`);

      } catch (error) {
        console.error(`Failed to optimize/upload image ${i + 1}:`, error);
        // Continue with other images even if one fails
        // For failed images, we'll skip adding to optimized arrays
      }
    }

    onProgress?.(85, "Listing kaydediliyor...");

    // Create the listing with uploaded image URLs
    const { data, error } = await supabase.from("listings").insert({ 
      title: input.title, 
      description: input.description, 
      price: input.price,
      category: input.category || null,
      location: input.location || null,
      condition: input.condition || null,
      currency: 'TRY',
      status: 'active',
      images: uploadedImageUrls, // Store array of full URLs (legacy)
      image_url: uploadedImageUrls[0] || null, // Primary image (legacy)
      thumbnail_url: optimizedThumbnails[0] || null, // Primary thumbnail
      medium_url: optimizedMedium[0] || null, // Primary medium image
      full_url: optimizedFull[0] || null, // Primary full image
      image_metadata: {
        images: combinedMetadata,
        total_images: combinedMetadata.length,
        total_original_size: combinedMetadata.reduce((sum, meta) => sum + meta.original.size, 0),
        total_optimized_size: combinedMetadata.reduce((sum, meta) => sum + meta.full.size, 0),
        avg_compression_ratio: combinedMetadata.length > 0 
          ? Math.round(combinedMetadata.reduce((sum, meta) => sum + meta.compression_ratio, 0) / combinedMetadata.length)
          : 0
      },
      seller_id: null // TODO: Get from current user when auth is implemented
    }).select("id").single();
    
    if (error) throw error;
    if (!data) throw new Error("Failed to create listing");
    
    onProgress?.(100, "Tamamlandı!");
    
    console.log("Listing created successfully with ID:", data.id);
    console.log("Images uploaded:", uploadedImageUrls.length);
    
    return data.id;
  } catch (error) {
    console.error("Real Supabase error:", error);
    throw error;
  }
};
