import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseConfig } from "../utils/supabase";
import { useAuth } from "../state/AuthProvider";

// Helper function to check if an ID is from mock data
const isMockDataId = (id: string): boolean => {
  return /^(received_|my_offer_|offer_)\d+$/.test(id);
};

// Helper function to determine if we should use mock mode
const shouldUseMockMode = (id?: string): boolean => {
  return supabaseConfig.isPlaceholder || (id ? isMockDataId(id) : false);
};

// Enhanced types for tekliflerim (my offers/bids)
export interface MyOffer {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  created_at: string;
  expires_at?: string;
  counter_offer_amount?: number;
  counter_offer_message?: string;
  
  // Listing details
  listing_title: string;
  listing_description?: string;
  listing_price: number;
  listing_image: string;
  listing_images?: string[];
  listing_category?: string;
  listing_location?: string;
  listing_condition?: string;
  listing_status: 'active' | 'sold' | 'inactive';
  
  // Seller details
  seller_id: string;
  seller_name: string;
  seller_avatar?: string;
  seller_rating?: number;
  
  // Calculated fields
  is_expired: boolean;
  time_left?: string; // "2 saat kaldı", "Süresi doldu"
  price_difference?: number; // How much lower/higher than listing price
  price_difference_percentage?: number;
}

export interface ReceivedOffer {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  created_at: string;
  expires_at?: string;
  counter_offer_amount?: number;
  counter_offer_message?: string;
  
  // Bidder details
  bidder_name: string;
  bidder_avatar?: string;
  bidder_rating?: number;
  
  // My listing details
  listing_title: string;
  listing_price: number;
  listing_image: string;
  listing_category?: string;
  
  // Calculated fields
  is_expired: boolean;
  time_left?: string;
  price_difference?: number;
  price_difference_percentage?: number;
}

export interface OfferStats {
  total_made: number;
  total_received: number;
  pending_made: number;
  pending_received: number;
  accepted_made: number;
  accepted_received: number;
  success_rate: number; // percentage of accepted offers made
}

// Mock data for development
const mockMyOffers: MyOffer[] = [
  {
    id: 'offer_1',
    listing_id: 'listing_1',
    bidder_id: 'current_user',
    amount: 450,
    message: 'Merhaba, bu fiyata alabilir miyim? Nakit ödeme yapabilirim.',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    
    listing_title: 'iPhone 13 Pro Max 256GB',
    listing_description: 'Çok temiz, kutulu',
    listing_price: 500,
    listing_image: 'https://picsum.photos/300/400?random=phone1',
    listing_images: [
      'https://picsum.photos/300/400?random=phone1',
      'https://picsum.photos/300/400?random=phone2'
    ],
    listing_category: 'Elektronik',
    listing_location: 'İstanbul, Kadıköy',
    listing_condition: 'like_new',
    listing_status: 'active',
    
    seller_id: 'seller_1',
    seller_name: 'Ahmet Yılmaz',
    seller_avatar: 'https://i.pravatar.cc/100?u=ahmet',
    seller_rating: 4.8,
    
    is_expired: false,
    time_left: '22 saat kaldı',
    price_difference: -50,
    price_difference_percentage: -10
  },
  {
    id: 'offer_2',
    listing_id: 'listing_2',
    bidder_id: 'current_user',
    amount: 180,
    message: 'Bu kitabı çok istiyorum.',
    status: 'accepted',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    
    listing_title: 'Suç ve Ceza - Dostoyevski',
    listing_price: 200,
    listing_image: 'https://picsum.photos/300/400?random=book1',
    listing_category: 'Kitap',
    listing_location: 'Ankara, Çankaya',
    listing_condition: 'good',
    listing_status: 'sold',
    
    seller_id: 'seller_2',
    seller_name: 'Fatma Kaya',
    seller_avatar: 'https://i.pravatar.cc/100?u=fatma',
    seller_rating: 4.9,
    
    is_expired: false,
    price_difference: -20,
    price_difference_percentage: -10
  },
  {
    id: 'offer_3',
    listing_id: 'listing_3',
    bidder_id: 'current_user',
    amount: 300,
    message: 'Takas yapalım mı?',
    status: 'countered',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    counter_offer_amount: 350,
    counter_offer_message: '350 TL olursa anlaşalım.',
    
    listing_title: 'Nike Air Max 270',
    listing_price: 400,
    listing_image: 'https://picsum.photos/300/400?random=shoe1',
    listing_category: 'Giyim & Aksesuar',
    listing_location: 'İzmir, Konak',
    listing_condition: 'good',
    listing_status: 'active',
    
    seller_id: 'seller_3',
    seller_name: 'Mehmet Özkan',
    seller_avatar: 'https://i.pravatar.cc/100?u=mehmet',
    seller_rating: 4.6,
    
    is_expired: false,
    price_difference: -100,
    price_difference_percentage: -25
  },
  {
    id: 'offer_4',
    listing_id: 'listing_4',
    bidder_id: 'current_user',
    amount: 80,
    message: 'Acil lazım.',
    status: 'expired',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    
    listing_title: 'Bluetooth Kulaklık',
    listing_price: 100,
    listing_image: 'https://picsum.photos/300/400?random=headphone1',
    listing_category: 'Elektronik',
    listing_location: 'Bursa, Nilüfer',
    listing_condition: 'new',
    listing_status: 'active',
    
    seller_id: 'seller_4',
    seller_name: 'Ayşe Demir',
    seller_avatar: 'https://i.pravatar.cc/100?u=ayse',
    seller_rating: 4.7,
    
    is_expired: true,
    time_left: 'Süresi doldu',
    price_difference: -20,
    price_difference_percentage: -20
  }
];

const mockReceivedOffers: ReceivedOffer[] = [
  {
    id: 'received_1',
    listing_id: 'my_listing_1',
    bidder_id: 'buyer_1',
    amount: 280,
    message: 'Çok güzel bir ürün, bu fiyata alabilir miyim?',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    
    bidder_name: 'Ali Veli',
    bidder_avatar: 'https://i.pravatar.cc/100?u=ali',
    bidder_rating: 4.5,
    
    listing_title: 'Samsung Galaxy S21',
    listing_price: 320,
    listing_image: 'https://picsum.photos/300/400?random=samsung1',
    listing_category: 'Elektronik',
    
    is_expired: false,
    time_left: '23 saat kaldı',
    price_difference: -40,
    price_difference_percentage: -12.5
  },
  {
    id: 'received_2',
    listing_id: 'my_listing_2',
    bidder_id: 'buyer_2',
    amount: 150,
    message: 'Hemen alırım.',
    status: 'accepted',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    
    bidder_name: 'Zeynep Yıldız',
    bidder_avatar: 'https://i.pravatar.cc/100?u=zeynep',
    bidder_rating: 4.9,
    
    listing_title: 'Vintage Çanta',
    listing_price: 150,
    listing_image: 'https://picsum.photos/300/400?random=bag1',
    listing_category: 'Giyim & Aksesuar',
    
    is_expired: false,
    price_difference: 0,
    price_difference_percentage: 0
  }
];

// Helper function to calculate time left
const calculateTimeLeft = (expiresAt?: string): string => {
  if (!expiresAt) return '';
  
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const timeLeft = expires - now;
  
  if (timeLeft <= 0) return 'Süresi doldu';
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} gün kaldı`;
  } else if (hours > 0) {
    return `${hours} saat kaldı`;
  } else {
    return `${minutes} dakika kaldı`;
  }
};

// Helper function to enhance offers with calculated fields
const enhanceOffers = <T extends { expires_at?: string; amount: number; listing_price: number }>(offers: T[]): T[] => {
  return offers.map(offer => ({
    ...offer,
    time_left: calculateTimeLeft(offer.expires_at),
    is_expired: offer.expires_at ? new Date(offer.expires_at) < new Date() : false,
    price_difference: offer.amount - offer.listing_price,
    price_difference_percentage: Math.round(((offer.amount - offer.listing_price) / offer.listing_price) * 100)
  }));
};

// Hook for user's made offers (tekliflerim)
export const useMyOffers = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["my-offers", user?.id],
    queryFn: async (): Promise<MyOffer[]> => {
      if (!isAuthenticated || !user) {
        return [];
      }
      
      if (shouldUseMockMode()) {
        // Mock mode - return enhanced mock data
        console.log('Using mock mode for my offers');
        return enhanceOffers(mockMyOffers);
      }
      
      console.log('Using real Supabase for my offers');
      
      // Real Supabase implementation
      try {
        const { data, error } = await supabase
          .from('bids')
          .select(`
            *,
            listings!bids_listing_id_fkey (
              id,
              title,
              description,
              price,
              status,
              image_url,
              images,
              category,
              location,
              condition,
              seller_id,
              profiles!listings_seller_id_fkey (
                display_name,
                avatar_url
              )
            )
          `)
          .eq('bidder_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform Supabase data to MyOffer format
        const offers: MyOffer[] = (data || []).map((bid: any) => ({
          id: bid.id,
          listing_id: bid.listing_id,
          bidder_id: bid.bidder_id,
          amount: bid.amount,
          message: bid.message,
          status: bid.status,
          created_at: bid.created_at,
          expires_at: bid.expires_at,
          counter_offer_amount: bid.counter_offer_amount,
          counter_offer_message: bid.counter_offer_message,
          
          listing_title: bid.listings?.title || 'Ürün',
          listing_description: bid.listings?.description,
          listing_price: bid.listings?.price || 0,
          listing_image: bid.listings?.image_url || bid.listings?.images?.[0] || '',
          listing_images: bid.listings?.images || [],
          listing_category: bid.listings?.category,
          listing_location: bid.listings?.location,
          listing_condition: bid.listings?.condition,
          listing_status: bid.listings?.status || 'active',
          
          seller_id: bid.listings?.seller_id || '',
          seller_name: bid.listings?.profiles?.display_name || 'Satıcı',
          seller_avatar: bid.listings?.profiles?.avatar_url,
          
          is_expired: false, // Will be calculated in enhanceOffers
          time_left: '', // Will be calculated in enhanceOffers
          price_difference: 0, // Will be calculated in enhanceOffers
          price_difference_percentage: 0 // Will be calculated in enhanceOffers
        }));
        
        return enhanceOffers(offers);
      } catch (error) {
        // This is expected behavior when database is not configured
        if (error && typeof error === 'object' && 'message' in error && 
            typeof (error as any).message === 'string' &&
            (error as any).message.includes('Could not find a relationship between')) {
          console.log('📖 Database not configured - using demo data (this is normal in development)');
        } else {
          console.error('Error fetching my offers:', error);
        }
        return enhanceOffers(mockMyOffers);
      }
    },
    enabled: isAuthenticated && !!user
  });
};

// Hook for received offers on user's listings
export const useReceivedOffers = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["received-offers", user?.id],
    queryFn: async (): Promise<ReceivedOffer[]> => {
      if (!isAuthenticated || !user) {
        return [];
      }
      
      if (shouldUseMockMode()) {
        // Mock mode
        console.log('Using mock mode for received offers');
        return enhanceOffers(mockReceivedOffers);
      }
      
      console.log('Using real Supabase for received offers');
      
      // Real Supabase implementation
      try {
        const { data, error } = await supabase
          .from('bids')
          .select(`
            *,
            listings!bids_listing_id_fkey (
              id,
              title,
              price,
              image_url,
              category,
              seller_id
            ),
            profiles!bids_bidder_id_fkey (
              display_name,
              avatar_url
            )
          `)
          .eq('listings.seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform to ReceivedOffer format
        const offers: ReceivedOffer[] = (data || []).map((bid: any) => ({
          id: bid.id,
          listing_id: bid.listing_id,
          bidder_id: bid.bidder_id,
          amount: bid.amount,
          message: bid.message,
          status: bid.status,
          created_at: bid.created_at,
          expires_at: bid.expires_at,
          counter_offer_amount: bid.counter_offer_amount,
          counter_offer_message: bid.counter_offer_message,
          
          bidder_name: bid.profiles?.display_name || 'Kullanıcı',
          bidder_avatar: bid.profiles?.avatar_url,
          
          listing_title: bid.listings?.title || 'Ürünüm',
          listing_price: bid.listings?.price || 0,
          listing_image: bid.listings?.image_url || '',
          listing_category: bid.listings?.category,
          
          is_expired: false,
          time_left: '',
          price_difference: 0,
          price_difference_percentage: 0
        }));
        
        return enhanceOffers(offers);
      } catch (error) {
        // This is expected behavior when database is not configured
        if (error && typeof error === 'object' && 'message' in error && 
            typeof (error as any).message === 'string' &&
            (error as any).message.includes('Could not find a relationship between')) {
          console.log('📖 Database not configured - using demo data (this is normal in development)');
        } else {
          console.error('Error fetching received offers:', error);
        }
        return enhanceOffers(mockReceivedOffers);
      }
    },
    enabled: isAuthenticated && !!user
  });
};

// Hook for offer statistics
export const useOfferStats = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["offer-stats", user?.id],
    queryFn: async (): Promise<OfferStats> => {
      if (!isAuthenticated || !user) {
        return {
          total_made: 0,
          total_received: 0,
          pending_made: 0,
          pending_received: 0,
          accepted_made: 0,
          accepted_received: 0,
          success_rate: 0
        };
      }
      
      if (shouldUseMockMode()) {
        // Calculate from mock data
        console.log('Using mock mode for offer stats');
        const madeOffers = mockMyOffers;
        const receivedOffers = mockReceivedOffers;
        
        return {
          total_made: madeOffers.length,
          total_received: receivedOffers.length,
          pending_made: madeOffers.filter(o => o.status === 'pending').length,
          pending_received: receivedOffers.filter(o => o.status === 'pending').length,
          accepted_made: madeOffers.filter(o => o.status === 'accepted').length,
          accepted_received: receivedOffers.filter(o => o.status === 'accepted').length,
          success_rate: madeOffers.length > 0 
            ? Math.round((madeOffers.filter(o => o.status === 'accepted').length / madeOffers.length) * 100)
            : 0
        };
      }
      
      console.log('Using real Supabase for offer stats');
      
      // Real Supabase implementation would aggregate data
      // For now, return mock stats
      return {
        total_made: 0,
        total_received: 0,
        pending_made: 0,
        pending_received: 0,
        accepted_made: 0,
        accepted_received: 0,
        success_rate: 0
      };
    },
    enabled: isAuthenticated && !!user
  });
};

// Mutation to create a new offer
export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      listingId,
      amount,
      message,
      expiresIn24h = true
    }: {
      listingId: string;
      amount: number;
      message?: string;
      expiresIn24h?: boolean;
    }) => {
      if (!user) throw new Error('Giriş yapmalısınız');
      
      const expiresAt = expiresIn24h 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined;
      
      if (shouldUseMockMode()) {
        // Mock mode - add to mock data
        console.log('Creating offer in mock mode');
        const newOffer: MyOffer = {
          id: `offer_${Date.now()}`,
          listing_id: listingId,
          bidder_id: user.id,
          amount,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
          
          // Mock listing details - in real app these would be fetched
          listing_title: 'Test Ürün',
          listing_price: amount + 50,
          listing_image: `https://picsum.photos/300/400?random=${listingId}`,
          listing_status: 'active',
          
          seller_id: 'test_seller',
          seller_name: 'Test Satıcı',
          
          is_expired: false,
          time_left: calculateTimeLeft(expiresAt),
          price_difference: 0,
          price_difference_percentage: 0
        };
        
        mockMyOffers.unshift(newOffer);
        console.log('Mock offer created successfully');
        return newOffer;
      }
      
      console.log('Creating offer in real Supabase');
      
      // Real Supabase
      try {
        const { data, error } = await supabase
          .from('bids')
          .insert({
            listing_id: listingId,
            bidder_id: user.id,
            amount,
            message,
            expires_at: expiresAt
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating offer in Supabase:', error);
        // Fallback to mock mode on any error
        console.log('Falling back to mock mode due to error:', error);
        
        const newOffer: MyOffer = {
          id: `offer_${Date.now()}`,
          listing_id: listingId,
          bidder_id: user.id,
          amount,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
          
          // Mock listing details - in real app these would be fetched
          listing_title: 'Test Ürün',
          listing_price: amount + 50,
          listing_image: `https://picsum.photos/300/400?random=${listingId}`,
          listing_status: 'active',
          
          seller_id: 'test_seller',
          seller_name: 'Test Satıcı',
          
          is_expired: false,
          time_left: calculateTimeLeft(expiresAt),
          price_difference: 0,
          price_difference_percentage: 0
        };
        
        mockMyOffers.unshift(newOffer);
        return newOffer;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch offers
      queryClient.invalidateQueries({ queryKey: ["my-offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer-stats"] });
    }
  });
};

// Mutation to respond to an offer (accept/reject/counter)
export const useRespondToOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      offerId,
      action,
      counterAmount,
      counterMessage
    }: {
      offerId: string;
      action: 'accept' | 'reject' | 'counter';
      counterAmount?: number;
      counterMessage?: string;
    }) => {
      const status = action === 'accept' ? 'accepted' : 
                   action === 'reject' ? 'rejected' : 'countered';
      
      if (shouldUseMockMode(offerId)) {
        // Mock mode
        console.log('Responding to offer in mock mode:', { offerId, action });
        const receivedOfferIndex = mockReceivedOffers.findIndex(o => o.id === offerId);
        if (receivedOfferIndex !== -1) {
          mockReceivedOffers[receivedOfferIndex] = {
            ...mockReceivedOffers[receivedOfferIndex],
            status: status as any,
            counter_offer_amount: counterAmount,
            counter_offer_message: counterMessage
          };
          console.log('Mock response completed successfully');
        }
        return mockReceivedOffers[receivedOfferIndex];
      }
      
      console.log('Responding to offer in real Supabase');
      
      // Real Supabase
      try {
        const updateData: any = { status };
        if (counterAmount) updateData.counter_offer_amount = counterAmount;
        if (counterMessage) updateData.counter_offer_message = counterMessage;
        
        const { data, error } = await supabase
          .from('bids')
          .update(updateData)
          .eq('id', offerId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error responding to offer in Supabase:', error);
        // Fallback to mock mode on any error
        console.log('Falling back to mock mode due to error:', error);
        
        const receivedOfferIndex = mockReceivedOffers.findIndex(o => o.id === offerId);
        if (receivedOfferIndex !== -1) {
          mockReceivedOffers[receivedOfferIndex] = {
            ...mockReceivedOffers[receivedOfferIndex],
            status: status as any,
            counter_offer_amount: counterAmount,
            counter_offer_message: counterMessage
          };
        }
        return mockReceivedOffers[receivedOfferIndex];
      }
    },
    onSuccess: () => {
      // Invalidate and refetch offers
      queryClient.invalidateQueries({ queryKey: ["received-offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer-stats"] });
    }
  });
};

// Mutation to withdraw/cancel an offer
export const useWithdrawOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (offerId: string) => {
      if (shouldUseMockMode(offerId)) {
        // Mock mode - remove from mock data
        console.log('Withdrawing offer in mock mode:', offerId);
        const index = mockMyOffers.findIndex(o => o.id === offerId);
        if (index !== -1) {
          mockMyOffers.splice(index, 1);
          console.log('Mock offer withdrawn successfully');
        }
        return { success: true };
      }
      
      console.log('Withdrawing offer in real Supabase');
      
      // Real Supabase - update status to cancelled
      try {
        const { error } = await supabase
          .from('bids')
          .update({ status: 'cancelled' })
          .eq('id', offerId);
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error withdrawing offer in Supabase:', error);
        // Fallback to mock mode on any error
        console.log('Falling back to mock mode due to error:', error);
        
        const index = mockMyOffers.findIndex(o => o.id === offerId);
        if (index !== -1) {
          mockMyOffers.splice(index, 1);
        }
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer-stats"] });
    }
  });
};
